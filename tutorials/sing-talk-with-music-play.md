# Sing and Talk with `music.play`

Robot PU's voice works with the same ``||music:play||`` block you already
know from melodies and tones. Wrap a spoken phrase or a sung note in a
*playable* block, drop it into ``||music:play||``, and pick a playback
mode — real beats, perfect sync with your LEDs, even looping.

You will need a **micro:bit V2**.

## Step 1: What's a playable?

A *playable* is a sound packed into a box. ``||music:play||`` opens the
box and performs it — the same block that plays melodies can play speech,
because Robot PU ships playables for both.

Try ``spoken words`` inside ``||music:play||``:

```blocks
music.play(robotpuVoice.sayPlayable("Welcome to the show"), music.PlaybackMode.UntilDone)
```

**Try it:** download. Robot PU speaks — through the music block!
``until done`` means: wait for the words to finish before the next block
runs, just like ``||robotpuVoice:say and wait||``.

## Step 2: Sung words

``sung words`` chants English text on a flat robot pitch — same engine as
``||robotpuVoice:sing||``, same sound:

```blocks
music.play(robotpuVoice.singPlayable("daisy daisy give me your answer do"), music.PlaybackMode.UntilDone)
```

## Step 3: Sung notes with real beats

Here's where playables shine: ``sung note`` takes its length as a
``||music:beat||``, not a hold count. ``||music:set tempo||`` controls
how long a beat lasts — 120 beats per minute is a cheerful pace:

```blocks
music.setTempo(120)
music.play(robotpuVoice.singNotePlayable(SingNote.C4, "DOW", music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
music.play(robotpuVoice.singNotePlayable(SingNote.E4, "MIY", music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
music.play(robotpuVoice.singNotePlayable(SingNote.G4, "SOH", music.beat(BeatFraction.Double)), music.PlaybackMode.UntilDone)
```

"doe — mee — soo". Because every note is ``until done``, your program
runs in step with the singing — the next block starts the instant its
note ends.

## Step 4: A sung rest

Silence is part of the music. ``sung rest for …`` stays quiet for a beat
duration — no note or syllable needed:

```blocks
music.play(robotpuVoice.singNotePlayable(SingNote.C4, "DOW", music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
music.play(robotpuVoice.singRestPlayable(music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
music.play(robotpuVoice.singNotePlayable(SingNote.G4, "SOH", music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
```

## Step 5: Talk between the notes

Because ``spoken words`` and ``sung note`` live in the same
``||music:play||`` socket, Robot PU can talk *and* sing in one script —
each ``until done`` waits its turn, so lines and notes never overlap:

```blocks
input.onButtonPressed(Button.A, function () {
    music.play(robotpuVoice.sayPlayable("knock knock"), music.PlaybackMode.UntilDone)
    music.play(robotpuVoice.singNotePlayable(SingNote.C4, "WHOW", music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
    music.play(robotpuVoice.singNotePlayable(SingNote.G4, "ZEH", music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
    music.play(robotpuVoice.sayPlayable("there?"), music.PlaybackMode.UntilDone)
    music.play(robotpuVoice.sayPlayable("It is me! Robot P U!"), music.PlaybackMode.UntilDone)
})
```

**Try it:** knock knock — "who's there" comes out *sung*. Mixing the two
kinds of playable in one story is the whole point of this API.

## Step 6: Lights that keep time

``until done`` is the trick for dancing lights: an LED block between two
``||music:play||`` calls runs *exactly* when the first sound ends. Flash
a heart on every note:

```blocks
input.onButtonPressed(Button.A, function () {
    music.play(robotpuVoice.singNotePlayable(SingNote.C4, "DOW", music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
    basic.showIcon(IconNames.Heart)
    music.play(robotpuVoice.singNotePlayable(SingNote.E4, "MIY", music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
    basic.showIcon(IconNames.SmallHeart)
    music.play(robotpuVoice.singNotePlayable(SingNote.G4, "SOH", music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
    basic.clearScreen()
})
```

(The queued ``||robotpuVoice:sing note||`` blocks can't do this — they
run ahead while the notes sing in the background.)

## Step 7: The other playback modes

The ``||music:play||`` dropdown has two more modes:

- ``in background`` — start the sound and keep going; behaves just like
  ``||robotpuVoice:say||``.
- ``looping in background`` — repeat the sound until
  ``||music:stop all sounds||``:

```blocks
input.onButtonPressed(Button.A, function () {
    music.play(robotpuVoice.sayPlayable("warning"), music.PlaybackMode.LoopingInBackground)
})
input.onButtonPressed(Button.B, function () {
    music.stopAllSounds()
})
```

Press A and Robot PU chants "warning, warning, warning…" until B stops it.

## Step 8: Put on a show

Time to combine talk and song. Robot PU announces itself, sings a
Do-Re-Mi fanfare, takes a breath, and delivers the punchline — all in
one button press:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.setVoice(VoicePreset.LittleRobot)
    music.setTempo(140)
    music.play(robotpuVoice.sayPlayable("Ladies and gentlemen!"), music.PlaybackMode.UntilDone)
    music.play(robotpuVoice.singNotePlayable(SingNote.C4, "DAH", music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
    music.play(robotpuVoice.singNotePlayable(SingNote.E4, "DAH", music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
    music.play(robotpuVoice.singNotePlayable(SingNote.G4, "DAH", music.beat(BeatFraction.Half)), music.PlaybackMode.UntilDone)
    music.play(robotpuVoice.singRestPlayable(music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
    music.play(robotpuVoice.singNotePlayable(SingNote.C5, "DAAAH", music.beat(BeatFraction.Double)), music.PlaybackMode.UntilDone)
    music.play(robotpuVoice.sayPlayable("Thank you! Thank you!"), music.PlaybackMode.UntilDone)
    basic.showIcon(IconNames.Happy)
})
```

## Step 9: Challenges

- **Conduct the tempo** — add ``||music:change tempo by||`` inside the
  show so the fanfare speeds up.
- **Loop the chorus** — wrap a ``sung words`` line in
  ``looping in background`` and stop it with a shake gesture.
- **Duet** — sing ``sung phonemes`` like
  ``#115DOWWWWWW #103REYYYYYY #94MIYYYYYY`` and have a second micro:bit
  answer back.
- **Compare** — rewrite the show with ``||robotpuVoice:say||`` and
  ``||robotpuVoice:sing note||``. Which version keeps the happy face in
  step? Which lets your robot keep moving?
