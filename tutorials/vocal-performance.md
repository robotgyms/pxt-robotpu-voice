# Vocal Performance

Time for a stage show: Robot PU sings a three-song medley — *Memory*
(the *Cats* ballad covered by Celine Dion), *BIRDS OF A FEATHER* by
Billie Eilish, and *CAN'T STOP THE FEELING!* by Justin Timberlake — with
real singer body language. It stands at the mic, grooves to each song's
own tempo, faces each side of the audience, lifts its head on the big
note, and takes a bow at the end.

You will need a **Robot PU** with both extensions installed:
**pxt-robotpu** (moves) and **pxt-robotpu-voice** (voice).

## Step 1: Stand at the mic

``||robotpuVoice:sing note||`` queues a note and returns instantly.
``||robotPuPro:start ... for ... steps||`` does the same for motion —
and ``0`` steps means *forever*. Start ``rest``: despite the name it's
the singer's idle — the robot holds its standing pose, keeps its
balance, nods its head a little with loudness, and pulses its eye LEDs
with the sound:

```blocks
robotPuPro.start(robotPuPro.Action.Rest, 0)
robotpuVoice.singNote(SingNote.D4, "DAENS", 6)
```

**Try it:** the robot stands at the mic and sings one long "dance" —
watch its head and eyes follow the voice. Neither block waited for the
other; that's the whole trick.

## Step 2: "I can't stop the feeling"

The hook is a chant parked on **D** that dips to **C** on "stop" and
jumps up to **E** on "fee-ling" — just three pitches:

```blocks
robotpuVoice.singNote(SingNote.D4, "AY", 1)
robotpuVoice.singNote(SingNote.D4, "KAENT", 1)
robotpuVoice.singNote(SingNote.C4, "STAAP", 1)
robotpuVoice.singNote(SingNote.D4, "DHAH", 1)
robotpuVoice.singNote(SingNote.E4, "FIY", 2)
robotpuVoice.singNote(SingNote.E4, "LIHNX", 4)
robotpuVoice.singRest(1)
```

**Try it:** "I can't stop the fee-ling" — flat, flat, dip, flat, jump,
hold.

## Step 3: "So just dance, dance, dance"

The answer chant dips to **C** on "so" then chants "dance dance dance"
back on **D**:

```blocks
robotpuVoice.singNote(SingNote.C4, "SOW", 1)
robotpuVoice.singNote(SingNote.D4, "JAHST", 1)
robotpuVoice.singNote(SingNote.D4, "DAENS", 1)
robotpuVoice.singNote(SingNote.D4, "DAENS", 1)
robotpuVoice.singNote(SingNote.D4, "DAENS", 4)
robotpuVoice.singRest(2)
```

## Step 4: Work the room — head moves

Singers don't stare straight ahead.
``||robotPuPro:smooth move ... servo to||`` glides one joint to an angle
while the voice keeps singing. ``head yaw`` pans the gaze — ``90`` is
center, and lower/higher look to opposite sides of the room;
``head pitch`` tilts the head — ``90`` is level, higher bows it, lower
raises it:

```blocks
robotPuPro.servoSmooth(robotPuPro.ServoJoint.HeadYaw, 120)
robotpuVoice.singNote(SingNote.D4, "AY", 1)
robotpuVoice.singNote(SingNote.D4, "KAENT", 1)
robotPuPro.servoSmooth(robotPuPro.ServoJoint.HeadYaw, 60)
robotpuVoice.singNote(SingNote.C4, "STAAP", 1)
robotpuVoice.singNote(SingNote.D4, "DHAH", 1)
robotPuPro.servoSmooth(robotPuPro.ServoJoint.HeadPitch, 70)
robotpuVoice.singNote(SingNote.E4, "FIY", 2)
robotpuVoice.singNote(SingNote.E4, "LIHNX", 4)
robotpuVoice.singRest(1)
robotPuPro.start(robotPuPro.Action.Rest, 0)
```

