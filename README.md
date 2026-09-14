# Robot PU Voice

Text-to-speech for **Robot PU** (and any BBC micro:bit **V2**) based on
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

## Speaking

All speech blocks are **queued**: they return immediately and a background
fiber renders and plays each utterance in order, so the robot keeps running
other code while it talks. Queued utterances play back-to-back without a
gap — the audio pipeline only powers down once the queue fully drains.

Say something while the robot keeps running other code:

```blocks
robotpuVoice.setVoice(VoicePreset.RobotPU)
robotpuVoice.say("Hello, I am Robot P U")
```

Speak and wait until done:

```blocks
robotpuVoice.sayAndWait("Obstacle detected")
```

Direct phoneme input for precise pronunciation:

```blocks
robotpuVoice.pronounce("AY4 AEM AH KUMPYUW3TER")
```

### Voice presets

`set voice` picks one of eight SAM personalities: `Robot PU` (signature),
`SAM` (the original C64 voice), `elf`, `little robot`, `stuffy guy`,
`little old lady`, `extra terrestrial`, `dalek`.

`set voice speed/pitch/mouth/throat` tunes the voice directly (each value
0–255):

* `speed` — how quickly the voice talks (0 = slow, 255 = fast)
* `pitch` — how high or low the voice sounds
* `mouth` — how tight-lipped or overtly enunciating it sounds
* `throat` — how relaxed or tense the tone of voice is

```blocks
robotpuVoice.configureVoice(150, 48, 150, 180)
robotpuVoice.say("I am a robot")
```

`phonemes for` converts English text into the SAM phoneme string without
speaking it — useful for tuning pronunciation or preparing a
`pronounce`/`sing phonemes` string:

```blocks
serial.writeLine(robotpuVoice.toPhonemes("robot"))
```

