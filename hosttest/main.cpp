/*
 * Host-side test harness for the puvoice SAM engine.
 * Compiles the sam engine sources natively and exercises the same window-buffering and
 * text preprocessing used by voice.cpp on the micro:bit.
 *
 * Build:  make
 * Run:    ./puvoice            -> writes out.wav
 */

#include <cstdio>
#include <cstring>
#include <cstdint>
#include "../sam/sam.h"
#include "../sam/render.h"
#include "../sam/reciter.h"

// --- minimal wav writer -----------------------------------------------------
static FILE *wav = NULL;
static long wavDataLen = 0;

static void wavOpen(const char *name, int sampleRate) {
    wav = fopen(name, "wb");
    // header patched on close
    fwrite("RIFF", 1, 4, wav);
    uint32_t sz = 36; fwrite(&sz, 4, 1, wav);
    fwrite("WAVEfmt ", 1, 8, wav);
    uint32_t fmtLen = 16; fwrite(&fmtLen, 4, 1, wav);
    uint16_t fmt = 1, ch = 1; fwrite(&fmt, 2, 1, wav); fwrite(&ch, 2, 1, wav);
    uint32_t rate = sampleRate; fwrite(&rate, 4, 1, wav);
    uint32_t byteRate = sampleRate; fwrite(&byteRate, 4, 1, wav);
    uint16_t align = 1, bits = 8; fwrite(&align, 2, 1, wav); fwrite(&bits, 2, 1, wav);
    fwrite("data", 1, 4, wav);
    uint32_t zero = 0; fwrite(&zero, 4, 1, wav);
}
static void wavByte(uint8_t b) { fputc(b, wav); wavDataLen++; }
static void wavClose() {
    fseek(wav, 4, SEEK_SET);
    uint32_t riff = 36 + wavDataLen; fwrite(&riff, 4, 1, wav);
    fseek(wav, 40, SEEK_SET);
    uint32_t d = wavDataLen; fwrite(&d, 4, 1, wav);
    fclose(wav);
}

// --- same digit expansion as voice.cpp --------------------------------------
static int expandDigits(char *dst, const char *src, int dstLen) {
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
            if (out + wl > dstLen - 1) return -1;
            memcpy(dst + out, w, wl); out += wl;
        } else if (c == '.' && src[i + 1] >= '0' && src[i + 1] <= '9') {
            if (out + 6 > dstLen - 1) return -1;
            memcpy(dst + out, " POINT", 6); out += 6;
        } else {
            if (out + 1 > dstLen - 1) return -1;
            dst[out++] = (c >= 'a' && c <= 'z') ? c - 32 : c;
        }
    }
    dst[out] = 0;
    return out;
}

// --- same windowing algorithm as voice.cpp ----------------------------------
#define WINDOW_SIZE 4096
#define SILENCE 128
static uint8_t window[WINDOW_SIZE];
static int windowFill = 0;
static unsigned int windowBase = 0;
static long totalSamples = 0;

static void streamReset() {
    windowBase = 0; windowFill = 0;
    memset(window, SILENCE, WINDOW_SIZE);
}
static void streamFlush(int length) {
    for (int i = 0; i < length; i++) wavByte(window[i]);
    totalSamples += length;
    windowBase += WINDOW_SIZE;
    windowFill = 0;
    memset(window, SILENCE, WINDOW_SIZE);
}

namespace puvoice {
    int debug = 0;
    void SamOutputByte(unsigned int pos, unsigned char value) {
        while (pos >= windowBase + WINDOW_SIZE)
            streamFlush(WINDOW_SIZE);
        int offset = (int)pos - (int)windowBase;
        if (offset < 0) return;
        if (offset < WINDOW_SIZE) {
            window[offset] = value;
            if (offset + 1 > windowFill) windowFill = offset + 1;
        }
    }
}

using namespace puvoice;

static int say(const char *text, int mode) {
    char input[256];
    memset(input, ' ', sizeof(input));
    if (mode == 1) {
        int length = strlen(text);
        if (length > 255) length = 255;
        memcpy(input, text, length);
        input[length] = (char)0x9b;
    } else {
        int length = expandDigits(input, text, 253);
        if (length < 0) { printf("expandDigits overflow\n"); return 0; }
        printf("expanded: %s\n", input);
        input[length] = '[';
        input[length + 1] = 0;
        if (TextToPhonemes((unsigned char *)input) == 0) {
            printf("TextToPhonemes failed\n");
            return 0;
        }
        printf("phonemes: ");
        for (int i = 0; (unsigned char)input[i] != 0x9b && i < 255; i++)
            printf("%c", input[i] ? input[i] : '?');
        printf("\n");
    }

    SetSingmode(mode == 2 ? 1 : 0);
    SetSpeed(72); SetPitch(64); SetMouth(128); SetThroat(128);
    streamReset();
    SetInput(input);
    if (SAMMain() == 0) { printf("SAMMain failed\n"); return 0; }
    for (int i = 0; i < windowFill; i++) wavByte(window[i]);
    totalSamples += windowFill;
    windowFill = 0;
    return 1;
}

int main() {
    wavOpen("out.wav", 22050);

    printf("--- say: hello world ---\n");
    say("Hello, I am Robot P U", 0);
    printf("--- say: digits ---\n");
    say("I can count to 5. 1 2 3 4 5", 0);
    printf("--- phonemes ---\n");
    say("AY4 AEM AH KUMPYUW3TER", 1);
    printf("--- sing ---\n");
    say("daisy daisy", 2);

    wavClose();
    printf("total samples: %ld (%.2f s)\n", totalSamples, totalSamples / 22050.0);
    return 0;
}
