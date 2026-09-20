# Voice Commands

Make Robot PU obey your voice! The CogniCap camera listens for a wake
sound, hears your command, and tells the micro:bit which action to run.

## How it works

1. You make a **loud sound** (clap or say "Robot P U!") — that wakes the
   CogniCap's ears.
2. You say a **command word** like ``walk`` or ``dance`` within a few seconds.
3. CogniCap sends an **action code** to the micro:bit over I2C.
4. Your ``||robotPuCap:on voice action||`` handler runs the matching action.

## Before you start: add the extension

This tutorial needs the CogniCap extension — and one import brings
everything else along automatically:

1. Open https://makecode.microbit.org and start a **New Project**.
2. Click **Extensions** under the gearwheel menu.
3. Search for **pxt-robotpu-cap** (or paste
   https://github.com/robotgyms/pxt-robotpu-cap) and import it.

The **CogniCap** toolbox appears with the ``||robotPuCap:||`` blocks —
and because the extension depends on them, two more come along free:

- **pxt-robotpu-pro** — the ``||robotPuPro:||`` move blocks (its repo is
  https://github.com/robotgyms/pxt-robotpu)
- **pxt-robotpu-voice** — the ``||robotpuVoice:||`` voice blocks

## Step 1: Start CogniCap

Every CogniCap program starts the same way: turn on the co-processor, then
switch on voice commands.

```blocks
robotPuCap.startCogniCap()
robotPuCap.enableVoiceCommands(true)
```

**Try it:** this alone does nothing visible yet — but the micro:bit is now
polling the CogniCap 50 times a second, listening for action codes.

## Step 2: Your first voice action

Let's make Robot PU walk when you say **walk**.

```blocks
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Walk, function () {
    robotPuPro.start(robotPuPro.Action.Walk, 0)
})
```

**Try it:** download, clap loudly near the camera, then say "walk".
Robot PU starts walking!

## Step 3: Stop and turn

Add three more commands — ``stop``, ``turn left``, and ``turn right``:

```blocks
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Stop, function () {
    robotPuPro.start(robotPuPro.Action.Rest, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.TurnLeft, function () {
    robotPuPro.start(robotPuPro.Action.TurnLeft, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.TurnRight, function () {
    robotPuPro.start(robotPuPro.Action.TurnRight, 0)
})
```

Notice that ``stop`` maps to ``Rest`` — the voice word and the robot
action don't have to share a name.

## Step 4: Go explore

``go`` is a great word for starting the explore routine:

```blocks
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Go, function () {
    robotPuPro.start(robotPuPro.Action.Explore, 0)
})
```

## Step 5: The whole body

Now fill in the rest of the moves — jump, kick, sit, stand, laugh, cry:

```blocks
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Jump, function () {
    robotPuPro.start(robotPuPro.Action.Jump, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Kick, function () {
    robotPuPro.start(robotPuPro.Action.Kick, 1)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Sit, function () {
    robotPuPro.start(robotPuPro.Action.Sit, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Stand, function () {
    robotPuPro.start(robotPuPro.Action.Stand, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Laugh, function () {
    robotPuPro.start(robotPuPro.Action.Laugh, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Cry, function () {
    robotPuPro.start(robotPuPro.Action.Cry, 0)
})
```

**Try it:** wake the robot, then say ``sit``, ``stand``, ``laugh``.
Each word triggers its own action code.

## The golden rule: keep handlers FAST!

Here is the most important trick in this tutorial.

``||robotPuCap:on voice action||`` handlers run **inside** the I2C polling
loop. While your handler is running, the micro:bit cannot read any new
packets — so if a handler takes 30 seconds to sing a song, **no voice
commands work for 30 seconds**. The robot looks like it stopped listening!

Quick actions like ``robotPuPro.start`` are fine — they return instantly.
Long shows (songs, speeches, dances) must run in the background instead.

## Step 6: A flag for long shows

The trick: the handler only **sets a flag**, and a background loop does
the actual singing.

```blocks
let singRequested = false
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Sing, function () {
    singRequested = true
})
```

The handler finishes in a microsecond — the poll loop never stops.

## Step 7: The background singer

Now a ``||control:in background||`` loop watches the flag and performs
the song:

```blocks
control.inBackground(function () {
    while (true) {
        if (singRequested) {
            singRequested = false
            robotpuVoice.setVoice(VoicePreset.RobotPU)
            robotpuVoice.say("Happy birthday to Robot P U!")
            robotpuVoice.singRest(4)
            robotpuVoice.singNote(SingNote.G4, "/HAE", 1)
            robotpuVoice.singNote(SingNote.G4, "PIY", 1)
            robotpuVoice.singNote(SingNote.A4, "BERTH", 4)
            robotpuVoice.singNote(SingNote.G4, "DEY", 4)
            robotpuVoice.singNote(SingNote.C5, "TUW", 4)
            robotpuVoice.singNote(SingNote.B4, "YUW", 8)
        }
        basic.pause(50)
    }
})
```

Say ``sing`` and Robot PU performs — while the micro:bit **keeps
listening** for the next command.

**Tip — stopping mid-song:** ``||robotpuVoice:stop speaking||`` clears the
queue and cuts the current note, but a background loop like this one will
happily feed it the *next* note. To let ``stop`` really end the show,
check ``||robotpuVoice:is speaking||`` between notes in a long sequence —
it goes ``false`` once ``stop speaking`` has taken effect.

## Step 8: A talking show, the same way

The ``talk`` command does a whole stage show — announcement, poem, sung
scales. Same flag pattern:

```blocks
let talkRequested = false
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Talk, function () {
    talkRequested = true
})
```

Then inside the same background loop, add a ``talkRequested`` section:

```blocks
if (talkRequested) {
    talkRequested = false
    robotpuVoice.say("Ladies and gentlemen, boys and girls!")
    robotpuVoice.say("Welcome to the Planet Sakukar!")
    robotpuVoice.rest(600)
    robotpuVoice.say("I am robot P U, small but proud.")
    robotpuVoice.say("My voice is squeaky. My beeps are loud.")
    robotpuVoice.say("I walk and I talk and I sing you a song.")
    robotpuVoice.say("With my micro-bit brain, I cannot go wrong!")
}
```

## Step 9: Dress rehearsal — voice and servos

Before the show, set up the voice and tune the servos like in a real
stage program:

```blocks
robotpuVoice.configureVoice(180, 68, 180, 180)
robotpuVoice.setVolume(255)
robotpuVoice.say("Hello everyone here! I am robot P U.")
robotPuPro.setServoTrim(0, -4)
robotPuPro.setServoTrim(1, 0)
robotPuPro.setServoTrim(2, 10)
robotPuPro.setServoTrim(3, 0)
robotPuPro.setServoTrim(4, 0)
robotPuPro.setServoTrim(5, 0)
robotPuPro.saveServoTrimCalibration()
```

Put these **before** ``startCogniCap`` — greeting the audience takes a
few seconds and you don't need the poll loop running yet.

## Step 10: All the words you can say

Here is the full command list — pick any ``VoiceAction`` and give it a
handler:

| Say this | Action code | Say this | Action code |
|----------|------|----------|------|
| rest | 1 | turn right | 17 |
| go | 2 | explore | 18 |
| back | 3 | sit | 19 |
| stop | 4 | stand | 20 |
| jump | 5 | laugh | 21 |
| kick | 6 | cry | 22 |
| sing | 7 | scream | 23 |
| talk | 8 | funny | 24 |
| dance | 9 | blink | 25 |
| left | 10 | greet | 26 |
| right | 11 | drive | 27 |
| straight | 12 | calibrate | 28 |
| wake up | 13 | duck | 29 |
| walk | 14 | | |
| walk backward | 15 | | |
| turn left | 16 | | |

## Step 11: Wake up!

Every wake sound also sends action code **13** (``wake up``). Give it a
handler to make the robot acknowledge you:

```blocks
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Wakeup, function () {
    robotPuPro.start(robotPuPro.Action.Stand, 0)
})
```

## Troubleshooting

- **No ``robotPuCap`` blocks in the toolbox:** the pxt-robotpu-cap
  extension isn't imported yet — see "Before you start".
- **Nothing happens:** did you wake it first? A loud clap or shout opens
  the command window for a few seconds.
- **Works once, then stops:** a handler is blocking the poll loop — move
  the long part into a background flag like Step 6.
- **Wrong action:** check the VoiceAction name in your handler matches the
  word you said.

## Full program

```blocks
//robotpuVoice.configureVoice(180, 68, 180, 180)
robotpuVoice.setVoice(VoicePreset.RobotPU)
robotpuVoice.setVolume(255)
robotpuVoice.say("Hello everyone here! I am robot P U.")
robotPuPro.setServoTrim(0, -4)
robotPuPro.setServoTrim(1, 0)
robotPuPro.setServoTrim(2, 10)
robotPuPro.setServoTrim(3, 0)
robotPuPro.setServoTrim(4, 0)
robotPuPro.setServoTrim(5, 0)
robotPuPro.saveServoTrimCalibration()
robotPuCap.startCogniCap()
robotPuCap.enableVoiceCommands(true)
let singRequested = false
let talkRequested = false
function singHappyBirthday() {
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
    robotpuVoice.singNote(SingNote.B4, "TER", 2)
    robotpuVoice.singNote(SingNote.A4, "PIY", 2)
    robotpuVoice.singNote(SingNote.A4, "YUW", 6)
    robotpuVoice.singNote(SingNote.F5, "/HAE", 1)
    robotpuVoice.singNote(SingNote.F5, "PIY", 1)
    robotpuVoice.singNote(SingNote.E5, "BERTH", 4)
    robotpuVoice.singNote(SingNote.C5, "DEY", 4)
    robotpuVoice.singNote(SingNote.D5, "TUW", 4)
    robotpuVoice.singNote(SingNote.C5, "YUW", 10)
}

function selfIntroduction() {
    robotpuVoice.say("Ladies and gentlemen, boys and girls!")
    robotpuVoice.say("Welcome to the Planet Sakukar!")
    robotpuVoice.rest(600)
    // Act 2: a poem about itself, in a different voice
    // robotpuVoice.setVoice(VoicePreset.LittleRobot)
    robotpuVoice.say("I am robot P U, small but proud.")
    robotpuVoice.say("My voice is squeaky. My beeps are loud.")
    robotpuVoice.say("I walk and I talk and I sing you a song.")
    robotpuVoice.say("With my micro-bit brain, I cannot go wrong!")
    robotpuVoice.rest(600)
    // Act 3: a run of sung notes — doe mee soh, then the high doe goes
    // through the music play block: real beats instead of hold counts.
    // "in background" queues it just like sing note; "until done" would
    // pause the show here while the queue empties first.
    robotpuVoice.say("I can sing!")
    robotpuVoice.setSingTempo(120)
    robotpuVoice.singNote(SingNote.C4, "DOW", 4)
    robotpuVoice.singNote(SingNote.E4, "MIY", 4)
    robotpuVoice.singNote(SingNote.G4, "SOH", 8)
    robotpuVoice.singNote(SingNote.D5, "RAY", 4)
    robotpuVoice.singNote(SingNote.F5, "FAA", 4)
    robotpuVoice.singNote(SingNote.A5, "LAA", 8)
    robotpuVoice.singRest(2)
    music.play(robotpuVoice.singNotePlayable(SingNote.C5, "DOW", music.beat(BeatFraction.Double)), music.PlaybackMode.InBackground)
    // Act 4: the short song — "I am a little robot" sung to the tune of
    // Twinkle Twinkle, all packed in one block: one syllable per note
    // (AY AEM AH LIH TL ROW BAAT on C C G G A A G)
    robotpuVoice.singPhonemes("#115AY4 #115AEM #77AH #77LIH4 #68TL #68ROW #77BAAAAT")
    // Encore: the thank-you goes through the music play block —
    // "spoken words" is say() living in a play socket
    music.play(robotpuVoice.sayPlayable("I am robot P U. Nice to meet you all. Thank you!"), music.PlaybackMode.UntilDone)
}
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Jump, function () {
    robotPuPro.start(robotPuPro.Action.Jump, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Go, function () {
    robotPuPro.start(robotPuPro.Action.Explore, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Stop, function () {
    robotPuPro.start(robotPuPro.Action.Rest, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.TurnLeft, function () {
    robotPuPro.start(robotPuPro.Action.TurnLeft, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.TurnRight, function () {
    robotPuPro.start(robotPuPro.Action.TurnRight, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Walk, function () {
    robotPuPro.start(robotPuPro.Action.Walk, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Kick, function () {
    robotPuPro.start(robotPuPro.Action.Kick, 1)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Sit, function () {
    robotPuPro.start(robotPuPro.Action.Sit, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Stand, function () {
    robotPuPro.start(robotPuPro.Action.Stand, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Laugh, function () {
    robotPuPro.start(robotPuPro.Action.Laugh, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Cry, function () {
    robotPuPro.start(robotPuPro.Action.Cry, 0)
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Sing, function () {
    singRequested = true
})
robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Talk, function () {
    talkRequested = true
})

robotPuCap.onVoiceAction(robotPuCap.VoiceAction.Wakeup, function () {
    robotPuPro.start(robotPuPro.Action.Stand, 0)
})

control.inBackground(function () {
    while (true) {
        if (singRequested) {
            singRequested = false
            singHappyBirthday()
        }
        if (talkRequested) {
            talkRequested = false
            selfIntroduction()
        }
        basic.pause(50)
    }
})
```
