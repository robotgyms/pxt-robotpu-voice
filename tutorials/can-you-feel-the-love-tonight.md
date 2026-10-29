# Sing a Long Song — "Can You Feel the Love Tonight"

Make Robot PU perform the chorus of Elton John's classic — the real
melody, keyed on A — as a ~30 second show: a hummed intro, the famous
hook, the climbing "peace the evening brings", the long "perfect
harmony" descent, and a tender finale. A long song is just **many
``sing note`` calls in a row** — every note is one call, and the queue
plays them back-to-back without gaps.

You will need a **micro:bit V2** — a Robot PU makes the voice much
louder, but any V2 works.

## Step 1: The hummed intro — "ooh" on the A chord

Every show starts before the words: four hummed ``UW`` notes outline
the A chord and set the mood. ``||robotpuVoice:sing note||`` takes a
**note** from the piano dropdown, a **syllable** in SAM phonemes, and
a **hold** — how much to stretch the vowel so the note lasts:

```blocks
robotpuVoice.setVolume(120)
robotpuVoice.singNote(SingNote.A4, "UW", 2)
robotpuVoice.singNote(SingNote.C5, "UW", 2)
robotpuVoice.singNote(SingNote.E5, "UW", 2)
robotpuVoice.singNote(SingNote.A4, "UW", 4)
```

**Try it:** download — ooh-ooh-ooh-oooh, rising then landing back
home. Notice the volume is set first: 120 is a soft, humming level.

## Step 2: The hook — "can you feel the love tonight?"

The famous line climbs up to "love" — E4 rising to C#5, the melody's
peak — then falls back down through "to-night" to A:

```blocks
robotpuVoice.singNote(SingNote.E4, "KAEN", 1)
robotpuVoice.singNote(SingNote.FSharp4, "YUW", 1)
robotpuVoice.singNote(SingNote.A4, "FIY4L", 1)
robotpuVoice.singNote(SingNote.B4, "DHUH", 1)
robotpuVoice.singNote(SingNote.CSharp5, "LUH5V", 4)
robotpuVoice.singNote(SingNote.B4, "TUH", 1)
robotpuVoice.singNote(SingNote.A4, "NAY5", 6)
```

"To-night" steps down B4 → A4, and ``hold 6`` on the last note makes
the "niiiight" ring.

## Step 3: `hold` is your beat count

``hold`` repeats the syllable's last vowel for you — ``hold 6``
stretches the note for a beat and a half. Follow the real rhythm:
quarter notes get ``hold 3``–``4``, eighth notes ``hold 1``, dotted
quarters ``hold 5``–``6``, half notes ``hold 8`` or more.

And when the melody needs silence in rhythm, ``||robotpuVoice:rest||
beats`` stays quiet for the same length a note with that hold would
take — no millisecond maths.

## Step 4: The climb — "the peace the evening brings"

The melody turns around and climbs: A → B → C#5 → E5, settling back
on C#5. Whole two-syllable words ride single notes — ``IY4VNIH5NX``
("evening") and ``BRIH5NX`` ("brings"):

```blocks
robotpuVoice.singRest(1)
robotpuVoice.singNote(SingNote.A4, "DHUH", 1)
robotpuVoice.singNote(SingNote.B4, "PIY4S", 3)
robotpuVoice.singNote(SingNote.C5, "DHUH", 2)
robotpuVoice.singNote(SingNote.E5, "IY4VNIH5NX", 4)
robotpuVoice.singNote(SingNote.C5, "BRIH5NX", 5)
```

The ``rest 1 beat`` is the breath between lines — it lines up with
the note lengths automatically.

## Step 5: The descent — "the world, for once, in perfect harmony"

The longest line — eight notes walking down to E4, and "harmony"
packs three syllables into the last held note (``HAAR5MOWNIY``):

```blocks
robotpuVoice.singRest(1)
robotpuVoice.singNote(SingNote.B4, "DHUH", 1)
robotpuVoice.singNote(SingNote.A4, "WEH4RLD", 3)
robotpuVoice.singNote(SingNote.B4, "FOH4R", 3)
robotpuVoice.singNote(SingNote.C5, "WUH5NS", 1)
robotpuVoice.singNote(SingNote.B4, "IH4N", 1)
robotpuVoice.singNote(SingNote.A4, "PEH4R", 2)
robotpuVoice.singNote(SingNote.F4, "FEH5KT", 2)
robotpuVoice.singNote(SingNote.E4, "HAAR5MOWNIY", 6)
```

