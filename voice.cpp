/*
 * MIT License
 *
 * Copyright (c) 2026 RobotGyms
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE. */

#include "pxt.h"
#include "voice.h"
#include <string.h>
#include <stdlib.h>

namespace puvoice {

PuVoice voice;

// referenced by the sam engine sources (sam/debug.cpp)
int debug = 0;

// ---------------------------------------------------------------------------
// Utterance queue
// ---------------------------------------------------------------------------

struct Utterance {
    uint8_t mode;
    char text[PUVOICE_MAX_TEXT + 2];
};

static Utterance utteranceQueue[PUVOICE_QUEUE_DEPTH];
static volatile int qHead = 0;  // next write position (producer)
static volatile int qTail = 0;  // next read position (consumer)
static volatile bool workerStarted = false;
// Bumped by clearQueue() so a producer blocked on a full queue notices that
// its pending utterance belongs to a cancelled batch and drops it.
static volatile unsigned queueGeneration = 0;

// The reciter globals live in file scope, so TextToPhonemes must be
// serialized across fibers (worker vs toPhonemesShim callers).
static volatile int reciterLock = 0;

bool reciterTryLock() {
    return __sync_bool_compare_and_swap(&reciterLock, 0, 1);
}

void reciterUnlock() {
    __sync_lock_release(&reciterLock);
}

volatile bool renderAborted = false;

bool enqueueUtterance(int mode, const char *text) {
    ensureWorker();
    // If the queue is full, wait for the worker to drain a slot rather than
    // dropping the utterance - silent loss made long programs (e.g. a song
    // of 25 queued notes) stop playing after the first few items. The wait
    // only kicks in beyond PUVOICE_QUEUE_DEPTH-1 pending items, so ordinary
    // "speak in the background" use still returns immediately.
    // The claim, fill and publish run with interrupts off: several fibers
    // can enqueue at once, and a producer must never be preempted between
    // filling a slot and publishing it.
    unsigned gen = queueGeneration;
    while (true) {
        target_disable_irq();
        bool stale = (queueGeneration != gen);
        int next = (qHead + 1) % PUVOICE_QUEUE_DEPTH;
        bool full = (next == qTail);
        if (!stale && !full) {
            Utterance &u = utteranceQueue[qHead];
            u.mode = mode;
            strncpy(u.text, text, PUVOICE_MAX_TEXT);
            u.text[PUVOICE_MAX_TEXT] = 0;
            qHead = next;
        }
        target_enable_irq();
        if (stale)
            return false;
        if (!full)
            return true;
        fiber_sleep(10);
    }
}

int queuedUtterances() {
    target_disable_irq();
    int n = qHead - qTail;
    target_enable_irq();
    return n < 0 ? n + PUVOICE_QUEUE_DEPTH : n;
}

void clearQueue() {
    target_disable_irq();
    qHead = qTail = 0;
    queueGeneration++;
    target_enable_irq();
}

bool voiceBusy() {
    return voice.isSpeaking() || queuedUtterances() > 0;
}

// ---------------------------------------------------------------------------
// Voice engine driver
// ---------------------------------------------------------------------------

/**
 * Convert ASCII digits to number words so the reciter can pronounce them.
 * The 1982 reciter rules only cover letters - plain digits are silent.
 * "42" becomes "FOUR TWO"; a '.' between digits becomes "POINT".
 * Output is upper case, terminated, and always <= dstLen-1 bytes.
 */
int expandDigits(char *dst, const char *src, int dstLen) {
    static const char *words[] = {
        " ZERO", " ONE", " TWO", " THREE", " FOUR",
        " FIVE", " SIX", " SEVEN", " EIGHT", " NINE"
    };
    int out = 0;
    for (int i = 0; src[i] != 0; i++) {
        char c = src[i];
        if (c >= '0' && c <= '9') {
            const char *w = words[c - '0'];
            int wl = strlen(w);
            if (out + wl > dstLen - 1)
                return -1;
            memcpy(dst + out, w, wl);
            out += wl;
        } else if (c == '.' && src[i + 1] >= '0' && src[i + 1] <= '9') {
            if (out + 6 > dstLen - 1)
                return -1;
            memcpy(dst + out, " POINT", 6);
            out += 6;
        } else {
            if (out + 1 > dstLen - 1)
                return -1;
            // A run of '.' reaches the engine as several pause phonemes in
            // a row, which truncates the render - collapse to one pause.
            if (c == '.' && out > 0 && dst[out - 1] == '.')
                continue;
            dst[out++] = (c >= 'a' && c <= 'z') ? c - 32 : c;
        }
    }
    dst[out] = 0;
    return out;
}

/**
 * Copy a raw phoneme string into dst, keeping only characters the 1982
 * parser understands: phoneme letters, space, the pause signs (. , ? -),
 * '/' and '*' prefixes, '#' pitch markers, and digits (stress marks).
 * Any other character makes SAMMain fail and the whole utterance is
 * silently dropped, so it is stripped here. Runs of '.' collapse to a
 * single pause for the same reason as in expandDigits. Returns bytes
 * written, always <= dstLen-1.
 */
int sanitizePhonemes(char *dst, const char *src, int dstLen) {
    int out = 0;
    bool pitchMarker = false;  // inside a '#nnn' pitch number
    for (int i = 0; src[i] != 0 && out < dstLen - 1; i++) {
        char c = src[i];
        if (c >= 'a' && c <= 'z')
            c -= 32;
        if (c == '#') {
            pitchMarker = true;
        } else if (c < '0' || c > '9') {
            pitchMarker = false;
        }
        bool ok = (c >= 'A' && c <= 'Z') ||
                  c == ' ' || c == '.' || c == ',' || c == '?' ||
                  c == '-' || c == '/' || c == '*' || c == '#' ||
                  (pitchMarker && c >= '0' && c <= '9') ||
                  (c >= '1' && c <= '8');  // stress marks; '0'/'9' are only
        if (!ok)                           // legal inside '#' pitch numbers
            continue;
        if (c == '.' && out > 0 && dst[out - 1] == '.')
            continue;
        dst[out++] = c;
    }
    dst[out] = 0;
    return out;
}

PuVoice::PuVoice() {
    sampleSource = NULL;
    channel = NULL;
    started = false;
    speaking = false;
    cancelled = false;
    speed = 72;
    pitch = 64;
    mouth = 128;
    throat = 128;
    singTempo = 0;
    windowFill = 0;
    windowBase = 0;
}

void PuVoice::ensureStarted() {
    // Wake the audio pipeline. requestActivation() re-creates the PWM and
    // reconnects the speaker / edge connector pin if the pipeline was asleep.
    uBit.audio.setSleep(false);
    uBit.audio.requestActivation();
    if (!started) {
        sampleSource = new MemorySource();
        sampleSource->setFormat(DATASTREAM_FORMAT_8BIT_UNSIGNED);
        sampleSource->setBufferSize(PUVOICE_WINDOW_SIZE);
        channel = uBit.audio.mixer.addChannel(*sampleSource, PUVOICE_SAMPLE_RATE, 255);
        started = true;
    }
}

void PuVoice::setVoice(int s, int p, int m, int t) {
    speed = s;
    pitch = p;
    mouth = m;
    throat = t;
}

void PuVoice::streamReset() {
    windowBase = 0;
    windowFill = 0;
    memset(window, PUVOICE_SILENCE, PUVOICE_WINDOW_SIZE);
}

void PuVoice::streamFlush(int length) {
    if (length <= 0 || cancelled)
        return;
    // play() blocks this fiber until the whole buffer has been consumed by the
    // mixer, which naturally paces the renderer at the audio rate.
    sampleSource->play(window, length);
    windowBase += PUVOICE_WINDOW_SIZE;
    windowFill = 0;
    memset(window, PUVOICE_SILENCE, PUVOICE_WINDOW_SIZE);
}

void PuVoice::outputByte(unsigned int pos, unsigned char value) {
    if (cancelled)
        return;

    // The renderer may emit positions that jump forward across a window
    // boundary; flush complete windows as needed.
    while (pos >= windowBase + PUVOICE_WINDOW_SIZE)
        streamFlush(PUVOICE_WINDOW_SIZE);

    int offset = (int)pos - (int)windowBase;
    if (offset < 0)
        return; // belongs to a window that was already played
    if (offset < PUVOICE_WINDOW_SIZE) {
        window[offset] = value;
        if (offset + 1 > windowFill)
            windowFill = offset + 1;
    }
}

/**
 * Render one utterance end to end. Runs on the worker fiber.
 * Returns false if the text could not be converted/rendered.
 */
bool PuVoice::speakNow(const char *text, int mode) {
    ensureStarted();

    if (mode == PUVOICE_MODE_SILENCE) {
        // A rest: stream pure silence for the requested duration. play()
        // blocks until the mixer has consumed each window, so the rest is
        // paced in real time and stays in sequence with queued speech.
        long remaining = ((long)atoi(text) * PUVOICE_SAMPLE_RATE) / 1000;
        while (remaining > 0 && !cancelled) {
            int chunk = remaining > PUVOICE_WINDOW_SIZE ? PUVOICE_WINDOW_SIZE : (int)remaining;
            memset(window, PUVOICE_SILENCE, chunk);
            sampleSource->play(window, chunk);
            remaining -= chunk;
        }
        return true;
    }

    // engine input buffer
    char input[256];
    memset(input, ' ', sizeof(input));

    if (mode == PUVOICE_MODE_PHONEMES || mode == PUVOICE_MODE_SING_PHONEMES) {
        // raw phoneme input; engine wants the 0x9b end marker
        int length = sanitizePhonemes(input, text, 255);
        input[length] = (char)0x9b;
    } else {
        // English text: spell out digits, normalise to upper case, then run
        // the reciter which requires '[' as its end-of-input marker.
        int length = expandDigits(input, text, 253);
        if (length < 0)
            return false;
        input[length] = '[';
        input[length + 1] = 0;
        while (!reciterTryLock())
            fiber_sleep(5);
        int ok = TextToPhonemes((unsigned char *)input);
        reciterUnlock();
        if (ok == 0)
            return false;
    }

    // The reciter leaves no NUL terminator and the buffer is space-padded,
    // so bound SetInput's strlen before it can run off the end.
    input[255] = 0;

    int singing = (mode == PUVOICE_MODE_SING || mode == PUVOICE_MODE_SING_PHONEMES);
    SetSingmode(singing ? 1 : 0);
    // Singing tempo is independent from talking speed: tempo 100 keeps the
    // voice's own speed, 200 doubles it, 50 halves it (SAM speed is inverse:
    // smaller value = faster).
    int s = speed;
    if (singing && singTempo > 0) {
        s = speed * 100 / singTempo;
        if (s < 1) s = 1;
        if (s > 255) s = 255;
    }
    SetSpeed(s);
    SetPitch(pitch);
    SetMouth(mouth);
    SetThroat(throat);

    streamReset();
    SetInput(input);
    if (SAMMain() == 0)
        return false;

    // flush the partial tail of the last window
    if (windowFill > 0 && !cancelled)
        sampleSource->play(window, windowFill);
    windowFill = 0;
    return true;
}

/**
 * Put the audio pipeline to sleep once nothing is playing.
 *
 * This is the key difference from pxt-billy: billy activates the mixer once
 * and leaves it running forever, so the PWM output on pin 0 keeps toggling
 * into the Robot PU amplifier - wasting battery and heating the speaker.
 * Here the whole pipeline (PWM + both output pins) is torn down as soon as
 * the last sample has finished playing.
 */
void PuVoice::powerDown() {
    // Wait briefly for the last samples to play out, but never stall the
    // worker: if user code keeps other audio (e.g. music) playing, the mixer
    // never reports silence and it is their sound keeping the amp busy.
    for (int i = 0; i < 200 && uBit.audio.isPlaying(); i++)
        fiber_sleep(10);
    if (!uBit.audio.isPlaying())
        uBit.audio.setSleep(true);
}

/**
 * Called by the worker fiber after an utterance completes.
 */
void PuVoice::finishUtterance() {
    speaking = false;
    cancelled = false;
}

// ---------------------------------------------------------------------------
// Worker fiber
// ---------------------------------------------------------------------------

static void voiceWorker(void *) {
    while (true) {
        // Dequeue and mark the engine busy in one critical section: the slot
        // must be fully written before it is visible, and isSpeaking must
        // not flicker false between dequeue and render.
        Utterance u;
        target_disable_irq();
        bool empty = (qHead == qTail);
        if (!empty) {
            u = utteranceQueue[qTail];
            qTail = (qTail + 1) % PUVOICE_QUEUE_DEPTH;
            voice.beginUtterance();
        }
        target_enable_irq();
        if (empty) {
            fiber_sleep(10);
            continue;
        }

        if (u.mode == PUVOICE_MODE_POWERDOWN) {
            // Queued via the powerDownAudio block - serialized here so the
            // pipeline can never be slept underneath an active render.
            voice.powerDown();
        } else if (!voice.speakNow(u.text, u.mode)) {
            MicroBitEvent evt(PUVOICE_EVENT_ID, PUVOICE_EVT_ERROR);
        }

        // When the queue has fully drained, wait for the last samples to play
        // out and then power the audio pipeline down so pin 0 stops driving
        // the amplifier. speaking stays set through the tail so that
        // isSpeaking/sayAndWait only report done once playback is over.
        if (qHead == qTail) {
            voice.powerDown();
            voice.finishUtterance();
            MicroBitEvent evt(PUVOICE_EVENT_ID, PUVOICE_EVT_DONE);
        } else {
            voice.finishUtterance();
        }
    }
}

void ensureWorker() {
    target_disable_irq();
    bool start = !workerStarted;
    workerStarted = true;
    target_enable_irq();
    if (start)
        create_fiber(voiceWorker, NULL);
}

// ---------------------------------------------------------------------------
// Engine output callback (called from sam/render.cpp)
// ---------------------------------------------------------------------------

void SamOutputByte(unsigned int pos, unsigned char value) {
    voice.outputByte(pos, value);
}

}
