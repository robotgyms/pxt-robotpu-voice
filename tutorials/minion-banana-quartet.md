# Minion Banana Quartet

Like the Minions in https://www.youtube.com/watch?v=wCkerYMffMo — four
Robot PUs sing the Banana song together. Four singing parts, four
micro:bits, and one radio signal to start them all. Ba-na-naaa!

You will need **4 micro:bits** (V2) — or fewer works too, the parts just
sound lonelier.

## Step 1: Pick your part

All four robots run the **same program** — each one chooses its part by
counting up or down with the buttons. They all listen on radio group 1:

- **Part 1** → Lead (the banana melody)
- **Part 2** → Riff (the ba-na-na engine that starts the song)
- **Part 3** → Stabs (the "po-ta-to" chord punches)
- **Part 4** → Harmony (the high "wee" part)

**Button A** counts up to the next part, **Button B** counts back down.
The number wraps around, so part 4 + 1 is part 1 again:

```blocks
let part = 0
radio.setGroup(1)
basic.showNumber(part + 1)
input.onButtonPressed(Button.A, function () {
    part = (part + 1) % 4
    basic.showNumber(part + 1)
})
input.onButtonPressed(Button.B, function () {
    part = (part + 3) % 4
    basic.showNumber(part + 1)
})
```

The LED shows the part number (1–4) so you always know who's who.

## Step 2: A whole phrase in one block

Each part is sung with the ``||robotpuVoice:sing phonemes||`` block.
Inside it, ``#nnn`` sets the pitch for everything after it (the same
numbers as ``SingNote`` — ``#57`` is C5, ``#115`` is middle C), and
repeating the last letters of a syllable stretches the note.

So ``#57BAAAAAA #57NAAAAAAAAAA`` sings "baaa-naaaaa" on C5 — a short note
then a long one.

**Why whole phrases?** The voice queue only holds three blocks at a
time — a ``sing note`` for every single note would run out of room mid
song. Packing a phrase into one ``sing phonemes`` block keeps every note
in perfect step, and ``||robotpuVoice:wait until speech finished||``
gives the robot a breath after every third phrase.

And when a part joins late — or sits out a section — the
``||robotpuVoice:rest||`` block queues real silence. It waits inside the
song, exactly like a rest in sheet music.

## Step 3: The Riff starts the song

