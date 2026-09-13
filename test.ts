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
            robotpuVoice.say("first sentence")
            robotpuVoice.say("second sentence")
            robotpuVoice.say("this one is stopped")
            robotpuVoice.stopSpeaking()
            break
        case 8:
            serial.writeLine(robotpuVoice.toPhonemes("robot"))
            break
        default:
            break
    }
    testNumber = (testNumber + 1) % 9
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