## Step 6: The finale — "with all its living things"

Quick pickup, then settle on a long held A4 — "living things" fills
the whole final note (``LIH4VIHNXTHIH5NX``):

```blocks
robotpuVoice.singRest(1)
robotpuVoice.singNote(SingNote.F4, "WIH4TH", 1)
robotpuVoice.singNote(SingNote.A4, "AAL", 3)
robotpuVoice.singNote(SingNote.B4, "IHTS", 3)
robotpuVoice.singNote(SingNote.A4, "LIH4VIHNXTHIH5NX", 8)
```

## Step 7: Give it emotion — dynamics and breath

A flat performance sounds robotic; a *dynamic* one sounds alive. The
trick: ``set speech volume``, ``set singing tempo``, and
``set voice speed pitch mouth throat`` all take effect **immediately**,
not per-utterance — so aim each change at a line by letting the
previous line finish first with ``wait until speech finished``.

Four emotion knobs:

1. **Dynamics** — start soft, swell through the middle lines, fall
   back for the finale: volume 120 → 180 → 255 → 140.
2. **Breath** — sing rests give the gap; for an audible gasp, drop to
   ``||robotpuVoice:sing phonemes||`` once with ``"*"`` — the ``*``
   phoneme is a breath sound.
3. **Accents** — bigger stress digits hit harder: ``LUH5V`` →
   ``LUH7V`` on the emotional peak.
4. **Tempo** — ``set singing tempo`` 85% slows a line down, the way a
   singer lingers on the meaningful part (speaking and rests keep
   their own timing).

## Step 8: The 30-second show