A glance to one side, a glance to the other, then the head lifts on the
high "fee-ling" — pure pop star. Servo blocks take direct control of
that one joint, so ``start rest for 0 steps`` afterwards hands the body
back to the sound-reactive idle: the head eases to center and nods with
the voice again.

## Step 5: Move to the beat

Real singers groove with the tempo. This is the same trick as the
*direct servo control* stage demo: a ``||basic:forever||`` loop turns
the clock into a beat counter — ``control.millis() / beatMs`` counts
beats and ``% 4`` walks a four-beat bar — and each beat picks a pose
from four pattern arrays. Legs bend for a bounce on beats 1 and 3, feet
roll to shift its weight on 2 and 4, and the head swings and nods along:

```blocks
let beatMs = 0
let energy = 1
let yawCenter = 90
let pitchCenter = 90
const yawPattern = [20, 0, -20, 0]
const pitchPattern = [5, -25, 5, -15]
const legPattern = [8, 0, 8, 0]
const footPattern = [-8, 10, -8, -10]
basic.forever(function () {
    if (beatMs > 0) {
        const beat = Math.floor(control.millis() / beatMs) % 4
        robotPuPro.servoStep(robotPuPro.ServoJoint.LeftFoot, 90 + footPattern[beat] * energy, 1.5 * energy)
        robotPuPro.servoStep(robotPuPro.ServoJoint.LeftLeg, 90 + legPattern[beat] * energy, 1.5 * energy)
        robotPuPro.servoStep(robotPuPro.ServoJoint.RightFoot, 90 + footPattern[beat] * energy, 1.5 * energy)
        robotPuPro.servoStep(robotPuPro.ServoJoint.RightLeg, 90 + legPattern[beat] * energy, 1.5 * energy)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, yawCenter + yawPattern[beat] * energy, 1.5 * energy)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, pitchCenter + pitchPattern[beat] * energy, 1.5 * energy)
    }
    basic.pause(10)
})
```

- ``beatMs`` is the tempo — ``60000 / BPM`` — and doubles as the on
  switch: ``0`` stands the loop down so ``start ... for ... steps``
  gaits still work between songs. While it runs, every ``move ... servo
  to ... with step size`` re-asserts direct control, so the groove can't
  be pulled back to the rest pose.
- ``energy`` scales how hard PU hits each pose and how fast it gets
  there — a ballad wants a fraction of the finale's swagger.
- ``yawCenter`` and ``pitchCenter`` aim the head, so "bow your head" or
  "look up on the big note" is one assignment instead of a servo call.
- Keep the leg and foot offsets small — those servos are holding PU
  upright while it sings.

Two tiny helpers keep the show readable. The pause in ``stopGroove``
matters: it gives the loop a couple of ticks to stand down, because a
servo step landing *after* a ``start`` would steal the body back and
stall a counted gait:

```blocks
function startGroove(bpm: number, power: number) {
    yawCenter = 90
    pitchCenter = 90
    energy = power
    beatMs = 60000 / bpm
}
function stopGroove() {
    beatMs = 0
    basic.pause(50)
    robotPuPro.start(robotPuPro.Action.Rest, 0)
}
```

**Try it:** ``startGroove(113, 1)``, sing the Step 2 hook, then
``robotpuVoice.waitUntilDone()`` and ``stopGroove()`` — PU bounces and
swings its head at 113 BPM while it chants, then settles back into the
standing idle.

## Step 6: The full show

Everything together — the medley, the stage blocking, and a groove at
each song's own tempo: a slow 66 BPM sway for the ballad, a looser
105 BPM groove for Billie Eilish, and a full-energy 113 BPM bounce for
the finale. The head storytelling stays — ``pitchCenter`` does the
bowing now — and the turns and the strut run ``and wait`` between songs,
because the groove would stomp them mid-step.

