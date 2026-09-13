# Robot PU Voice

Text-to-speech for **Robot PU** (and any micro:bit **V2**) based on
[SAM](https://github.com/s-macke/SAM) — *Software Automatic Mouth*, the
legendary speech synthesizer from the Commodore C64 (1982).

This extension is a rewrite of [pxt-billy](https://github.com/adamish/pxt-billy)
with a different architecture, built for robot hardware:

* **Non-blocking speech** — `say` queues the utterance and returns
  immediately, so the robot can keep walking while it talks.
* **Automatic power-down** — the audio pipeline is put to sleep as soon as
  speech finishes. pxt-billy leaves the mixer running forever, so PWM on
  pin 0 keeps switching into the Robot PU amplifier: wasted battery and a
  warm speaker. Robot PU Voice disconnects it when idle.
* **Digits are spoken** — `say("level 3")` says "level three". Plain digits
  are silent in the original reciter rules.
* **Stop / status / events** — `stop speaking`, `is speaking`,
  `wait until speech finished`, and an `on speech finished` event.
* **Sing mode exposed** — pxt-billy compiled a sing shim but never surfaced
  a block for it.
* **Phoneme preview** — `phonemes for` converts English text to the SAM
  phoneme string without speaking, useful for tuning pronunciation.
* **Fixed mouth/throat parameter order** — pxt-billy swaps them between its
  block and its shim, so its own presets are not the documented values.

micro:bit **V2 only** (the CODAL audio pipeline is required; V1 is
explicitly unsupported).

## Add to a MakeCode project

* Open https://makecode.microbit.org
* Click on **New Project**
* Click on **Extensions** under the gearwheel menu
* Search for **https://github.com/robotgyms/pxt-robotpu-voice** and import it

## Examples

Say something while the robot keeps running other code:

```blocks
robotpuVoice.setVoice(VoicePreset.RobotPU)
robotpuVoice.say("Hello, I am Robot P U")
```

Speak and wait until done:

```blocks
robotpuVoice.sayAndWait("Obstacle detected")
```

React when speech finishes:

```blocks
robotpuVoice.onSpeechFinished(function () {
    basic.showIcon(IconNames.Happy)
})
robotpuVoice.say("I am a robot")
```

Direct phoneme input for precise pronunciation:

```blocks
robotpuVoice.pronounce("AY4 AEM AH KUMPYUW3TER")
```

Tune the voice manually (each value is 0–255):

* `speed` — how quickly the voice talks (0 = slow, 255 = fast)
* `pitch` — how high or low the voice sounds
* `mouth` — how tight-lipped or overtly enunciating it sounds
* `throat` — how relaxed or tense the tone of voice is

```blocks
robotpuVoice.configureVoice(150, 48, 150, 180)
robotpuVoice.say("I am a robot")
```

See the [original SAM manual](https://github.com/discordier/sam/blob/master/docs/manual.md)
for the phoneme alphabet and stress marks.

## Audio output

Audio is produced through the CODAL mixer, so it plays on the on-board
speaker **and** pin 0 (the edge connector pin that drives the Robot PU
speaker amplifier). Use `use on-board speaker` / `output audio to pin 0`
to route it, and `set speech volume` for volume.

When the speech queue drains, the extension waits for the last samples to
play out and then puts `uBit.audio` to sleep — PWM on pin 0 stops, so the
amplifier idles instead of dissipating power.

## Supported targets

* for PXT/microbit (micro:bit V2)

## Acknowledgements

* Sebastian Macke — author of the [C port of SAM](https://github.com/s-macke/SAM)
* Adam Granger — author of [pxt-billy](https://github.com/adamish/pxt-billy)
* Authors of [BBC micro:bit MicroPython speech module](https://github.com/bbcmicrobit/micropython/tree/master/source/lib/sam)

## License

MIT