Everything you just sang, assembled into one performance — soft hum,
the hook, the climb, a breath, full-voice "perfect harmony", and a
tender 10-beat finale:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.setVoice(VoicePreset.Sam)
    robotpuVoice.setVolume(120)
    robotpuVoice.singNote(SingNote.A4, "UW", 2)
    robotpuVoice.singNote(SingNote.C5, "UW", 2)
    robotpuVoice.singNote(SingNote.E5, "UW", 2)
    robotpuVoice.singNote(SingNote.A4, "UW", 4)
    robotpuVoice.singNote(SingNote.E4, "KAEN", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "YUW", 1)
    robotpuVoice.singNote(SingNote.A4, "FIY4L", 1)
    robotpuVoice.singNote(SingNote.B4, "DHUH", 1)
    robotpuVoice.singNote(SingNote.CSharp5, "LUH4V", 4)
    robotpuVoice.singNote(SingNote.B4, "TUH", 1)
    robotpuVoice.singNote(SingNote.A4, "NAY4", 6)
    robotpuVoice.singRest(1)
    robotpuVoice.singNote(SingNote.A4, "DHUH", 1)
    robotpuVoice.singNote(SingNote.B4, "PIY4S", 3)
    robotpuVoice.singNote(SingNote.C5, "DHUH", 2)
    robotpuVoice.singNote(SingNote.E5, "IY4VNIH5NX", 4)
    robotpuVoice.singNote(SingNote.C5, "BRIH5NX", 5)
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("*")
    robotpuVoice.setVolume(255)
    robotpuVoice.singNote(SingNote.B4, "DHUH", 1)
    robotpuVoice.singNote(SingNote.A4, "WEH4RLD", 3)
    robotpuVoice.singNote(SingNote.B4, "FOH4R", 3)
    robotpuVoice.singNote(SingNote.C5, "WUH5NS", 1)
    robotpuVoice.singNote(SingNote.B4, "IH4N", 1)
    robotpuVoice.singNote(SingNote.A4, "PEH4R", 2)
    robotpuVoice.singNote(SingNote.F4, "FEH5KT", 2)
    robotpuVoice.singNote(SingNote.E4, "HAAR5MOWNIY", 6)
    robotpuVoice.waitUntilDone()
    robotpuVoice.setVolume(140)
    robotpuVoice.singRest(1)
    robotpuVoice.singNote(SingNote.F4, "WIH4TH", 1)
    robotpuVoice.singNote(SingNote.A4, "AAL", 3)
    robotpuVoice.singNote(SingNote.B4, "IHTS", 3)
    robotpuVoice.singNote(SingNote.A4, "LIH4VIHNXTHIH6NX", 10)
    robotpuVoice.waitUntilDone()
    robotpuVoice.setVolume(255)
})
```

The arc: hummed intro → soft hook and climb → an audible gasp →
full-voice "perfect harmony" → a quiet, tender finale on a 10-beat
"things" → volume reset. (If you ever try a ``music`` backing track
underneath and it drowns the lyrics — drop it; a solo voice always
wins.)

## Step 9: Make it sound right — tuning by ear

Ever wonder why the Happy Birthday tutorial sounds good out of the
box? Its phonemes — ``/HAE PIY BERTH DEY TUW YUW`` — are the *canonical*
SAM demo, polished by thousands of people since 1982 and copied into
manuals, forums, and tutorials ever since. Nobody got it right on the
first try; they got it right on the hundredth. Your song starts where
theirs started.

A robot voice is unforgiving: one wrong note or one mushy syllable and
the song evaporates. Tune it like an instrument:

1. **Diagnose what kind of wrong it is.** *Out of tune* = wrong notes.
   *Mushy words* = wrong phonemes. *Wrong pacing* = wrong ``hold``.
   Don't fix phonemes for a melody problem.
2. **Tune the melody one note at a time.** Hum the real line, then
   nudge suspect notes ±1 step. Check the famous shapes first: this
   hook *climbs* to "love" and *falls* on "to-night" — if your version
   peaks somewhere else, the peak note is wrong.
3. **Clean the phonemes.** Watch the classic traps: don't spell extra
   vowels (``LUHVUH`` sings "luh-vuh" — write ``LUHV``); the "eye"
   sound is the ``AY`` phoneme (``NAY`` not ``NAAIY``); ``NG`` isn't a
   phoneme, use ``NX``; a letter the parser can't read silently kills
   the whole phrase.
4. **Tune the rhythm with ``hold``.** ``hold`` ≈ beats × 4 is a
   starting point, not law — emotional words want an extra beat or
   two. If a line feels rushed, add hold before you add notes.
5. **Tune the dynamics.** Volume under ~140 reads as "soft", 255 is
   belting; 85–90% tempo is a linger; the ``*`` phoneme is a breath.
   A ``music`` backing track that buries the lyrics is not a backing
   track — drop it.
6. **Audition variants fast.** Put two candidate versions on buttons
   A and B in one download and compare, instead of reflashing every
   guess:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.singNote(SingNote.A4, "NAY4", 6)   // candidate 1
})
input.onButtonPressed(Button.B, function () {
    robotpuVoice.singNote(SingNote.B4, "NAY4", 6)   // candidate 2
})
```

## Step 10: Challenges

- **Sing the verse** — "there's a calm surrender to the rush of day"
  uses the same notes, lower: `A4 "DHEHRS" 1`, `C5 "UH" 1`,
  `B4 "KAAM" 1`, `A4 "SEH4R" 1`, `B4 "REH5N" 2`, `A4 "DEH4R" 3`,
  `E4 "TUH" 1`, `F4 "DHUH" 1`, `A4 "RUH5SH" 3`, `A4 "AH4VDEY" 6`.
  Queue it before the chorus.
- **Bigger finale** — push the last "things" to ``hold 12``.
- **Duets** — try `VoicePreset.Elf` for the hook, `VoicePreset.Sam`
  for the rest, and switch between lines.
- **Conduct the robot** — add ``robotPuPro.start(Action.Dance, 2)``
  from the Robot PU extension before the first note so it dances
  while it sings.
- **Raw pitches** — when a note you want isn't on the dropdown,
  ``sing phonemes`` takes ``#nnn`` numbers directly (smaller = higher;
  middle C is 115). The dropdown tops out at B5 (30); you can write
  smaller numbers, but below about 40 the voice turns thin and squeaky
  fast — the ceiling is taste, not hardware.
