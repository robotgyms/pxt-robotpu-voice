# Sing and Dance

Time for a real performance: Robot PU sings a Michael Jackson
*Dangerous*-style groove **while it walks, moonwalks, and side-steps**.
Two things run in the background at once — the voice queue sings, and
``||robotPuPro:start||`` runs the moves — so your code choreographs the
show while the robot performs it.

You will need a **Robot PU** with both extensions installed:
**pxt-robotpu** (moves) and **pxt-robotpu-voice** (voice).

## Step 1: Two background workers

``||robotpuVoice:sing note||`` queues a note and returns instantly.
``||robotPuPro:start ... for ... steps||`` works the same way for motion —
it kicks off the action and lets your code continue. Put them together:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.singNote(SingNote.E4, "DUHN", 12)
    robotPuPro.start(robotPuPro.Action.Walk, 4)
})
```

**Try it:** the robot sings one long note *while* walking four steps.
Neither block waited for the other — that's the whole trick.

## Step 2: The Dangerous groove

The same six-note bass riff, sung as "duhn duhn dah duhn dah duhnnn":

```blocks
robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
robotpuVoice.singNote(SingNote.G4, "DAH", 2)
robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
robotpuVoice.singNote(SingNote.D4, "DAH", 2)
robotpuVoice.singNote(SingNote.E4, "DUHN", 6)
```

**Try it:** listen for dum dum *dah* dum *dah* dummmm.

## Step 3: Wait for a move to finish

Moves run in the background, so use ``||robotPuPro:is ... done?||`` to
know when a step is complete — a ``||loops:while||`` loop with a short
pause does the waiting:

```blocks
robotPuPro.start(robotPuPro.Action.Walk, 4)
while (!robotPuPro.isDone(robotPuPro.Action.Walk)) {
    basic.pause(50)
}
```

(``||robotPuPro:start ... and wait||`` does the same thing in one block —
the loop version is here so you can see how to fit *other* code inside
the wait later.)

## Step 4: Moonwalk = walk backward

Michael's signature move is already an action: ``walk backward``. Queue
the groove, then strut forward and slide back:

```blocks
input.onButtonPressed(Button.A, function () {
    robotpuVoice.say("Dangerous!")
    robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
    robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
    robotpuVoice.singNote(SingNote.G4, "DAH", 2)
    robotpuVoice.singNote(SingNote.E4, "DUHN", 1)
    robotpuVoice.singNote(SingNote.D4, "DAH", 2)
    robotpuVoice.singNote(SingNote.E4, "DUHN", 6)
    robotPuPro.start(robotPuPro.Action.Walk, 4)
    while (!robotPuPro.isDone(robotPuPro.Action.Walk)) {
        basic.pause(50)
    }
    robotPuPro.start(robotPuPro.Action.WalkBackward, 4)
    while (!robotPuPro.isDone(robotPuPro.Action.WalkBackward)) {
        basic.pause(50)
    }
})
```

**Try it:** four steps forward, then the moonwalk back — all while the
groove plays.

## Step 5: Side steps

``||robotPuPro:side step||`` slides the robot sideways — `1` steps left,
`-1` steps right. Each call is one gait tick, so repeat it for a few
steps:

```blocks
for (let i = 0; i < 40; i++) {
    robotPuPro.sideStep(-1)
}
for (let i = 0; i < 40; i++) {
    robotPuPro.sideStep(1)
}
```

Right, then left — the robot shuffles across the floor.

## Step 6: The full show

Announce, queue the whole song, then run the choreography — the song and
the moves play out together:

```blocks
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
robotpuVoice.say("Hee hee! Shamone!")
robotPuPro.start(robotPuPro.Action.Walk, 4)
while (!robotPuPro.isDone(robotPuPro.Action.Walk)) {
    basic.pause(50)
}
robotPuPro.start(robotPuPro.Action.WalkBackward, 4)
while (!robotPuPro.isDone(robotPuPro.Action.WalkBackward)) {
    basic.pause(50)
}
for (let i = 0; i < 40; i++) {
    robotPuPro.sideStep(-1)
}
for (let i = 0; i < 40; i++) {
    robotPuPro.sideStep(1)
}
robotpuVoice.waitUntilDone()
robotPuPro.startAndWait(robotPuPro.Action.Stand, 1)
```

The walk out, the moonwalk back, the side-step shuffle — then
``||robotpuVoice:wait until speech finished||`` holds the ending pose
until the last "Shamone!" rings out, and the robot takes a bow with a
happy face.

## Step 7: Challenges

- **Beat-matched moves** — put ``||robotPuPro:dance||`` inside the
  ``is speaking`` wait loop so the robot grooves for the whole song.
- **Bigger stage** — walk forward 8, moonwalk 8, side-step farther.
- **Faster groove** — ``||robotpuVoice:set singing tempo||`` at 150 speeds
  the song up; shorten the moves to keep up.
- **Grand finale** — end with ``||robotPuPro:start||`` ``kick`` or
  ``jump`` for 1 step, timed right after the last note.
- **Safety** — add ``||input:on shake||`` → ``||robotPuPro:stop robot||``
  plus ``||robotpuVoice:stop speaking||`` for an emergency stop button.
