// Check every stretched syllable the happy-birthday song produces.
#include <cstdio>
#include <cstring>
#include <cstdint>
#include "../sam/sam.h"
#include "../sam/render.h"

namespace puvoice {
    int debug = 0;
    volatile bool renderAborted = false;
    static long samples = 0;
    void SamOutputByte(unsigned int pos, unsigned char value) {
        if (value != 128) samples++;
    }
}

using namespace puvoice;

static const char *DIGRAPHS[] = {
    "IY","IH","EH","AE","AA","AH","AO","UH","AX","IX","ER",
    "UX","OH","RX","LX","WX","YX","WH","NX","DX","SH","TH",
    "ZH","DH","CH","EY","AY","OY","AW","OW","UW","GX","KX",
    "UL","UM","UN"
};

// mirror of the new stretchSyllable() in main.ts
static void stretch(char *out, const char *syllable, int hold) {
    char rest[64], suffix[64], tail[4];
    strcpy(rest, syllable); suffix[0] = 0; tail[0] = 0;
    while (strlen(rest) > 0 && tail[0] == 0) {
        int n = strlen(rest);
        char last = rest[n - 1];
        char pair[3] = "";
        if (n > 1) { pair[0] = rest[n-2]; pair[1] = last; pair[2] = 0; }
        if (strchr("WYRLMN", last)) {
            tail[0] = last; tail[1] = 0;
        } else {
            bool isDg = false;
            for (unsigned i = 0; i < sizeof(DIGRAPHS)/sizeof(*DIGRAPHS); i++)
                if (pair[0] && strcmp(DIGRAPHS[i], pair) == 0) isDg = true;
            if (isDg) { strcpy(tail, pair); }
            else {
                memmove(suffix + 1, suffix, strlen(suffix) + 1);
                suffix[0] = last;
                rest[n - 1] = 0;
            }
        }
    }
    if (tail[0] == 0) {
        strcpy(rest, syllable); suffix[0] = 0;
        tail[0] = syllable[strlen(syllable) - 1]; tail[1] = 0;
    }
    strcpy(out, rest);
    for (int i = 0; i < hold; i++) strcat(out, tail);
    strcat(out, suffix);
}

static int test(const char *phonemes) {
    char input[256];
    memset(input, ' ', sizeof(input));
    int len = strlen(phonemes);
    memcpy(input, phonemes, len);
    input[len] = (char)0x9b;
    SetSingmode(1);
    SetSpeed(72); SetPitch(64); SetMouth(128); SetThroat(128);
    SetInput(input);
    samples = 0;
    int ok = SAMMain();
    printf("%-18s -> %s, non-silent: %ld\n", phonemes, ok ? "OK" : "FAILED", samples);
    return ok;
}

int main() {
    const char *syll[] = {"/HAE","PIY","BERTH","DEY","TUW","YUW","DIYR","ROW","BAAT"};
    int holds[]      = {   1,    1,      4,    4,    4,    8,     4,    2,    2};
    int fails = 0;
    char buf[128];
    for (int i = 0; i < 9; i++) {
        stretch(buf, syll[i], holds[i]);
        char p[160];
        snprintf(p, sizeof(p), "#77%s", buf);
        if (!test(p)) fails++;
    }
    printf(fails ? "FAIL: %d syllable(s) dropped\n" : "PASS: all syllables render\n", fails);
    return fails;
}
