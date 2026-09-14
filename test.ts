/*
 * Compile test for pxt-robotpu-voice.
 * On hardware, press button A to cycle through the tests and listen to pin 0
 * (Robot PU speaker) or the on-board speaker.
 *
 * Expected results per test:
 *  0: Robot PU voice says "Hello, I am Robot P U" (default voice).
 *  1: Same sentence in the higher, faster "little robot" voice.
 *  2: Says "I can count to 5. 1 2 3 4 5" - digits are spoken as numbers
 *     ("one two three four five"), and sayAndWait blocks until done.
 *  3: Very fast speech (speed 220) - noticeably quicker than test 2.
 *  4: Dalek voice says "EXTERMINATE" - low, harsh, slow.
 *  5: Raw phonemes: says "I am a computer" in the plain SAM voice.
 *  6: Sing mode chants "daisy daisy" on a flat pitch.
 *  7: Pitch-marked phonemes sing the Do-Re-Mi scale, each note rising.
 *  8: Four singNote calls: doe - mee - soh - doe (C4 E4 G4 C5).
 *  9: "first sentence", "second sentence" play; the third queued
 *     utterance is cleared by stop speaking and never heard.
 * 10: Prints "RAA1BAAT" (or similar phoneme spelling) over serial.
 * 11: "wait for it", exactly 1 second of silence, then "done waiting" -
 *     the rest stays queued in sequence with the speech.
 * 12: doe - rest - soh using singRest: the silence is measured in beats,
 *     so it scales with the sung notes (singNote(SingNote.Rest) works too).
 *
 * While any test runs, LED (0,0) is lit via isSpeaking; when speech
 * finishes, a checkmark appears via onSpeechFinished.
 */
let testNumber = 0

input.onButtonPressed(Button.A, function () {
    basic.showNumber(testNumber)
    switch (testNumber) {
        case 0:
            // expect: "Hello, I am Robot P U" in the default Robot PU voice
            robotpuVoice.say("Hello, I am Robot P U")
            break
        case 1:
            // expect: same greeting, higher pitch and faster (little robot)
            robotpuVoice.setVoice(VoicePreset.LittleRobot)
            robotpuVoice.say("Testing testing 1 2 3")
            break
        case 2:
            // expect: digits spoken as words, blocks until finished
            robotpuVoice.setVoice(VoicePreset.RobotPU)
            robotpuVoice.sayAndWait("I can count to 5. 1 2 3 4 5")
            break
        case 3:
            // expect: very quick speech (speed 220)
            robotpuVoice.configureVoice(220, 64, 128, 128)
            robotpuVoice.say("I am speaking very quickly")
            break
        case 4:
            // expect: slow harsh "EXTERMINATE" (dalek preset)
            robotpuVoice.setVoice(VoicePreset.Dalek)
            robotpuVoice.say("EXTERMINATE")
            break
        case 5:
            // expect: "I am a computer" from raw SAM phonemes (sam voice)
            robotpuVoice.setVoice(VoicePreset.Sam)
            robotpuVoice.pronounce("AY4 AEM AH KUMPYUW3TER")
            break
        case 6:
            // expect: "daisy daisy" chanted on a flat pitch
            robotpuVoice.sing("daisy daisy")
            break
        case 7:
            // MicroPython speech.sing() style: #nnn pitch + phonemes,
            // repeated vowels hold the note. Sings the Do-Re-Mi scale.
            // expect: eight notes ascending C D E F G A B C
            robotpuVoice.singPhonemes("#115DOWWWWWW #103REYYYYYY #94MIYYYYYY #88FAOAOAOAOR #78SOHWWWWW #70LAOAOAOAOR #62TIYYYYYY #58DOWWWWWW")
            break
        case 8:
            // single note via the note block - C4 singing "doe", held
            // expect: doe - mee - soh - doe, last note longest (C4 E4 G4 C5)
            robotpuVoice.singNote(SingNote.C4, "DOW", 6)
            robotpuVoice.singNote(SingNote.E4, "MIY", 6)
            robotpuVoice.singNote(SingNote.G4, "SOH", 6)
            robotpuVoice.singNote(SingNote.C5, "DOW", 10)
            break
        case 9:
            // expect: "first sentence" then "second sentence"; the third
            // utterance is dropped from the queue by stop speaking
            robotpuVoice.say("first sentence")
            robotpuVoice.say("second sentence")
            robotpuVoice.say("this one is stopped")
            robotpuVoice.stopSpeaking()
            break
        case 10:
            // expect: phoneme spelling of "robot" on serial, e.g. "RAA1BAAT"
            serial.writeLine(robotpuVoice.toPhonemes("robot"))
            break
        case 11:
            // rest stays queued in sequence: "wait", 1s of silence, "done"
            // expect: exactly one second of silence between the two phrases
            robotpuVoice.say("wait for it")
            robotpuVoice.rest(1000)
            robotpuVoice.say("done waiting")
            break
        case 12:
            // expect: "doe", a one-beat silence, then "soh" held long -
            // the rest lasts about as long as a hold-4 sung note
            robotpuVoice.singNote(SingNote.C4, "DOW", 4)
            robotpuVoice.singRest(4)
            robotpuVoice.singNote(SingNote.G4, "SOH", 8)
            break
        default:
            break
    }
    testNumber = (testNumber + 1) % 13
})

robotpuVoice.onSpeechFinished(function () {
    basic.showIcon(IconNames.Yes)
})

basic.forever(function () {
    if (robotpuVoice.isSpeaking()) {
        led.plot(0, 0)
    } else {
        led.unplot(0, 0)
    }
    basic.pause(50)
})