``singRiff`` has no rest — it starts the instant the signal arrives,
just like the guitar in the video. It hammers out
*ba-na-na-na-na-na-naaa* on ``C5``, then dives into the wild arpeggio
breakdown (``C4 E4 G4 A4 A#4`` and back) — the part where the Minions go
crazy — before riding the riff home:

```blocks
function singRiff () {
    robotpuVoice.singPhonemes("#57BAAAAAA #57NAAAAAA #57NAAAAAAAA #57NAAAAAA #57NAAAAAA #57NAAAA #57NAAAAAAAAAA")
    robotpuVoice.singPhonemes("#57BAAAAAA #57NAAAAAA #57NAAAAAAAA #57NAAAAAA #57NAAAAAA #57NAAAA #57NAAAAAAAAAA")
    robotpuVoice.singPhonemes("#57BAAAAAA #57NAAAAAA #57NAAAAAAAA #57NAAAAAA #57NAAAAAA #57NAAAA #57NAAAAAA")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#115NAAAAAA #57NAAAAAA #57NAAAAAA #57NAAAAAAAA #57NAAAAAA #57NAAAAAA #57NAAAA")
    robotpuVoice.singPhonemes("#57NAAAAAAAAAA #57BAAAAAA #57NAAAAAA #57NAAAAAAAA #57NAAAAAA #57NAAAAAA #57NAAAA")
    robotpuVoice.singPhonemes("#57NAAAAAAAAAA #57BAAAAAA #57NAAAAAA #57NAAAAAAAA #57NAAAAAA #57NAAAAAA #57NAAAA")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#57NAAAA #57NAAAA #57NAAAA #57NAAAA #51NAAAA #51NAAAA #51NAAAA #51NAAAA #77NAAAAAA")
    robotpuVoice.singPhonemes("#77NAAAA #46NAAAAAA #51NAAAA #46NAAAA #51NAAAA #46NAAAA #51NAAAA #57NAAAA #68NAAAA")
    robotpuVoice.singPhonemes("#57NAAAAAA #57NAAAAAA #57NAAAAAAAA #57NAAAAAA #57NAAAAAA #57NAAAA #57NAAAAAAAAAA")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#115BAAAAAA #91NAAAAAA #77NAAAAAA #68NAAAAAA #64NAAAAAA #68NAAAAAA #77NAAAAAA")
    robotpuVoice.singPhonemes("#91NAAAAAA #115NAAAAAA #91NAAAAAA #77NAAAAAA #68NAAAAAA #64NAAAAAA #68NAAAAAA")
    robotpuVoice.singPhonemes("#77NAAAAAA #91NAAAAAA #86NAAAAAA #68NAAAAAA #57NAAAAAA #51NAAAAAA #48NAAAAAA")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#51NAAAAAA #57NAAAAAA #68NAAAAAA #115NAAAAAA #91NAAAAAA #77NAAAAAA #68NAAAAAA")
    robotpuVoice.singPhonemes("#64NAAAAAA #68NAAAAAA #77NAAAAAA #91NAAAAAA #102NAAAAAAAAAA #115BAAAAAA #57NAAAAAA")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#57NAAAAAAAA #57NAAAAAA #57NAAAAAA #57NAAAA #115NAAAAAAAAAAAAAAAAAA")
    robotpuVoice.singNote(SingNote.C4, "NAA", 16)
}
```

## Step 4: The Lead sings the melody

``singLead`` waits 12 seconds — three riff bars — then enters with the
famous tune: *ba-na-na-na-naaa* climbing from ``D4`` up to ``G4`` and
home to ``C4``. It keeps going through the breakdown section and finishes
with a long top ``C5``:

```blocks
function singLead () {
    robotpuVoice.rest(12000)
    robotpuVoice.singPhonemes("#102BAAAAAA #91NAAAAAA #91NAAAAAA #102NAAAAAA #115NAAAAAAAAAAAAAA #91BAAAAAA")
    robotpuVoice.singPhonemes("#77NAAAAAA #91NAAAAAA #91NAAAAAA #102NAAAAAA #115NAAAAAAAAAAAAAAAAAA #102BAAAAAA")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#91NAAAAAA #91NAAAAAA #102NAAAAAA #115NAAAAAAAAAAAAAAAAAA #153BAAAAAAAAAA #91BAAAAAA")
    robotpuVoice.singPhonemes("#91NAAAA #91NAAAA #91NAAAAAAAAAA #91BAAAA #91NAAAA #91NAAAA #91NAAAA #91NAAAAAAAAAA")
    robotpuVoice.singPhonemes("#91BAAAAAA #91NAAAA #91NAAAA #91NAAAAAA #91NAAAA #91NAAAA #91NAAAA #102NAAAA #91NAAAA")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#86NAAAA #91NAAAA #91NAAAA #102NAAAAAA #91NAAAAAA #86NAAAAAA #91NAAAA #86NAAAA")
    robotpuVoice.singPhonemes("#86NAAAAAA #86NAAAAAA #86NAAAAAAAA #86NAAAAAA #86NAAAAAA #86NAAAA #86NAAAAAAAAAA")
    robotpuVoice.singPhonemes("#91BAAAAAA #91NAAAAAA #91NAAAAAAAA #91NAAAAAA #91NAAAAAA #91NAAAA #91NAAAA #115NAAAA")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#115NAAAA #115NAAAA #102NAAAA #102NAAAA #102NAAAA #102NAAAA #102NAAAAAA #102NAAAA")
    robotpuVoice.singPhonemes("#77NAAAAAA #86NAAAA #77NAAAA #86NAAAA #77NAAAA #86NAAAA #91NAAAA #86NAAAA #91NAAAAAA")
    robotpuVoice.singPhonemes("#115NAAAAAA #115NAAAAAAAA #115NAAAAAA #115NAAAAAA #115NAAAA #57NAAAAAAAAAAAAAAAAAA")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singNote(SingNote.C5, "NAA", 16)
}
```

## Step 5: The Stabs punch out "po-ta-to"

``singStabs`` waits 3 seconds, then punches short notes on ``G4``, jumps
to ``A4``, drops to low ``C4`` stabs for the breakdown, and climbs back
home:

```blocks
function singStabs () {
    robotpuVoice.rest(3000)
    robotpuVoice.singPhonemes("#77POWWW #77POWWW #77TAAAAAAAA #77POWWWWW #77POWW #77TAAAAAAAAAA #77POWWW #77POWWW")
    robotpuVoice.singPhonemes("#77TAAAAAAAA #77POWWWWW #77POWW #77TAAAAAAAAAA #68POWWW #68POWWW #68TAAAAAAAA #68POWWW")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#68POWWW #68TAAAA #68POWWWWW #77POWWW #77TAAAAAA #77POWWWW #77POWWWWW #77TAAAA")
    robotpuVoice.singPhonemes("#77POWWWWW #77POWWWWW #77TAAAAAA #77POWWW #77POWWWW #77TAAAAAAAAAA #77POWW #77POWWWWW")
    robotpuVoice.singPhonemes("#115TAAAAAA #115POWW #115POWW #115TAAAAAAAAAA #115POWW #115POWW #115TAAAA #115POWW")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#115POWWWWW #115TAAAAAA #115POWW #115POWW #115TAAAAAA #115POWW #115POWW #68TAAAA")
    robotpuVoice.singPhonemes("#68POWW #77POWW #77TAAAA #91POWWW #102POWW #115TAAAA #115POWWW #115POWWW #115TAAAAAAAA")
    robotpuVoice.singPhonemes("#115POWWW #115POWWW #115TAAAA #102POWWW #102POWWW #91TAAAAAA #102POWWW #115POWWWW")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#115TAAAAAA #115POWWW #115POWW #115TAAAA #115POWW #115POWW #115TAAAA #102POWW #102POWW")
    robotpuVoice.singPhonemes("#102TAAAA #102POWW #102POWWW #102TAAAA #91POWWW #102POWW #91TAAAA #102POWW #91POWW")
    robotpuVoice.singPhonemes("#102TAAAA #115POWW #102POWW #115TAAAAAA #115POWWW #115POWWWW #115TAAAAAA #115POWWW")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#115POWW #115TAAAAAAAAAAAAAAAAAA")
    robotpuVoice.singNote(SingNote.G4, "POW", 16)
}
```

## Step 6: The Harmony floats on top

``singHarmony`` waits 4 seconds, sings its high "wee" line on ``E5`` and
``F5`` — then does what a real singer does: it **rests for 15 seconds**
while the others race through the breakdown, and comes back in for the
ending:

```blocks
function singHarmony () {
    robotpuVoice.rest(4000)
    robotpuVoice.singPhonemes("#46WIYYY #46WIYYY #46WIYYYY #46WIYYY #46WIYYY #46WIYY #46WIYYYYY #46WIYYY #46WIYYY")
    robotpuVoice.singPhonemes("#46WIYYYY #46WIYYY #46WIYYY #46WIYY #46WIYYYYY #46WIYYY #46WIYYY #46WIYYYY #46WIYYY")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#46WIYYY #46WIYY #46WIYYYYY #43WIYYY #43WIYYY #43WIYYYY #43WIYYY #43WIYYY #43WIYY")
    robotpuVoice.singPhonemes("#43WIYYYYY #46WIYYY #46WIYYY #46WIYYYY #46WIYYY #46WIYYY #46WIYY #46WIYY #57WIYY")
    robotpuVoice.singPhonemes("#57WIYY #57WIYY #51WIYY #51WIYY #51WIYY #51WIYY #77WIYYY #77WIYY #46WIYYY #51WIYY")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#46WIYY #51WIYY #46WIYY #51WIYY #57WIYY #68WIYY #57WIYYY #46WIYYY #46WIYYYY #46WIYYY")
    robotpuVoice.rest(15000)
    robotpuVoice.singPhonemes("#46WIYYY #46WIYY #46WIYYYYY #57WIYYY #57WIYY #57WIYY #57WIYYYYY #57WIYY #57WIYY")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#57WIYY #57WIYY #57WIYYYYY #57WIYYY #57WIYY #57WIYY #57WIYYY #57WIYY #57WIYY #34WIYY")
    robotpuVoice.singPhonemes("#34WIYY #38WIYY #38WIYY #46WIYYY #51WIYY #57WIYY #68WIYYY #68WIYYY #68WIYYYY #68WIYYY")
    robotpuVoice.singPhonemes("#68WIYYY #68WIYY #68WIYYYYY #77WIYYY #77WIYYY #77WIYYYY #77WIYYY #77WIYYY #77WIYY")
    robotpuVoice.waitUntilDone()
    robotpuVoice.singPhonemes("#77WIYYYYY #77WIYYYYY #77WIYYY #57WIYYY #57WIYYYY #57WIYYY #57WIYYY #57WIYY")
    robotpuVoice.singPhonemes("#57WIYYYYYYYYY")
    robotpuVoice.singNote(SingNote.E5, "WIY", 16)
}
```

## Step 7: The conductor starts the show

One robot is the conductor. Shaking it sends ``"GO"`` on the radio —
every robot in group 1 starts at the same moment, and each part's own
``rest`` makes it join in at the right time. The conductor sings too:

```blocks
input.onGesture(Gesture.Shake, function () {
    basic.showIcon(IconNames.EighthNote)
    radio.sendString("GO")
    playPart(part)
})
```

## Step 8: Everyone listens for "GO"

```blocks
radio.onReceivedString(function (receivedString) {
    if (receivedString == "GO") {
        playPart(part)
    }
})
function playPart (myPart: number) {
    robotpuVoice.setVoice(VoicePreset.LittleRobot)
    if (myPart == 0) {
        singLead()
    } else if (myPart == 1) {
        singRiff()
    } else if (myPart == 2) {
        singStabs()
    } else {
        singHarmony()
    }
}
```

## Step 9: Perform!

1. Download the **same program** to all 4 micro:bits.
2. On each robot, press A or B until the LED shows its part number:
   1 = Lead, 2 = Riff, 3 = Stabs, 4 = Harmony.
3. Shake the conductor's micro:bit.
4. **BA-NA-NAAA!** The riff starts alone, the stabs punch in, the
   harmony floats over the top, and twelve seconds in the lead arrives
   with the tune. About a minute of song!

## Step 10: Make it better

- **Encore:** shake again — the song replays, no code needed.
- **New timing:** change each part's ``rest`` — what happens if the lead
  waits 6 seconds instead of 12? Try a ``rest`` in the *middle* of a part
  for a dramatic pause, like the harmony's 15-second break.
- **Different minions:** each robot could use a different voice —
  ``VoicePreset.Elf`` for the harmony, ``VoicePreset.Dalek`` for the
  stabs. Careful: faster voices sing shorter notes, so the timing shifts.
- **Tune the tempo:** bigger holds = slower song. Add more ``A``s to
  every syllable for a dramatic slow version.
- **Read the map:** every ``#nnn`` is a ``SingNote`` — ``#115`` = C4,
  ``#91`` = E4, ``#77`` = G4, ``#57`` = C5. Find the moment where the
  stabs drop an octave (``#77`` → ``#115``) — can you hear it?
