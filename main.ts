/**
 * Voice presets based on the original SAM voice personalities,
 * plus a signature Robot PU voice.
 */
enum VoicePreset {
    //% block="Robot PU"
    RobotPU = 0,
    //% block="SAM"
    Sam = 1,
    //% block="elf"
    Elf = 2,
    //% block="little robot"
    LittleRobot = 3,
    //% block="stuffy guy"
    StuffyGuy = 4,
    //% block="little old lady"
    LittleOldLady = 5,
    //% block="extra terrestrial"
    ExtraTerrestrial = 6,
    //% block="dalek"
    Dalek = 7
}

/**
 * Robot PU Voice - a text to speech extension for the micro:bit V2 based on
 * SAM (Software Automatic Mouth, 1982). Speech is rendered on a background
 * fiber so the robot can keep moving while it talks. The audio pipeline is
 * powered down automatically when speech ends, so pin 0 does not keep
 * driving the Robot PU amplifier.
 */
//% block="Robot PU Voice"
//% weight=100 color=#c65a00 icon="\uf028"
//% groups='["Speech", "Voice", "Output", "Advanced"]'
namespace robotpuVoice {

    const PUVOICE_EVENT_ID = 0x5055;
    const PUVOICE_EVT_DONE = 1;

    /**
     * Speak English text in the background. Digits are spoken as numbers,
     * e.g. "level 3" is pronounced "level three". Returns immediately;
     * use "say and wait" or "wait until speech finished" to block.
     * @param text words to say, eg: "Hello, I am Robot PU"
     */
    //% blockId=robotpuvoice_say block="say %text"
    //% text.shadow=text
    //% group="Speech"
    //% weight=100 blockGap=8
    export function say(text: string): void {
        sayShim(text)
    }

    /**
     * Speak English text and wait until it has finished playing.
     * @param text words to say, eg: "Obstacle detected"
     */
    //% blockId=robotpuvoice_say_wait block="say %text and wait"
    //% text.shadow=text
    //% group="Speech"
    //% weight=98
    export function sayAndWait(text: string): void {
        sayShim(text)
        waitUntilDone()
    }

    /**
     * Pronounce a string of SAM phonemes in the background.
     * e.g. "I am a computer" is "AY4 AEM AH KUMPYUW3TER".
     * See the README for the full phoneme table.
     * @param phonemes phonemes to pronounce, eg: "/HEHLOW WERLD"
     */
    //% blockId=robotpuvoice_pronounce block="pronounce phonemes %phonemes"
    //% phonemes.shadow=text
    //% group="Speech"
    //% weight=96
    export function pronounce(phonemes: string): void {
        pronounceShim(phonemes)
    }

    /**
     * Sing English text in the background using SAM's sing mode, which
     * holds the pitch steady instead of adding natural inflection.
     * @param text words to sing, eg: "daisy daisy"
     */
    //% blockId=robotpuvoice_sing block="sing %text"
    //% text.shadow=text
    //% group="Speech"
    //% weight=94
    export function sing(text: string): void {
        singShim(text)
    }

    /**
     * Stop speaking. Clears queued utterances and abandons the rest of the
     * utterance currently being rendered.
     */
    //% blockId=robotpuvoice_stop block="stop speaking"
    //% group="Speech"
    //% weight=92
    export function stopSpeaking(): void {
        stopShim()
    }

    /**
     * Check if Robot PU is speaking or still has speech queued.
     */
    //% blockId=robotpuvoice_is_speaking block="is speaking"
    //% group="Speech"
    //% weight=91
    export function isSpeaking(): boolean {
        return isBusyShim()
    }

    /**
     * Wait until all queued speech has finished playing.
     */
    //% blockId=robotpuvoice_wait block="wait until speech finished"
    //% group="Speech"
    //% weight=90
    export function waitUntilDone(): void {
        while (isBusyShim()) {
            basic.pause(10)
        }
    }

    /**
     * Run some code when all queued speech has finished playing.
     * @param handler code to run
     */
    //% blockId=robotpuvoice_on_finished block="on speech finished"
    //% group="Speech"
    //% weight=89
    export function onSpeechFinished(handler: () => void): void {
        control.onEvent(PUVOICE_EVENT_ID, PUVOICE_EVT_DONE, handler)
    }

    /**
     * Choose a preset voice personality.
     * @param preset the voice to use, eg: VoicePreset.RobotPU
     */
    //% blockId=robotpuvoice_set_voice block="set voice %preset"
    //% group="Voice"
    //% weight=80 blockGap=8
    export function setVoice(preset: VoicePreset): void {
        switch (preset) {
            case VoicePreset.RobotPU:
                configureVoice(150, 48, 150, 180)
                break
            case VoicePreset.Sam:
                configureVoice(183, 64, 128, 128)
                break
            case VoicePreset.Elf:
                configureVoice(183, 64, 110, 160)
                break
            case VoicePreset.LittleRobot:
                configureVoice(163, 60, 190, 190)
                break
            case VoicePreset.StuffyGuy:
                configureVoice(173, 72, 110, 105)
                break
            case VoicePreset.LittleOldLady:
                configureVoice(173, 32, 145, 145)
                break
            case VoicePreset.ExtraTerrestrial:
                configureVoice(155, 64, 150, 200)
                break
            case VoicePreset.Dalek:
                configureVoice(135, 100, 100, 200)
                break
            default:
                break
        }
    }