```blocks
let beatMs = 0
let energy = 1
let yawCenter = 90
let pitchCenter = 90
const yawPattern = [20, 0, -20, 0]
const pitchPattern = [5, -25, 5, -15]
const legPattern = [8, 0, 8, 0]
const footPattern = [-8, 10, -8, -10]
basic.forever(function () {
    if (beatMs > 0) {
        const beat = Math.floor(control.millis() / beatMs) % 4
        robotPuPro.servoStep(robotPuPro.ServoJoint.LeftFoot, 90 + footPattern[beat] * energy, 1.5 * energy)
        robotPuPro.servoStep(robotPuPro.ServoJoint.LeftLeg, 90 + legPattern[beat] * energy, 1.5 * energy)
        robotPuPro.servoStep(robotPuPro.ServoJoint.RightFoot, 90 + footPattern[beat] * energy, 1.5 * energy)
        robotPuPro.servoStep(robotPuPro.ServoJoint.RightLeg, 90 + legPattern[beat] * energy, 1.5 * energy)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadYaw, yawCenter + yawPattern[beat] * energy, 1.5 * energy)
        robotPuPro.servoStep(robotPuPro.ServoJoint.HeadPitch, pitchCenter + pitchPattern[beat] * energy, 1.5 * energy)
    }
    basic.pause(10)
})
function startGroove(bpm: number, power: number) {
    yawCenter = 90
    pitchCenter = 90
    energy = power
    beatMs = 60000 / bpm
}
function stopGroove() {
    beatMs = 0
    basic.pause(50)
    robotPuPro.start(robotPuPro.Action.Rest, 0)
}
function singRefrain() {
    robotpuVoice.singNote(SingNote.FSharp4, "BERDZ", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "AHV", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "AH", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "FEH", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "DHER", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "WIY", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "SHUHD", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "STIHK", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "TAH", 1)
    robotpuVoice.singNote(SingNote.G4, "GEH", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "DHER", 2)
    robotpuVoice.singNote(SingNote.FSharp4, "AY", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "NOW", 4)
    robotpuVoice.singRest(2)
    robotpuVoice.singNote(SingNote.FSharp4, "AY", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "SEHD", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "AYD", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "NEH", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "VER", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "THIHNXK", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "AY", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "WAHZ", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "NT", 1)
    robotpuVoice.singNote(SingNote.G4, "BEH", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "TER", 2)
    robotpuVoice.singNote(SingNote.FSharp4, "AH", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "LOWN", 4)
    robotpuVoice.singRest(2)
    robotpuVoice.singNote(SingNote.FSharp4, "KAENT", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "CHEYN", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "DHAH", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "WEH", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "DHER", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "MAYT", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "NAAT", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "BIY", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "FOH", 1)
    robotpuVoice.singNote(SingNote.G4, "EHV", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "VER", 4)
    robotpuVoice.singRest(2)
    robotpuVoice.singNote(SingNote.FSharp4, "BAHT", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "IHF", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "IHTS", 1)
    robotpuVoice.singNote(SingNote.E4, "FOH", 1)
    robotpuVoice.singNote(SingNote.G4, "EHV", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "VER", 2)
    robotpuVoice.singNote(SingNote.FSharp4, "IHTS", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "IY", 1)
    robotpuVoice.singNote(SingNote.E4, "VEHN", 1)
    robotpuVoice.singNote(SingNote.G4, "BEH", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "TER", 4)
    robotpuVoice.singRest(2)
}

function singFeeling() {
    robotpuVoice.singNote(SingNote.D4, "AY", 1)
    robotpuVoice.singNote(SingNote.D4, "KAENT", 1)
    robotpuVoice.singNote(SingNote.C4, "STAAP", 1)
    robotpuVoice.singNote(SingNote.D4, "DHAH", 1)
    robotpuVoice.singNote(SingNote.E4, "FIY", 2)
    robotpuVoice.singNote(SingNote.E4, "LIHNX", 4)
    robotpuVoice.singRest(1)
    robotpuVoice.singNote(SingNote.C4, "SOW", 1)
    robotpuVoice.singNote(SingNote.D4, "JAHST", 1)
    robotpuVoice.singNote(SingNote.D4, "DAENS", 1)
    robotpuVoice.singNote(SingNote.D4, "DAENS", 1)
    robotpuVoice.singNote(SingNote.D4, "DAENS", 4)
    robotpuVoice.singRest(2)
    robotpuVoice.singNote(SingNote.D4, "AY", 1)
    robotpuVoice.singNote(SingNote.D4, "KAENT", 1)
    robotpuVoice.singNote(SingNote.C4, "STAAP", 1)
    robotpuVoice.singNote(SingNote.D4, "DHAH", 1)
    robotpuVoice.singNote(SingNote.E4, "FIY", 2)
    robotpuVoice.singNote(SingNote.D4, "LIHNX", 4)
    robotpuVoice.singRest(1)
    robotpuVoice.singNote(SingNote.C4, "SOW", 1)
    robotpuVoice.singNote(SingNote.D4, "JAHST", 1)
    robotpuVoice.singNote(SingNote.D4, "DAENS", 1)
    robotpuVoice.singNote(SingNote.D4, "DAENS", 1)
    robotpuVoice.singNote(SingNote.D4, "DAENS", 1)
    robotpuVoice.singNote(SingNote.D4, "KAHM", 1)
    robotpuVoice.singNote(SingNote.A3, "AAN", 6)
}

function singMemory() {
    // "Mem-ory, all alone in the moonlight" — head stays bowed
    robotpuVoice.singNote(SingNote.ASharp4, "MEHM", 2)
    robotpuVoice.singNote(SingNote.ASharp4, "RIY", 4)
    robotpuVoice.singRest(1)
    robotpuVoice.singNote(SingNote.A4, "AAL", 2)
    robotpuVoice.singNote(SingNote.ASharp4, "AH", 1)
    robotpuVoice.singNote(SingNote.C5, "LOWN", 2)
    robotpuVoice.singNote(SingNote.ASharp4, "IHN", 1)
    robotpuVoice.singNote(SingNote.G4, "DHAH", 1)
    robotpuVoice.singNote(SingNote.ASharp4, "MUWN", 2)
    robotpuVoice.singNote(SingNote.ASharp4, "LAYT", 4)
    robotpuVoice.singRest(1)
    // "I can dream of the old days, I was beautiful then" — head rises
    pitchCenter = 90
    robotpuVoice.singNote(SingNote.A4, "AY", 1)
    robotpuVoice.singNote(SingNote.ASharp4, "KAEN", 1)
    robotpuVoice.singNote(SingNote.C5, "DRIYM", 2)
    robotpuVoice.singNote(SingNote.ASharp4, "AHV", 1)
    robotpuVoice.singNote(SingNote.F4, "DHAH", 1)
    robotpuVoice.singNote(SingNote.G4, "OWLD", 2)
    robotpuVoice.singNote(SingNote.G4, "DEYZ", 4)
    robotpuVoice.singRest(1)
    robotpuVoice.singNote(SingNote.DSharp4, "AY", 1)
    robotpuVoice.singNote(SingNote.F4, "WAHZ", 1)
    robotpuVoice.singNote(SingNote.G4, "BYUW", 2)
    robotpuVoice.singNote(SingNote.F4, "TIY", 1)
    robotpuVoice.singNote(SingNote.DSharp4, "FUWL", 2)
    robotpuVoice.singNote(SingNote.D4, "DHEHN", 4)
    robotpuVoice.singRest(2)
    // "Touch me! ..." — head up for the big note
    pitchCenter = 65
    robotpuVoice.singNote(SingNote.CSharp5, "TAH", 4)
    robotpuVoice.singNote(SingNote.CSharp5, "MIY", 4)
    robotpuVoice.singRest(1)
    robotpuVoice.singNote(SingNote.C5, "IHTS", 1)
    robotpuVoice.singNote(SingNote.CSharp5, "SOW", 1)
    robotpuVoice.singNote(SingNote.DSharp5, "IY", 2)
    robotpuVoice.singNote(SingNote.CSharp5, "ZIH", 1)
    robotpuVoice.singNote(SingNote.ASharp4, "TUW", 1)
    robotpuVoice.singNote(SingNote.CSharp5, "LIYV", 2)
    robotpuVoice.singNote(SingNote.CSharp5, "MIY", 4)
    robotpuVoice.singRest(1)
    robotpuVoice.singNote(SingNote.C5, "AAL", 1)
    robotpuVoice.singNote(SingNote.CSharp5, "AH", 1)
    robotpuVoice.singNote(SingNote.DSharp5, "LOWN", 2)
    robotpuVoice.singNote(SingNote.CSharp5, "WIHT", 1)
    robotpuVoice.singNote(SingNote.GSharp4, "DHAH", 1)
    robotpuVoice.singNote(SingNote.ASharp4, "MEHM", 2)
    robotpuVoice.singNote(SingNote.ASharp4, "RIY", 4)
    robotpuVoice.singRest(1)
    robotpuVoice.singNote(SingNote.FSharp4, "AHV", 1)
    robotpuVoice.singNote(SingNote.GSharp4, "MAY", 1)
    robotpuVoice.singNote(SingNote.ASharp4, "DEYZ", 2)
    robotpuVoice.singNote(SingNote.GSharp4, "IHN", 1)
    robotpuVoice.singNote(SingNote.FSharp4, "DHAH", 1)
    robotpuVoice.singNote(SingNote.F4, "SAHN", 6)
}

robotpuVoice.setVoice(VoicePreset.RobotPU)
robotPuPro.start(robotPuPro.Action.Rest, 0)
// Song 1 — the ballad: a slow 66 BPM sway, head bowed at the mic
robotpuVoice.say("Memory! By Celine Dion!")
startGroove(66, 0.4)
pitchCenter = 110
singMemory()
robotpuVoice.waitUntilDone()
stopGroove()
// Song 2 — a looser 105 BPM groove, played to one side of the room
robotpuVoice.say("Birds of a feather, by Billie Eilish!")
robotPuPro.startAndWait(robotPuPro.Action.TurnLeft, 2)
startGroove(105, 0.8)
singRefrain()
robotpuVoice.waitUntilDone()
stopGroove()
// Song 3 — swing around to the other side, strut up, 113 BPM finale
robotpuVoice.say("Can't Stop the Feeling! by Justin Timberlake.")
robotPuPro.startAndWait(robotPuPro.Action.TurnRight, 4)
robotPuPro.startAndWait(robotPuPro.Action.Walk, 2)
startGroove(113, 1)
singFeeling()
robotpuVoice.waitUntilDone()
stopGroove()
// Finale — hold a bow, then rise for the applause
robotPuPro.start(robotPuPro.Action.Duck, 0)
basic.pause(600)
robotPuPro.startAndWait(robotPuPro.Action.Stand, 1)
basic.showIcon(IconNames.Happy)
```

**Try it:** download — Robot PU announces each song, sings the whole
medley while it grooves at three different tempos, and bows when the
music ends.

## Step 7: Challenges

- **Encore** — call ``singFeeling()`` inside a ``||loops:repeat||`` loop;
  the groove keeps running through every repeat.
- **Choreograph inside a song** — the voice queue stays a few notes
  ahead, so re-aiming ``yawCenter`` or ``pitchCenter`` just before a
  ``sing note`` lands right on it. Try a glance on "birds of a feather"
  or a deeper bow on "all alone".
- **Own the beat** — give a song its own pattern arrays: deeper
  ``legPattern`` dips for the finale, or a wide slow ``yawPattern`` for
  the ballad. Match ``BPM`` and ``energy`` to taste.
- **Safety** — add ``||input:on shake||`` → ``beatMs = 0``,
  ``||robotPuPro:stop robot||`` plus ``||robotpuVoice:stop speaking||``
  for an emergency stop button.
