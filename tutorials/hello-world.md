# Hello, Robot PU!

Give your robot a voice! This tutorial walks through every block in the
Robot PU Voice extension — from a first "hello" all the way to singing
notes, timed rests, and custom voice personalities.

By the end, you'll know every tool you need for fun projects: talking
alarms, singing robots, radio-controlled announcers, and more.

You will need a **micro:bit V2** — the extension needs its audio
hardware. On Robot PU, the voice comes out of the robot's speaker
through pin 0.

## Step 1: Add the extension

1. Open https://makecode.microbit.org and start a **New Project**.
2. Click **Extensions** under the gearwheel menu.
3. Search for **pxt-robotpu-voice** (or paste the GitHub URL) and import
   it.

A new **Robot PU Voice** toolbox appears — that's where all the voice
blocks live.

## Step 2: Say "hello world"

Drag out a ``||robotpuVoice:say||`` block. It speaks English text — you
don't need to know any phonemes:

```blocks
robotpuVoice.say("Hello world! I am Robot P U")
```

**Try it:** download to your micro:bit. "Hello world!" comes out of the
speaker — that's the whole trick.

Notice the ``||basic:on start||`` isn't even needed — ``say`` works
anywhere, including inside button handlers.

## Step 3: It doesn't stop your robot

``||robotpuVoice:say||`` returns immediately — the voice renders on a
background fiber while your code keeps running. Prove it by making the
LEDs animate *while* it talks:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.say("I can talk and dance at the same time")
    basic.showIcon(IconNames.Happy)
    basic.pause(500)
    basic.showIcon(IconNames.SmallHeart)
})
```

The icon appears instantly — it doesn't wait for the sentence to end.
This is what makes Robot PU able to drive and chat at once.

## Step 4: Sometimes you DO want to wait

``||robotpuVoice:say and wait||`` blocks until the sentence finishes —
useful when order matters, like announcing before an action:

```blocks
input.onButtonPressed(Button.B, function () {
    robotpuVoice.sayAndWait("Moving forward!")
    basic.showIcon(IconNames.ArrowNorth)
})
```

There's also ``||robotpuVoice:wait until speech finished||``, which waits
for everything queued — and ``||robotpuVoice:is speaking||``, a true/false
check you can use in ``||logic:if||`` blocks to react while it talks.

## Step 5: Stop!

Made a mistake? ``||robotpuVoice:stop speaking||`` clears the queue and
halts the current sentence:

```blocks
input.onGesture(Gesture.Shake, function () {
    robotpuVoice.stopSpeaking()
})
```

## Step 6: Eight voices, one robot

Robot PU has eight built-in personalities. Try them with
``||robotpuVoice:set voice||`` — ``little robot`` and ``dalek`` are crowd
favorites:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.setVoice(VoicePreset.RobotPU)
    robotpuVoice.say("I am the default voice")
})
input.onButtonPressed(Button.B, function () {
    robotpuVoice.setVoice(VoicePreset.Dalek)
    robotpuVoice.say("EXTERMINATE")
})
```

**Try it:** pick a different preset each press. Which one sounds most
like a Minion?

## Step 7: Build your own voice

Each preset is just four numbers. ``||robotpuVoice:set voice speed pitch
mouth throat||`` tunes them directly (each 0–255):

```blocks
robotpuVoice.configureVoice(200, 80, 190, 100)
robotpuVoice.say("I made this voice myself")
```

- **speed** — how fast it talks (higher = faster)
- **pitch** — how high or deep (higher = deeper)
- **mouth** — how clearly it enunciates
- **throat** — how relaxed the tone is

Twiddle one number at a time and listen. You'll quickly invent a voice
no one has heard before.

## Step 8: Phonemes — the voice's alphabet

English spelling confuses computers ("though" vs "through"!), so the
engine really speaks **phonemes** — sound atoms like ``AY`` (the "i" in
"ice") or ``TCH``. The ``||robotpuVoice:pronounce phonemes||`` block
takes them raw:

```blocks
robotpuVoice.pronounce("/HAA4LOW WERLD")
```

Two tricks in that string: ``/H`` is SAM's "hard H" — a plain ``H``
isn't a phoneme on its own, it needs the slash. And ``4`` is a stress
mark — it puts the emphasis on "HA".

Want to know how the engine would spell a word? 
``||robotpuVoice:phonemes for||`` converts English to phonemes without
speaking — write it to serial and copy the result:

```blocks
input.onButtonPressed(Button.A, function () {
    serial.writeLine(robotpuVoice.toPhonemes("robot"))
})
```

The full phoneme table is in the extension's README.

## Step 9: Make it sing

Three ways to sing, from easiest to most precise:

**Chant it** — ``||robotpuVoice:sing||`` renders English on a flat,
robotic pitch:

```blocks
robotpuVoice.sing("daisy daisy")
```

**Sing a note** — ``||robotpuVoice:sing note||`` picks a real musical
note, a syllable, and how long to hold it:

```blocks
robotpuVoice.singNote(SingNote.C4, "DOW", 4)
robotpuVoice.singNote(SingNote.E4, "MIY", 4)
robotpuVoice.singNote(SingNote.G4, "SOH", 8)
```

That's a C major chord played one note at a time — "doe mee soh".

**Sing a whole phrase** — ``||robotpuVoice:sing phonemes||`` packs many
notes into one block. ``#nnn`` sets the pitch (``#115`` = middle C) and
repeated letters stretch the vowel:

```blocks
robotpuVoice.singPhonemes("#115DOWWWWWW #103REYYYYYY #94MIYYYYYY")
```

