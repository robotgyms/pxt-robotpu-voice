/*
 * MIT License
 *
 * Copyright (c) 2026 RobotGyms
 * Driver architecture Copyright (c) 2026 RobotGyms
 * Based on ideas from pxt-billy Copyright (c) 2023 Adam Granger
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

#ifndef PUVOICE_H
#define PUVOICE_H

#include "MicroBit.h"
#include "MicroBitConfig.h"
#include "MemorySource.h"
#include "sam/render.h"
#include "sam/sam.h"
#include "sam/reciter.h"

namespace puvoice {

/*
 * Utterance modes.
 */
#define PUVOICE_MODE_SAY        0   // English text -> reciter -> SAM
#define PUVOICE_MODE_PHONEMES   1   // raw SAM phoneme string
#define PUVOICE_MODE_SING       2   // English text -> reciter -> SAM sing mode
#define PUVOICE_MODE_SING_PHONEMES 3 // raw phonemes + '#nnn' pitch markers, sing mode
#define PUVOICE_MODE_SILENCE    4   // timed rest; text holds the duration in ms

/*
 * Message bus event source/value emitted by this extension.
 * Source id spells "PU" in hex (0x5055) so it does not collide with
 * micro:bit component ids or other extensions.
 */
#define PUVOICE_EVENT_ID        0x5055
#define PUVOICE_EVT_DONE        1   // queue drained and playback finished
#define PUVOICE_EVT_ERROR       2   // an utterance failed to render

#define PUVOICE_SAMPLE_RATE     22050
#define PUVOICE_WINDOW_SIZE     4096
#define PUVOICE_QUEUE_DEPTH     32  // a full song is ~27 queued utterances
#define PUVOICE_MAX_TEXT        90  // reciter output saturates around 120 phonemes

#define PUVOICE_SILENCE         128 // mid-rail value for 8-bit unsigned samples

class PuVoice {
    MemorySource *sampleSource;
    MixerChannel *channel;

    // Current output window. The SAM renderer can write samples slightly
    // out of order (it writes a few samples ahead of its position counter),
    // so samples are collected into a fixed window indexed by position.
    uint8_t window[PUVOICE_WINDOW_SIZE];
    int windowFill;                 // bytes in window holding valid data
    unsigned int windowBase;        // sample index of window[0]

    int speed;
    int pitch;
    int mouth;
    int throat;
    int singTempo;                  // percent; 0 = sing at the voice's own speed

    bool started;                   // mixer channel created
    volatile bool speaking;         // an utterance is being rendered/played
    volatile bool cancelled;        // stop() requested

    void streamReset();
    void streamFlush(int length);
public:
    PuVoice();

    void ensureStarted();
    void setVoice(int speed, int pitch, int mouth, int throat);
    void setSingTempo(int tempoPercent) { singTempo = tempoPercent; }
    void beginUtterance() { speaking = true; cancelled = false; }
    bool speakNow(const char *text, int mode);
    void outputByte(unsigned int pos, unsigned char value);
    void finishUtterance();
    void powerDown();

    bool isSpeaking() { return speaking; }
    void requestCancel() { cancelled = true; }
};

// Expand digits in English text into words the reciter can pronounce
// (e.g. "level 3" -> "LEVEL THREE"). Returns bytes written, or -1 if the
// result would not fit.
int expandDigits(char *dst, const char *src, int dstLen);

// The single voice engine instance (defined in voice.cpp).
extern PuVoice voice;

// Utterance queue drained by the background worker fiber.
bool enqueueUtterance(int mode, const char *text);
int queuedUtterances();
void clearQueue();
void ensureWorker();
bool voiceBusy();

// Called by the legacy SAM renderer for every output sample.
void SamOutputByte(unsigned int pos, unsigned char value);

}

#endif