    /**
     * Tune the voice parameters directly.
     * @param speed how quickly the voice talks, 0 slow - 255 fast, eg: 150
     * @param pitch how high or low the voice sounds, eg: 48
     * @param mouth how tight-lipped or enunciating the voice sounds, eg: 150
     * @param throat how relaxed or tense the tone of voice is, eg: 180
     */
    //% blockId=robotpuvoice_configure_voice block="set voice speed %speed pitch %pitch mouth %mouth throat %throat"
    //% speed.min=0 speed.max=255 speed.defl=150
    //% pitch.min=0 pitch.max=255 pitch.defl=48
    //% mouth.min=0 mouth.max=255 mouth.defl=150
    //% throat.min=0 throat.max=255 throat.defl=180
    //% group="Voice"
    //% weight=78
    export function configureVoice(speed: number, pitch: number, mouth: number, throat: number): void {
        // SAM uses 0 = fast, 255 = slow; flip so the block reads naturally.
        setVoiceShim(255 - speed, pitch, mouth, throat)
    }

    /**
     * Set the audio output volume. This controls the micro:bit mixer, so it
     * also affects music blocks.
     * @param volume volume level, eg: 255
     */
    //% blockId=robotpuvoice_set_volume block="set speech volume %volume"
    //% volume.min=0 volume.max=255 volume.defl=255
    //% group="Output"
    //% weight=70 blockGap=8
    export function setVolume(volume: number): void {
        setVolumeShim(volume)
    }

    /**
     * Route audio to the micro:bit's on-board speaker.
     * @param on true to enable the on-board speaker, eg: true
     */
    //% blockId=robotpuvoice_onboard_speaker block="use on-board speaker %on"
    //% on.shadow=toggleOnOff on.defl=true
    //% group="Output"
    //% weight=68
    //% advanced=true
    export function useOnboardSpeaker(on: boolean): void {
        setSpeakerEnabledShim(on)
    }

    /**
     * Route audio to the edge connector pin (pin 0). This is the output that
     * drives the Robot PU speaker amplifier.
     * @param on true to enable audio on pin 0, eg: true
     */
    //% blockId=robotpuvoice_audio_pin block="output audio to pin 0 %on"
    //% on.shadow=toggleOnOff on.defl=true
    //% group="Output"
    //% weight=67
    //% advanced=true
    export function outputToPin0(on: boolean): void {
        setAudioPinEnabledShim(on)
    }

    /**
     * Power the audio pipeline down immediately. Normally this happens
     * automatically when speech finishes; this block forces it, which stops
     * PWM on pin 0 so the amplifier idles.
     */
    //% blockId=robotpuvoice_power_down block="power down audio"
    //% group="Output"
    //% weight=66
    //% advanced=true
    export function powerDownAudio(): void {
        powerDownShim()
    }

    /**
     * Convert English text into the SAM phoneme string it would be spoken as.
     * Useful for tuning pronunciation. Returns an empty string while speech
     * is in progress.
     * @param text words to convert, eg: "hello world"
     */
    //% blockId=robotpuvoice_to_phonemes block="phonemes for %text"
    //% text.shadow=text
    //% group="Advanced"
    //% weight=50
    export function toPhonemes(text: string): string {
        return toPhonemesShim(text)
    }

    //% shim=puvoice::sayShim
    function sayShim(text: string): void {
        console.log("say: " + text)
    }

    //% shim=puvoice::pronounceShim
    function pronounceShim(phonemes: string): void {
        console.log("pronounce: " + phonemes)
    }

    //% shim=puvoice::singShim
    function singShim(text: string): void {
        console.log("sing: " + text)
    }

    //% shim=puvoice::setVoiceShim
    function setVoiceShim(speed: number, pitch: number, mouth: number, throat: number): void {
        console.log("setVoice " + speed + " " + pitch + " " + mouth + " " + throat)
    }

    //% shim=puvoice::stopShim
    function stopShim(): void {
    }

    //% shim=puvoice::isBusyShim
    function isBusyShim(): boolean {
        return false
    }

    //% shim=puvoice::setVolumeShim
    function setVolumeShim(volume: number): void {
    }

    //% shim=puvoice::setSpeakerEnabledShim
    function setSpeakerEnabledShim(on: boolean): void {
    }

    //% shim=puvoice::setAudioPinEnabledShim
    function setAudioPinEnabledShim(on: boolean): void {
    }

    //% shim=puvoice::powerDownShim
    function powerDownShim(): void {
    }

    //% shim=puvoice::toPhonemesShim
    function toPhonemesShim(text: string): string {
        return text
    }
}
