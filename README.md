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

## Singing

Two ways to sing, matching MicroPython's `speech.sing()`:

**Note block** — pick a musical note and a syllable; `hold` stretches the
vowel to lengthen the note:

```blocks
robotpuVoice.singNote(SingNote.C4, "DOW", 6)
robotpuVoice.singNote(SingNote.E4, "MIY", 6)
robotpuVoice.singNote(SingNote.G4, "SOH", 6)
robotpuVoice.singNote(SingNote.C5, "DOW", 10)
```

**Pitch-marked phonemes** — `#nnn` sets the pitch for the phonemes after it
(smaller numbers = higher pitch; `SingNote.C4` = `#115` = middle C). Repeat
vowels or voiced continuants (`W Y R L M N`) to hold a note. This sings the
Do-Re-Mi scale, exactly like MicroPython:

```blocks
robotpuVoice.singPhonemes("#115DOWWWWWW #103REYYYYYY #94MIYYYYYY #88FAOAOAOAOR #78SOHWWWWW #70LAOAOAOAOR #62TIYYYYYY #58DOWWWWWW")
```

The plain `sing` block takes English text and renders it on a flat pitch
(SAM sing mode without markers) — useful for robotic chanting.

`rest` queues timed silence just like a note — it plays in sequence with
the queued speech, so a singer can wait a beat and join back in on time:

```blocks
robotpuVoice.singNote(SingNote.C4, "DOW", 6)
robotpuVoice.rest(500)
robotpuVoice.singNote(SingNote.C4, "DOW", 10)
```

The utterance queue holds three items at once, so pack long phrases into
`sing phonemes` strings and use `wait until speech finished` to take a
breath between them.

### Tutorials

* [Sing Happy Birthday](/tutorials/happy-birthday) — step-by-step: say the
  message, then sing the whole song note by note.
* [Minion Banana Quartet](/tutorials/minion-banana-quartet) — four
  micro:bits sing the Banana song in parts, started in sync over radio.

### Note to pitch number table

SAM pitch ≈ 30000 / frequency(Hz) — smaller numbers are higher notes:

| `SingNote` | Note | Hz | `#nnn` | | `SingNote` | Note | Hz | `#nnn` |
|---|---|---|---|---|---|---|---|---|
| C3 | C3 | 131 | 229 | | C4 | middle C | 262 | 115 |
| CSharp3 | C#3 | 139 | 216 | | CSharp4 | C#4 | 277 | 108 |
| D3 | D3 | 147 | 204 | | D4 | D4 | 294 | 102 |
| DSharp3 | D#3 | 156 | 193 | | DSharp4 | D#4 | 311 | 96 |
| E3 | E3 | 165 | 182 | | E4 | E4 | 330 | 91 |
| F3 | F3 | 175 | 172 | | F4 | F4 | 349 | 86 |
| FSharp3 | F#3 | 185 | 162 | | FSharp4 | F#4 | 370 | 81 |
| G3 | G3 | 196 | 153 | | G4 | G4 | 392 | 77 |
| GSharp3 | G#3 | 208 | 144 | | GSharp4 | G#4 | 415 | 72 |
| A3 | A3 | 220 | 136 | | A4 | A4 | 440 | 68 |
| ASharp3 | A#3 | 233 | 129 | | ASharp4 | A#4 | 466 | 64 |
| B3 | B3 | 247 | 122 | | B4 | B4 | 494 | 61 |
| C5 | C5 | 523 | 57 | | CSharp5 | C#5 | 554 | 54 |
| D5 | D5 | 587 | 51 | | DSharp5 | D#5 | 622 | 48 |
| E5 | E5 | 659 | 46 | | F5 | F5 | 698 | 43 |
| FSharp5 | F#5 | 740 | 41 | | G5 | G5 | 784 | 38 |
| GSharp5 | G#5 | 831 | 36 | | A5 | A5 | 880 | 34 |
| ASharp5 | A#5 | 932 | 32 | | B5 | B5 | 988 | 30 |

C major scale (Do Re Mi Fa Sol La Ti Do):
`#115` `#102` `#91` `#86` `#77` `#68` `#61` `#57`

MicroPython songs use a slightly different table (`#115 #103 #94 #88 #78
#70 #62 #58`) — both work; the difference is under a quarter tone.

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
