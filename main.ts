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
 * Musical notes for the "sing note" block, mapped to SAM pitch numbers.
 * SAM pitch is inversely proportional to frequency (smaller = higher),
 * following pitch = 30000 / Hz, so middle C (C4) is 115 - the same number
 * MicroPython's speech.sing() uses for "Do" in the solfege example.
 */
enum SingNote {
    //% block="C3"
    C3 = 229,
    //% block="C#3"
    CSharp3 = 216,
    //% block="D3"
    D3 = 204,
    //% block="D#3"
    DSharp3 = 193,
    //% block="E3"
    E3 = 182,
    //% block="F3"
    F3 = 172,
    //% block="F#3"
    FSharp3 = 162,
    //% block="G3"
    G3 = 153,
    //% block="G#3"
    GSharp3 = 144,
    //% block="A3"
    A3 = 136,
    //% block="A#3"
    ASharp3 = 129,
    //% block="B3"
    B3 = 122,
    //% block="C4 (middle C)"
    C4 = 115,
    //% block="C#4"
    CSharp4 = 108,
    //% block="D4"
    D4 = 102,
    //% block="D#4"
    DSharp4 = 96,
    //% block="E4"
    E4 = 91,
    //% block="F4"
    F4 = 86,
    //% block="F#4"
    FSharp4 = 81,
    //% block="G4"
    G4 = 77,
    //% block="G#4"
    GSharp4 = 72,
    //% block="A4"
    A4 = 68,
    //% block="A#4"
    ASharp4 = 64,
    //% block="B4"
    B4 = 61,
    //% block="C5"
    C5 = 57,
    //% block="C#5"
    CSharp5 = 54,
    //% block="D5"
    D5 = 51,
    //% block="D#5"
    DSharp5 = 48,
    //% block="E5"
    E5 = 46,
    //% block="F5"
    F5 = 43,
    //% block="F#5"
    FSharp5 = 41,
    //% block="G5"
    G5 = 38,
    //% block="G#5"
    GSharp5 = 36,
    //% block="A5"
    A5 = 34,
    //% block="A#5"
    ASharp5 = 32,
    //% block="B5"
    B5 = 30,
    /**
     * A musical rest - silence measured in "hold" units instead of
     * milliseconds, so it stretches the same way the sung notes do.
     */
    //% block="rest"
    Rest = 0
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
//% groups='["Speech", "Sing", "Voice", "Output", "Advanced"]'
namespace robotpuVoice {

    const PUVOICE_EVENT_ID = 0x5055;
    const PUVOICE_EVT_DONE = 1;

    // Mirrors the C++ singTempo setting (percent; 0 = voice's own speed)
    // so playable durations can be converted to vowel-hold units.
    let singTempoPercent = 0;

    /**
     * Speak English text in the background. Digits are spoken as numbers,
     * e.g. "level 3" is pronounced "level three". Returns immediately
     * unless the utterance queue is full, in which case it waits for room
     * so nothing is dropped; use "say and wait" or "wait until speech
     * finished" to block until the words have been spoken.
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
    //% group="Sing"
    //% weight=94
    export function sing(text: string): void {
        singShim(text)
    }

    /**
     * Sing a string of SAM phonemes with pitch markers, like MicroPython's
     * speech.sing(). Each "#nnn" sets the pitch for the phonemes after it
     * (smaller numbers are higher); repeat vowel phonemes to hold a note.
     * e.g. "#115DOWWWWWW #103REYYYYYY #94MIYYYYYY" sings Do-Re-Mi.
     * @param phonemes phonemes with #nnn pitch markers, eg: "#115DOWWWWWW"
     */
    //% blockId=robotpuvoice_sing_phonemes block="sing phonemes %phonemes"
    //% phonemes.shadow=text
    //% group="Sing"
    //% weight=89
    //% advanced=true
    export function singPhonemes(phonemes: string): void {
        singPhonemesShim(phonemes)
    }

    /**
     * Sing one musical note. Give the syllable to sing (SAM phonemes, e.g.
     * "DOW" for "doe") and how much to stretch the vowel to hold the note.
     * Use SingNote.Rest to stay quiet for the same length a note with that
     * hold would take - no millisecond maths needed.
     * @param note the note to sing, eg: SingNote.C4
     * @param syllable SAM phonemes for the syllable, eg: "DOW"
     * @param hold extra vowel repetitions to lengthen the note, eg: 4
     */
    //% blockId=robotpuvoice_sing_note block="sing note %note syllable %syllable hold %hold"
    //% syllable.shadow=text syllable.defl="DOW"
    //% hold.min=0 hold.max=24 hold.defl=4
    //% group="Sing"
    //% weight=92
    //% advanced=true
    export function singNote(note: SingNote, syllable: string, hold: number): void {
        if (note == SingNote.Rest) {
            singRest(hold)
            return
        }
        let s = stretchSyllable(syllable, hold)
        if (s.length == 0)
            return
        singPhonemesShim("#" + note + s + " ")
    }