That's Do-Re-Mi in a single block. This is how real songs are written —
see the *Happy Birthday* and *Minion Banana Quartet* tutorials.

## Step 10: Rests — silence is part of the music

``||robotpuVoice:rest beats||`` is a note that sings nothing! It counts
the same beats as a sung note's ``hold``, so you never have to convert
to milliseconds:

```blocks
robotpuVoice.singNote(SingNote.C4, "DOW", 4)
robotpuVoice.singRest(4)
robotpuVoice.singNote(SingNote.G4, "SOH", 8)
```

**Try it:** you get "doe" …a one-beat silence… "soh". 

(Picking ``rest`` in the note dropdown of ``sing note`` does the same
thing.)

For longer waits there's ``||robotpuVoice:rest (ms)||``, which queues
timed silence in milliseconds — handy when a singer should join a song
several seconds late. Both kinds of rest play in sequence with the
notes: essential for multi-robot performances.

## Step 11: React when the talking ends

``||robotpuVoice:on speech finished||`` runs your code when the last
queued sound plays out — perfect for a bow, a smile, or moving on:

```blocks
robotpuVoice.onSpeechFinished(function () {
    basic.showIcon(IconNames.Happy)
})
robotpuVoice.say("That's all folks!")
```

## Step 12: Sound controls

A few blocks tune the output:

```blocks
robotpuVoice.setVolume(200)
robotpuVoice.useOnboardSpeaker(true)
robotpuVoice.outputToPin0(true)
```

- ``||robotpuVoice:set speech volume||`` — 0–255, affects the whole mixer
- ``||robotpuVoice:use on-board speaker||`` — the micro:bit's speaker
- ``||robotpuVoice:output audio to pin 0||`` — the edge pin that drives
  Robot PU's amplifier

When speech finishes, the audio hardware powers down automatically — no
battery wasted humming on pin 0. ``||robotpuVoice:power down audio||``
forces it immediately if you need silence *right now*.

## Step 13: The grand finale — Robot PU's one-robot show

Time to put every block on stage. Press button A and Robot PU runs the
whole show: an introduction, a self-penned poem, a run of sung notes, and
a short song — then takes a bow when the last sound rings out.

Watch how each block just queues its part: the performer never stops to
wait, it just keeps stacking the set list — sixteen acts deep.

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.setVoice(VoicePreset.RobotPU)
    // Act 1: the introduction — plain speech, plus its name in raw
    // phonemes so it comes out perfectly pronounced
    robotpuVoice.say("Ladies and gentlemen, boys and girls!")
    robotpuVoice.say("Please welcome to the stage...")
    robotpuVoice.pronounce("ROW1BAAT PIY5 YUW5!")
    robotpuVoice.rest(600)
    // Act 2: a poem about itself, in a different voice
    robotpuVoice.setVoice(VoicePreset.LittleRobot)
    robotpuVoice.say("I am robot P U, small but proud.")
    robotpuVoice.say("My voice is squeaky. My beeps are loud.")
    robotpuVoice.say("I walk and I talk and I sing you a song.")
    robotpuVoice.say("With my micro-bit brain, I cannot go wrong!")
    robotpuVoice.rest(600)
    // Act 3: a run of sung notes — doe mee soh doe
    robotpuVoice.setSingTempo(100)
    robotpuVoice.singNote(SingNote.C4, "DOW", 4)
    robotpuVoice.singNote(SingNote.E4, "MIY", 4)
    robotpuVoice.singNote(SingNote.G4, "SOH", 4)
    robotpuVoice.singNote(SingNote.C5, "DOW", 8)
    robotpuVoice.singRest(2)
    // Act 4: the short song — "I am a little robot" sung to the tune of
    // Twinkle Twinkle, all packed in one block: one syllable per note
    // (AY AEM AH LIH TL ROW BAAT on C C G G A A G)
    robotpuVoice.singPhonemes("#115AY4 #115AEM #77AH #77LIH4 #68TL #68ROW #77BAAAAT")
    robotpuVoice.waitUntilDone()
    // Encore: the thank-you goes through the music play block —
    // "spoken words" is say() living in a play socket
    music.play(robotpuVoice.sayPlayable("I am robot P U, small but proud. Thank you!"), music.PlaybackMode.UntilDone)
})
robotpuVoice.onSpeechFinished(function () {
    basic.showIcon(IconNames.Happy)
})
```

Every block you met in this tutorial is in there: `say`, `pronounce`,
`rest`, `set voice`, `sing note`, `rest beats`, `sing phonemes`,
`set singing tempo`, `wait until speech finished`, `on speech finished`,
plus `spoken words` inside ``||music:play||`` — talking, note singing,
and song singing from one queue, with the playables as an encore.

## Step 14: You're ready — go build something fun

You now know every block. Some project ideas:

- **Talking alarm** — ``on button pressed`` → ``say and wait`` a warning,
  then drive.
- **Obstacle announcer** — read a distance sensor, ``say("Obstacle")``
  when it's close. The non-blocking queue means the robot never freezes.
- **Voice quiz show** — each preset voices a different question.
- **Robot choir** — the [Minion Banana Quartet](/tutorials/minion-banana-quartet)
  tutorial: four micro:bits singing in sync over radio.
- **Sing Happy Birthday** — the [Happy Birthday](/tutorials/happy-birthday)
  tutorial: a full song, note by note.
- **Light show** — the [Sing and Light Show](/tutorials/sing-and-light-show)
  tutorial: sing while LEDs dance, on a bare micro:bit.
- **Full performance** — the [Sing and Dance](/tutorials/sing-and-dance)
  tutorial: Robot PU walks and moonwalks while it sings.

Happy hacking — ba-na-naaa!
