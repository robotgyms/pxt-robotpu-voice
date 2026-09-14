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
- **syllable** — the sound to sing, written in phonemes (``HAE`` sounds like "ha")
- **hold** — how long to stretch the note (bigger = longer)

```blocks
robotpuVoice.singNote(SingNote.G4, "HAE", 4)
```

**Try it:** Robot PU sings "haaa" on a G!

## Step 5: Line 1 — "Happy birthday to you"

A song is just notes in a row. Here is the first line of Happy Birthday —
watch how the notes go up and down:

```blocks
robotpuVoice.singNote(SingNote.G4, "HAE", 1)
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
robotpuVoice.singNote(SingNote.G4, "HAE", 1)
robotpuVoice.singNote(SingNote.G4, "PIY", 1)
robotpuVoice.singNote(SingNote.A4, "BERTH", 4)
robotpuVoice.singNote(SingNote.G4, "DEY", 4)
robotpuVoice.singNote(SingNote.D5, "TUW", 4)
robotpuVoice.singNote(SingNote.C5, "YUW", 8)
```

## Step 7: Line 3 — "Happy birthday dear Robot PU"

This line has the highest note in the song — ``G5`` on "birth". We squeeze
the name into two syllables: ``ROW`` + ``BAAT``.

```blocks
robotpuVoice.singNote(SingNote.G4, "HAE", 1)
robotpuVoice.singNote(SingNote.G4, "PIY", 1)
robotpuVoice.singNote(SingNote.G5, "BERTH", 4)
robotpuVoice.singNote(SingNote.E5, "DEY", 4)
robotpuVoice.singNote(SingNote.C5, "DIYR", 4)
robotpuVoice.singNote(SingNote.B4, "ROW", 4)
robotpuVoice.singNote(SingNote.A4, "BAAT", 8)
```

## Step 8: Line 4 — the finale

The last line drops to ``F5`` and ends back home on ``C5``:

```blocks
robotpuVoice.singNote(SingNote.F5, "HAE", 1)
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
one-beat breath — the singer collects itself before the song. Add a
happy face when it finishes with ``||robotpuVoice:on speech finished||``.

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.setVoice(VoicePreset.LittleRobot)
    robotpuVoice.say("Happy birthday to you! Mike!")
    robotpuVoice.singRest(4)
    robotpuVoice.singNote(SingNote.G4, "HAE", 1)
    robotpuVoice.singNote(SingNote.G4, "PIY", 1)
    robotpuVoice.singNote(SingNote.A4, "BERTH", 4)
    robotpuVoice.singNote(SingNote.G4, "DEY", 4)
    robotpuVoice.singNote(SingNote.C5, "TUW", 4)
    robotpuVoice.singNote(SingNote.B4, "YUW", 8)
    robotpuVoice.singNote(SingNote.G4, "HAE", 1)
    robotpuVoice.singNote(SingNote.G4, "PIY", 1)
    robotpuVoice.singNote(SingNote.A4, "BERTH", 4)
    robotpuVoice.singNote(SingNote.G4, "DEY", 4)
    robotpuVoice.singNote(SingNote.D5, "TUW", 4)
    robotpuVoice.singNote(SingNote.C5, "YUW", 8)
    robotpuVoice.singNote(SingNote.G4, "HAE", 1)
    robotpuVoice.singNote(SingNote.G4, "PIY", 1)
    robotpuVoice.singNote(SingNote.G5, "BERTH", 4)
    robotpuVoice.singNote(SingNote.E5, "DEY", 4)
    robotpuVoice.singNote(SingNote.C5, "DIYR", 4)
    robotpuVoice.singNote(SingNote.B4, "ROW", 4)
    robotpuVoice.singNote(SingNote.A4, "BAAT", 8)
    robotpuVoice.singNote(SingNote.F5, "HAE", 1)
    robotpuVoice.singNote(SingNote.F5, "PIY", 1)
    robotpuVoice.singNote(SingNote.E5, "BERTH", 4)
    robotpuVoice.singNote(SingNote.C5, "DEY", 4)
    robotpuVoice.singNote(SingNote.D5, "TUW", 4)
    robotpuVoice.singNote(SingNote.C5, "YUW", 10)
})
robotpuVoice.onSpeechFinished(function () {
    basic.showIcon(IconNames.Happy)
})
```

## Step 10: Challenge

- Change the name — swap ``ROW`` ``BAAT`` for your friend's name in phonemes
  (e.g. ``SAE`` ``MIY`` for "Sammy").
- Breathe between lines — add ``||robotpuVoice:rest beats||`` blocks
  (or pick ``rest`` in the ``sing note`` dropdown) at the end of each
  line of the song.
- Make it dance — add ``||basic:show leds||`` patterns inside the button
  block between ``singNote`` calls.
- Try the ``sing phonemes`` block — the whole first line is just
  ``#77HAE #77PIY #68BERTH #77DEY #57TUW #61YUW``. Can you write the rest?
