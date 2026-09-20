# Sing and Light Show

This tutorial shows how to make the micro:bit **talk and sing while it
does something else at the same time**. Every `say`/`sing` block queues
its sound and returns instantly — the voice plays on a background fiber
while your code keeps running. To prove it, a short Michael Jackson
*Dangerous*-style groove plays while an LED light show runs on the
display.

It's a low-cost demo: **all you need is a micro:bit V2** — no Robot PU
required. Sound comes out of the built-in speaker (or pin 0 if you wire
one up).

## Step 1: The secret — sound doesn't wait

Watch what happens when ``||robotpuVoice:say||`` and
``||robotpuVoice:sing note||`` blocks meet an LED block:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.say("Watch this!")
    robotpuVoice.singNote(SingNote.E4, "DUHN", 8)
    basic.showIcon(IconNames.Happy)
})
```

**Try it:** the face appears *instantly* — it doesn't wait for the
talking or the note. Speech queues and plays in the background, so the
LED code runs while the sound plays. That gap is where the light show
goes.

## Step 2: The Dangerous groove

Here is a short riff in the style of *Dangerous* — six notes, sung as
"duhn duhn dah duhn dah duhnnn":

```blocks
robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
robotpuVoice.singNote(SingNote.G4, "DAH", 2)
robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
robotpuVoice.singNote(SingNote.D4, "DAH", 2)
robotpuVoice.singNote(SingNote.E4, "DUHN", 6)
```

**Try it:** download and listen for the punchy bass line — dum dum
*dah* dum *dah* dummmm.

## Step 3: Moonwalk

A moonwalk is just a dot sliding **backwards**. ``||led:plot||`` lights
one LED, ``||basic:pause||`` holds it, ``||led:unplot||`` clears it — and
the ``||loops:while||`` loop repeats it only while
``||robotpuVoice:is speaking||`` is true, so the dance stops when the
song does:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.say("Dangerous!")
    robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
    robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
    robotpuVoice.singNote(SingNote.G4, "DAH", 2)
    robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
    robotpuVoice.singNote(SingNote.D4, "DAH", 2)
    robotpuVoice.singNote(SingNote.E4, "DUHN", 6)
    while (robotpuVoice.isSpeaking()) {
        for (let x = 4; x >= 0; x--) {
            led.plot(x, 2)
            basic.pause(120)
            led.unplot(x, 2)
        }
    }
})
```

**Try it:** Robot PU announces "Dangerous!", sings the groove, and a
single LED slides right-to-left underneath — sliding backwards, just like
the moonwalk.

## Step 4: Add a shuffle

One move gets boring. Alternate the moonwalk with a left-right arrow
shuffle:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.say("Dangerous!")
    robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
    robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
    robotpuVoice.singNote(SingNote.G4, "DAH", 2)
    robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
    robotpuVoice.singNote(SingNote.D4, "DAH", 2)
    robotpuVoice.singNote(SingNote.E4, "DUHN", 6)
    while (robotpuVoice.isSpeaking()) {
        for (let x = 4; x >= 0; x--) {
            led.plot(x, 2)
            basic.pause(120)
            led.unplot(x, 2)
        }
        basic.showIcon(IconNames.ArrowWest)
        basic.pause(240)
        basic.showIcon(IconNames.ArrowEast)
        basic.pause(240)
        basic.clearScreen()
    }
})
```

Now the robot slides, kicks left, kicks right, and slides again — on beat
with the groove.

## Step 5: Encore — loop the riff

Real songs repeat. Wrap the six notes in a ``||loops:repeat||`` loop so
the groove plays twice — the queue holds it all, and the dancer keeps
going as long as ``is speaking`` is true:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.setVoice(VoicePreset.LittleRobot)
    robotpuVoice.say("Dangerous!")
    for (let i = 0; i < 2; i++) {
        robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
        robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
        robotpuVoice.singNote(SingNote.G4, "DAH", 2)
        robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
        robotpuVoice.singNote(SingNote.D4, "DAH", 2)
        robotpuVoice.singNote(SingNote.E4, "DUHN", 6)
        robotpuVoice.singRest(2)
    }
    robotpuVoice.say("Hee hee!")
    while (robotpuVoice.isSpeaking()) {
        for (let x = 4; x >= 0; x--) {
            led.plot(x, 2)
            basic.pause(120)
            led.unplot(x, 2)
        }
        basic.showIcon(IconNames.ArrowWest)
        basic.pause(240)
        basic.showIcon(IconNames.ArrowEast)
        basic.pause(240)
        basic.clearScreen()
    }
    basic.showIcon(IconNames.Happy)
})
```

A ``||robotpuVoice:rest beats||`` block between repeats is the singer
catching its breath. The final happy face is the bow — it appears only
after the last "Hee hee!" rings out.

## Step 6: Why not `until done`?

You could write this with ``||music:play||`` — but choose the mode
carefully. ``until done`` freezes your code during every note, so the
lights could never run alongside the song; ``in background`` enqueues and
returns, which is exactly what the ``sing note`` blocks already do with
less typing. The queued blocks are what make singing-and-dancing simple:
the performer queues its whole act, then walks out on stage.

## Step 7: Challenges

- **Longer set** — repeat the riff 4 times and add a second LED lane
  sliding the other way (``led.plot(x, 4)``).
- **Hee hee!** — Michael's signature yelp: try squeezing it into
  ``||robotpuVoice:sing phonemes||`` as ``#91HIY4 #77YIY``.
- **Tempo change** — ``||robotpuVoice:set singing tempo||`` at 150 makes
  the same groove faster; make the dance keep up by shortening the
  pauses.
- **Real robot moves** — the [Sing and Dance — Jackson](/tutorials/sing-and-dance-jackson)
  tutorial makes Robot PU itself walk, moonwalk, and side-step along to
  this same groove (needs the pxt-robotpu extension).
- **Solo act** — write your own groove: any row of ``sing note`` blocks
  queued before the ``while`` loop will play under the dance.