    /**
     * Rest for a number of beats, measured in "hold" units so it stretches
     * the same way the sung notes do - no millisecond maths needed.
     * @param hold how many beats to stay quiet, eg: 4
     */
    //% blockId=robotpuvoice_sing_rest block="rest %hold beats"
    //% hold.min=0 hold.max=24 hold.defl=4
    //% group="Sing"
    //% weight=91
    //% advanced=true
    export function singRest(hold: number): void {
        // ~150 ms per hold unit + a small base, matching the length of a
        // sung syllable stretched by the same hold value.
        rest(200 + 150 * Math.max(0, hold))
    }

    /**
     * Stay quiet for a while. Rests are queued just like notes, so they
     * play at exactly the right moment between sung phrases - handy for
     * a singer that joins the song late, or a breath between phrases.
     * @param ms how long to keep quiet, in milliseconds, eg: 500
     */
    //% blockId=robotpuvoice_rest block="rest (ms) %ms"
    //% ms.min=0 ms.defl=500
    //% group="Speech"
    //% weight=91
    export function rest(ms: number): void {
        if (ms <= 0)
            return
        restShim(ms)
    }

    /**
     * A sound the voice can perform - spoken words, sung words, a sung
     * note, or a rest. Pass it to the music "play" block just like a tone
     * or melody:
     * music.play(singable, music.PlaybackMode.UntilDone)
     */
    export class Singable extends music.Playable {
        _play(playbackMode: music.PlaybackMode) {
            if (playbackMode === music.PlaybackMode.LoopingInBackground) {
                this.loop()
            } else {
                this._playOnce()
                if (playbackMode === music.PlaybackMode.UntilDone)
                    waitUntilDone()
            }
        }

        _playOnce() {
            // subclass
        }
    }

    export class SayPlayable extends Singable {
        constructor(public text: string) {
            super()
        }

        _playOnce() {
            sayShim(this.text)
        }
    }

    export class SingTextPlayable extends Singable {
        constructor(public text: string) {
            super()
        }

        _playOnce() {
            singShim(this.text)
        }
    }

    export class SingPhonemesPlayable extends Singable {
        constructor(public phonemes: string) {
            super()
        }

        _playOnce() {
            singPhonemesShim(this.phonemes)
        }
    }

    export class SingNotePlayable extends Singable {
        constructor(public note: SingNote, public syllable: string, public duration: number) {
            super()
        }

        _playOnce() {
            if (this.note == SingNote.Rest) {
                restShim(Math.max(0, this.duration))
                return
            }
            // A note at 100% tempo lasts ~200ms plus ~150ms per hold unit;
            // higher sing tempos shorten it, so scale the holds to fill
            // the requested duration.
            let tempo = singTempoPercent <= 0 ? 100 : singTempoPercent
            let hold = Math.round(Math.max(0, this.duration * tempo / 100 - 200) / 150)
            let s = stretchSyllable(this.syllable, hold)
            if (s.length == 0)
                return
            singPhonemesShim("#" + this.note + s + " ")
        }
    }

    /**
     * A spoken phrase for the music "play" block.
     * e.g. music.play(robotpuVoice.sayPlayable("hello"), music.PlaybackMode.UntilDone)
     * @param text words to say, eg: "hello"
     */
    //% blockId=robotpuvoice_say_playable block="spoken words %text"
    //% text.shadow=text text.defl="hello"
    //% toolboxParent=music_playable_play toolboxParentArgument=toPlay
    //% duplicateShadowOnDrag
    //% group="Speech"
    //% weight=95
    export function sayPlayable(text: string): music.Playable {
        return new SayPlayable(text)
    }

    /**
     * Sung words for the music "play" block - English text chanted on a
     * flat pitch in SAM's sing mode.
     * e.g. music.play(robotpuVoice.singPlayable("daisy"), music.PlaybackMode.UntilDone)
     * @param text words to sing, eg: "daisy daisy"
     */
    //% blockId=robotpuvoice_sing_playable block="sung words %text"
    //% text.shadow=text text.defl="daisy daisy"
    //% toolboxParent=music_playable_play toolboxParentArgument=toPlay
    //% duplicateShadowOnDrag
    //% group="Sing"
    //% weight=100 blockGap=8
    export function singPlayable(text: string): music.Playable {
        return new SingTextPlayable(text)
    }