See the [original SAM manual](https://github.com/discordier/sam/blob/master/docs/manual.md)
for the phoneme alphabet and stress marks.

## Singing

The `sing` blocks work like `say`: each call queues one item and returns,
and the singer performs the whole sequence in the background, gaplessly.
This is the recommended way to write songs.

`sing` chants English text on a flat pitch (SAM sing mode):

```blocks
robotpuVoice.sing("daisy daisy")
```

`sing note` sings one musical note — choose the note, the syllable in SAM
phonemes (``HAE`` sounds like "ha"), and a `hold` count that stretches the
vowel (bigger = longer):

```blocks
robotpuVoice.singNote(SingNote.G4, "HAE", 1)
robotpuVoice.singNote(SingNote.G4, "PIY", 1)
robotpuVoice.singNote(SingNote.A4, "BERTH", 4)
robotpuVoice.singNote(SingNote.G4, "DEY", 4)
robotpuVoice.singNote(SingNote.C5, "TUW", 4)
robotpuVoice.singNote(SingNote.B4, "YUW", 8)
```

Rests are queued just like notes — each plays in sequence with the speech
around it — and there is one for every timing style:

* `rest … beats` (`singRest`) — silence measured in `hold` units, so it
  stretches the same way the sung notes do:

  ```blocks
  robotpuVoice.singNote(SingNote.C4, "DOW", 4)
  robotpuVoice.singRest(4)
  robotpuVoice.singNote(SingNote.G4, "SOH", 8)
  ```

* `rest` in the `sing note` note dropdown — same thing inline:
  `sing note rest syllable "" hold 4`.
* `rest (ms)` — silence in milliseconds, handy between spoken phrases.
* `sung rest for …` — a playable for `music.play` timed in `music.beat`
  durations (see below).

`sing phonemes` takes a raw string with `#nnn` pitch markers, like
MicroPython's `speech.sing()` — each marker sets the pitch for the
phonemes after it, and repeated vowels hold the note. A whole phrase fits
in one queued item:

```blocks
robotpuVoice.singPhonemes("#115DOWWWWWW #103REYYYYYY #94MIYYYYYY")
```

`set singing tempo %` scales sung note lengths as a percent of the
voice's normal speed — 100 is unchanged, 200 is twice as fast, 50 half —
without touching the talking speed. `0` sings at the voice's own pace.

### Singing through `music.play`

For beat-true timing or code that must run in step with each note, build a
*playable* and pass it to the music `play` block — just like a tone or
melody:

```blocks
music.play(robotpuVoice.singNotePlayable(SingNote.C4, "DOW", music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
music.play(robotpuVoice.singRestPlayable(music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
music.play(robotpuVoice.singNotePlayable(SingNote.G4, "SOH", music.beat(BeatFraction.Double)), music.PlaybackMode.UntilDone)
```

The duration socket takes `music.beat(BeatFraction.…)` straight from the
music category, so notes follow `music.setTempo`. Other playables:
`sung words` (English on a flat pitch), `sung phonemes` (`#nnn` markers),
`spoken words`, and `sung rest for …`:

```blocks
music.play(robotpuVoice.singPlayable("daisy daisy"), music.PlaybackMode.UntilDone)
music.play(robotpuVoice.singPhonemesPlayable("#115DOWWWWWW #103REYYYYYY #94MIYYYYYY"), music.PlaybackMode.UntilDone)
music.play(robotpuVoice.sayPlayable("that is all"), music.PlaybackMode.UntilDone)
```

Playables render through the same queue and audio pipeline as the `say`/
`sing` blocks, so the sound is identical — `spoken words` really is `say`
in a `play` socket. The difference is only the playback mode:
`in background` behaves like `say` (enqueue and return), `until done`
behaves like `say and wait`, and `looping in background` repeats the
phrase until `music.stopAllSounds()`.

### Queued blocks vs `music.play` playables

| | `sing note` / `sing` / `rest` (queued) | playables in `music.play` |
|---|---|---|
| Timing | `hold` count / milliseconds | `music.beat` fractions, follows `setTempo` |
| Sequencing | whole program queues, plays in background | `until done` waits per note |
| Note transitions | gapless — pipeline stays awake between queued items | pipeline may power down between notes |
| Program flow | handler returns while the song plays | `until done` blocks; `in background` and `looping in background` modes also work |
| Best for | songs, talking while the robot moves | syncing LEDs or motion to notes, looping a phrase, programs built around the music category |

## Speech control

* `stop speaking` — clears the queue and abandons the utterance being
  rendered.
* `is speaking` — true while speech is playing or queued.
* `wait until speech finished` — blocks until the queue drains and the
  last samples play out.
* `on speech finished` — event raised when everything has been spoken:

```blocks
robotpuVoice.onSpeechFinished(function () {
    basic.showIcon(IconNames.Happy)
})
```

`rest (ms)` queues timed silence just like a note — it plays in sequence
with the queued speech, so a singer can wait a beat and join back in on
time:

```blocks
robotpuVoice.sing("wait for it")
robotpuVoice.rest(500)
robotpuVoice.sing("done waiting")
```

The utterance queue holds 31 items at once; calls beyond that wait for
room so queued speech is never dropped. For very long phrases you can
still pack them into `sing phonemes` strings and use `wait until speech
finished` to take a breath between them.

## Tutorials

* [Sing Happy Birthday](/tutorials/happy-birthday) — step-by-step: say the
  message, then sing the whole song note by note.
* [Sing and Talk with music.play](/tutorials/sing-talk-with-music-play) —
  playable blocks inside the music `play` block: real beats, LED sync,
  and looping speech.
* [Sing and Dance](/tutorials/sing-and-dance) — Robot PU walks,
  moonwalks, and side-steps a *Dangerous*-style groove while the song
  plays in the background (needs the pxt-robotpu extension).
* [Sing and Light Show](/tutorials/sing-and-light-show) — low-cost demo
  on a bare micro:bit: talk and sing while an LED light show runs at the
  same time. No robot required.
* [Minion Banana Quartet](/tutorials/minion-banana-quartet) — four
  micro:bits sing the Banana song in parts, started in sync over radio.

## Note to pitch number table

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
amplifier idles instead of dissipating power. `power down audio` forces
the same shutdown immediately.

## Supported targets

* for PXT/microbit (micro:bit V2)

## Acknowledgements

* Sebastian Macke — author of the [C port of SAM](https://github.com/s-macke/SAM)
* Adam Granger — author of [pxt-billy](https://github.com/adamish/pxt-billy)
* Authors of [BBC micro:bit MicroPython speech module](https://github.com/bbcmicrobit/micropython/tree/master/source/lib/sam)

## License

MIT
