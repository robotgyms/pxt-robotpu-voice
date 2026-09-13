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

using namespace pxt;

namespace puvoice {

/**
 *
 */
//%
void sayShim(String text) {
    enqueueUtterance(PUVOICE_MODE_SAY, text->getUTF8Data());
}

/**
 *
 */
//%
void pronounceShim(String phonemes) {
    enqueueUtterance(PUVOICE_MODE_PHONEMES, phonemes->getUTF8Data());
}

/**
 *
 */
//%
void singShim(String text) {
    enqueueUtterance(PUVOICE_MODE_SING, text->getUTF8Data());
}

/**
 *
 */
//%
void setVoiceShim(int speed, int pitch, int mouth, int throat) {
    voice.setVoice(speed, pitch, mouth, throat);
}

/**
 *
 */
//%
void stopShim() {
    clearQueue();
    voice.requestCancel();
}

/**
 *
 */
//%
bool isBusyShim() {
    return voiceBusy();
}

/**
 *
 */
//%
void setVolumeShim(int volume) {
    if (volume < 0) volume = 0;
    if (volume > 255) volume = 255;
    uBit.audio.setVolume(volume);
}

/**
 *
 */
//%
void setSpeakerEnabledShim(bool on) {
    uBit.audio.setSpeakerEnabled(on);
}

/**
 *
 */
//%
void setAudioPinEnabledShim(bool on) {
    uBit.audio.setPinEnabled(on);
}

/**
 *
 */
//%
void powerDownShim() {
    voice.powerDown();
}

/**
 * Convert English text to a SAM phoneme string without speaking it.
 * Returns an empty string while speech is in progress (the reciter shares
 * state with the renderer and cannot run concurrently).
 */
/**
 *
 */
//%
String toPhonemesShim(String text) {
    if (voiceBusy())
        return mkString("", 0);

    char input[256];
    int length = expandDigits(input, text->getUTF8Data(), 253);
    if (length < 0)
        return mkString("", 0);
    input[length] = '[';
    input[length + 1] = 0;
    if (TextToPhonemes((unsigned char *)input) == 0)
        return mkString("", 0);

    // reciter output ends with the 0x9b marker; cut the string there
    int outLen = 0;
    while (outLen < 255 && (unsigned char)input[outLen] != 0x9b)
        outLen++;
    return mkString(input, outLen);
}

}