    /**
     * A sung note for the music "play" block. Give the note, the syllable
     * to sing (SAM phonemes, e.g. "DOW" for "doe") and how long to hold
     * it - the "beat" picker from the music category plugs straight in.
     * Pick "rest" as the note to stay quiet for the duration.
     * e.g. music.play(robotpuVoice.singNotePlayable(SingNote.C4, "DOW",
     *      music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
     * @param note the note to sing, eg: SingNote.C4
     * @param syllable SAM phonemes for the syllable, eg: "DOW"
     * @param duration how long the note lasts, in milliseconds
     */
    //% blockId=robotpuvoice_sing_note_playable block="sung note %note syllable %syllable for %duration"
    //% syllable.shadow=text syllable.defl="DOW"
    //% duration.shadow=device_beat
    //% toolboxParent=music_playable_play toolboxParentArgument=toPlay
    //% duplicateShadowOnDrag
    //% group="Sing"
    //% weight=98
    export function singNotePlayable(note: SingNote, syllable: string, duration: number): music.Playable {
        return new SingNotePlayable(note, syllable, duration)
    }

    /**
     * A sung rest for the music "play" block - silence that stays queued
     * in sequence with the notes around it.
     * e.g. music.play(robotpuVoice.singRestPlayable(music.beat(BeatFraction.Half)),
     *      music.PlaybackMode.UntilDone)
     * @param duration how long to stay quiet, in milliseconds
     */
    //% blockId=robotpuvoice_sing_rest_playable block="sung rest for %duration"
    //% duration.shadow=device_beat
    //% toolboxParent=music_playable_play toolboxParentArgument=toPlay
    //% duplicateShadowOnDrag
    //% group="Sing"
    //% weight=96
    export function singRestPlayable(duration: number): music.Playable {
        return new SingNotePlayable(SingNote.Rest, "", duration)
    }

    /**
     * Sung SAM phonemes with #nnn pitch markers for the music "play"
     * block, like MicroPython's speech.sing().
     * e.g. "#115DOWWWWWW #103REYYYYYY #94MIYYYYYY" sings Do-Re-Mi.
     * @param phonemes phonemes with #nnn pitch markers, eg: "#115DOWWWWWW"
     */
    //% blockId=robotpuvoice_sing_phonemes_playable block="sung phonemes %phonemes"
    //% phonemes.shadow=text
    //% toolboxParent=music_playable_play toolboxParentArgument=toPlay
    //% duplicateShadowOnDrag
    //% group="Sing"
    //% weight=90
    //% advanced=true
    export function singPhonemesPlayable(phonemes: string): music.Playable {
        return new SingPhonemesPlayable(phonemes)
    }

    /**
     * Repeat a syllable's stretchable tail to lengthen a sung note:
     * a single continuant phoneme (W Y R L M N) or the last two
     * characters of a vowel digraph (AO, IY, OW, ...).
     */
    function stretchSyllable(syllable: string, hold: number): string {
        let s = syllable.trim().toUpperCase()
        if (s.length == 0 || hold < 0)
            return ""
        let tail = s.charAt(s.length - 1)
        if ("WYRLMN".indexOf(tail) < 0 && s.length > 1)
            tail = s.substr(s.length - 2)
        for (let i = 0; i < hold; i++)
            s += tail
        return s
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
    //% weight=90
    export function isSpeaking(): boolean {
        return isBusyShim()
    }

    /**
     * Wait until all queued speech has finished playing.
     */
    //% blockId=robotpuvoice_wait block="wait until speech finished"
    //% group="Speech"
    //% weight=89
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
    //% weight=88
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
     * Set the singing tempo as a percent of the voice's normal speed.
     * 100 sings at the preset's own pace, 200 is twice as fast, 50 is
     * half speed. Talking speed is not affected. Set to 0 to sing at the
     * voice's own speed again.
     * @param tempo percent of normal singing speed, eg: 100
     */
    //% blockId=robotpuvoice_sing_tempo block="set singing tempo %tempo \\%"
    //% tempo.min=20 tempo.max=400 tempo.defl=100
    //% group="Voice"
    //% weight=77
    export function setSingTempo(tempo: number): void {
        if (tempo < 0) tempo = 0
        if (tempo > 400) tempo = 400
        singTempoPercent = tempo
        setSingTempoShim(tempo)
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

    //% shim=puvoice::singPhonemesShim
    function singPhonemesShim(phonemes: string): void {
        console.log("sing phonemes: " + phonemes)
    }

    //% shim=puvoice::restShim
    function restShim(ms: number): void {
        console.log("rest: " + ms + " ms")
    }

    //% shim=puvoice::setSingTempoShim
    function setSingTempoShim(tempo: number): void {
        console.log("sing tempo: " + tempo + "%")
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
