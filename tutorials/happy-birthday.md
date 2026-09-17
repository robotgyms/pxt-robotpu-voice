# Happy Birthday

Make Robot PU say and sing Happy Birthday — the perfect way to impress your friends.

## Step 1: Robot PU says hello

Every good performance starts with an announcement. Let's make Robot PU
speak using the ``||robotpuVoice:say||`` block.

```blocks
robotpuVoice.say("Hello, I am Robot P U")
```

**Try it:** download to your micro:bit. Robot PU speaks through its speaker!

## Step 2: Say "Happy Birthday"

Now the important part — a birthday message. Change the text:

```blocks
robotpuVoice.say("Happy birthday to you!")
```

## Step 3: Give it a singing voice

Before we sing, pick a voice personality with
``||robotpuVoice:set voice||``. ``Little robot`` sounds great for songs.

```blocks
robotpuVoice.setVoice(VoicePreset.LittleRobot)
```

## Step 4: Your first sung note

The ``||robotpuVoice:sing note||`` block sings one musical note. You choose:

- **note** — which key to play (C4 is middle C)
- **syllable** — the sound to sing, written in phonemes (``/HAE`` sounds like "ha" —
  the "h" sound is spelled ``/H`` in SAM phonemes; a plain ``H`` is not a valid
  phoneme and the note would be silent)
- **hold** — how long to stretch the note (bigger = longer)

```blocks
robotpuVoice.singNote(SingNote.G4, "/HAE", 4)
```

**Try it:** Robot PU sings "haaa" on a G!

## Step 5: Line 1 — "Happy birthday to you"

A song is just notes in a row. Here is the first line of Happy Birthday —
watch how the notes go up and down:

```blocks
robotpuVoice.singNote(SingNote.G4, "/HAE", 1)
robotpuVoice.singNote(SingNote.G4, "PIY", 1)
robotpuVoice.singNote(SingNote.A4, "BERTH", 4)
robotpuVoice.singNote(SingNote.G4, "DEY", 4)
robotpuVoice.singNote(SingNote.C5, "TUW", 4)
robotpuVoice.singNote(SingNote.B4, "YUW", 8)
```

Notice the two quick ``G4`` notes at the start — that's the "Hap-py" pickup!

## Step 6: Line 2 — the same, but higher

The second line repeats the same pattern, but "to you" jumps up to ``D5``
then ``C5``:

```blocks
robotpuVoice.singNote(SingNote.G4, "/HAE", 1)
robotpuVoice.singNote(SingNote.G4, "PIY", 1)
robotpuVoice.singNote(SingNote.A4, "BERTH", 4)
robotpuVoice.singNote(SingNote.G4, "DEY", 4)
robotpuVoice.singNote(SingNote.D5, "TUW", 4)
robotpuVoice.singNote(SingNote.C5, "YUW", 8)
```

## Step 7: Line 3 — "Happy birthday dear Robot PU"

This line has the highest note in the song — ``G5`` on "birth". We squeeze
the name into four syllables: ``ROW`` + ``BAAT`` + ``PIY`` + ``YUW``
("Ro-bot-P-U"). To fit them in, ``B4`` and ``A4`` each split into two
quick notes.

```blocks
robotpuVoice.singNote(SingNote.G4, "/HAE", 1)
robotpuVoice.singNote(SingNote.G4, "PIY", 1)
robotpuVoice.singNote(SingNote.G5, "BERTH", 4)
robotpuVoice.singNote(SingNote.E5, "DEY", 4)
robotpuVoice.singNote(SingNote.C5, "DIYR", 4)
robotpuVoice.singNote(SingNote.B4, "ROW", 2)
robotpuVoice.singNote(SingNote.B4, "BAAT", 2)
robotpuVoice.singNote(SingNote.A4, "PIY", 2)
robotpuVoice.singNote(SingNote.A4, "YUW", 6)
```

## Step 8: Line 4 — the finale

The last line drops to ``F5`` and ends back home on ``C5``:

```blocks
robotpuVoice.singNote(SingNote.F5, "/HAE", 1)
robotpuVoice.singNote(SingNote.F5, "PIY", 1)
robotpuVoice.singNote(SingNote.E5, "BERTH", 4)
robotpuVoice.singNote(SingNote.C5, "DEY", 4)
robotpuVoice.singNote(SingNote.D5, "TUW", 4)
robotpuVoice.singNote(SingNote.C5, "YUW", 10)
```

## Step 9: Perform on demand

Nobody wants the song to play the moment the micro:bit turns on! Wrap
everything in a ``||input:on button A pressed||`` block — say the message
first, then sing. A ``||robotpuVoice:rest beats||`` block in between is a
one-beat breath — the singer collects itself before the song.

The ``sing note`` blocks are queued: the singer performs them in the
background, so the button block finishes long before the last note.
``||robotpuVoice:wait until speech finished||`` keeps the handler alive
until the final ``C5`` rings out — handy so pressing the button again
can't start a second song on top of the first. A happy face when it
finishes comes from ``||robotpuVoice:on speech finished||``.

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.setVoice(VoicePreset.LittleRobot)
    robotpuVoice.say("Happy birthday to Robot P U!")
    robotpuVoice.singRest(4)
    robotpuVoice.singNote(SingNote.G4, "/HAE", 1)
    robotpuVoice.singNote(SingNote.G4, "PIY", 1)
    robotpuVoice.singNote(SingNote.A4, "BERTH", 4)
    robotpuVoice.singNote(SingNote.G4, "DEY", 4)
    robotpuVoice.singNote(SingNote.C5, "TUW", 4)
    robotpuVoice.singNote(SingNote.B4, "YUW", 8)
    robotpuVoice.singNote(SingNote.G4, "/HAE", 1)
    robotpuVoice.singNote(SingNote.G4, "PIY", 1)
    robotpuVoice.singNote(SingNote.A4, "BERTH", 4)
    robotpuVoice.singNote(SingNote.G4, "DEY", 4)
    robotpuVoice.singNote(SingNote.D5, "TUW", 4)
    robotpuVoice.singNote(SingNote.C5, "YUW", 8)
    robotpuVoice.singNote(SingNote.G4, "/HAE", 1)
    robotpuVoice.singNote(SingNote.G4, "PIY", 1)
    robotpuVoice.singNote(SingNote.G5, "BERTH", 4)
    robotpuVoice.singNote(SingNote.E5, "DEY", 4)
    robotpuVoice.singNote(SingNote.C5, "DIYR", 4)
    robotpuVoice.singNote(SingNote.B4, "ROW", 2)
    robotpuVoice.singNote(SingNote.B4, "BAAT", 2)
    robotpuVoice.singNote(SingNote.A4, "PIY", 2)
    robotpuVoice.singNote(SingNote.A4, "YUW", 6)
    robotpuVoice.singNote(SingNote.F5, "/HAE", 1)
    robotpuVoice.singNote(SingNote.F5, "PIY", 1)
    robotpuVoice.singNote(SingNote.E5, "BERTH", 4)
    robotpuVoice.singNote(SingNote.C5, "DEY", 4)
    robotpuVoice.singNote(SingNote.D5, "TUW", 4)
    robotpuVoice.singNote(SingNote.C5, "YUW", 10)
    robotpuVoice.waitUntilDone()
})
robotpuVoice.onSpeechFinished(function () {
    basic.showIcon(IconNames.Happy)
})
```

## Step 10: Challenge

- Change the name — swap ``ROW`` ``BAAT`` ``PIY`` ``YUW`` for your friend's
  name in phonemes
  (e.g. ``SAE`` ``MIY`` for "Sammy").
- Breathe between lines — add ``||robotpuVoice:rest beats||`` blocks
  (or pick ``rest`` in the ``sing note`` dropdown) at the end of each
  line of the song.
- Make it dance — ``||basic:show leds||`` calls between ``sing note``
  blocks run right away while the notes sing in the background, so the
  lights race ahead of the song. To keep lights in step, use the
  ``sung note`` playable inside ``||music:play ... until done||``
  instead — each note waits for its sound before the next block runs.
- Try the ``sing phonemes`` block — the whole first line is just
  ``#77/HAE #77PIY #68BERTH #77DEY #57TUW #61YUW``. Can you write the rest?
