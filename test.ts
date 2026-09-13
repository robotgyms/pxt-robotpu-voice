/*
 * Compile test for pxt-robotpu-voice.
 * On hardware, press button A to cycle through the tests and listen to pin 0
 * (Robot PU speaker) or the on-board speaker.
 */
let testNumber = 0

input.onButtonPressed(Button.A, function () {
    basic.showNumber(testNumber)
    switch (testNumber) {
        case 0:
            robotpuVoice.say("Hello, I am Robot P U")
            break
        case 1:
            robotpuVoice.setVoice(VoicePreset.LittleRobot)
            robotpuVoice.say("Testing testing 1 2 3")
            break
        case 2:
            robotpuVoice.setVoice(VoicePreset.RobotPU)
            robotpuVoice.sayAndWait("I can count to 5. 1 2 3 4 5")
            break
        case 3:
            robotpuVoice.configureVoice(220, 64, 128, 128)
            robotpuVoice.say("I am speaking very quickly")
            break
        case 4:
            robotpuVoice.setVoice(VoicePreset.Dalek)
            robotpuVoice.say("EXTERMINATE")
            break
        case 5:
            robotpuVoice.setVoice(VoicePreset.Sam)
            robotpuVoice.pronounce("AY4 AEM AH KUMPYUW3TER")
            break
        case 6:
            robotpuVoice.sing("daisy daisy")
            break
        case 7:
            // MicroPython speech.sing() style: #nnn pitch + phonemes,
            // repeated vowels hold the note. Sings the Do-Re-Mi scale.
            robotpuVoice.singPhonemes("#115DOWWWWWW #103REYYYYYY #94MIYYYYYY #88FAOAOAOAOR #78SOHWWWWW #70LAOAOAOAOR #62TIYYYYYY #58DOWWWWWW")
            break
        case 8:
            // single note via the note block - C4 singing "doe", held
            robotpuVoice.singNote(SingNote.C4, "DOW", 6)
            robotpuVoice.singNote(SingNote.E4, "MIY", 6)
            robotpuVoice.singNote(SingNote.G4, "SOH", 6)
            robotpuVoice.singNote(SingNote.C5, "DOW", 10)
            break
        case 9:
            robotpuVoice.say("first sentence")
            robotpuVoice.say("second sentence")
            robotpuVoice.say("this one is stopped")
            robotpuVoice.stopSpeaking()
            break
        case 10:
            serial.writeLine(robotpuVoice.toPhonemes("robot"))
            break
        case 11:
            // rest stays queued in sequence: "wait", 1s of silence, "done"
            robotpuVoice.say("wait for it")
            robotpuVoice.rest(1000)
            robotpuVoice.say("done waiting")
            break
        default:
            break
    }
    testNumber = (testNumber + 1) % 12
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
