# Architecture — pxt-robotpu-voice

SAM text-to-speech for Robot PU (micro:bit V2 only). Two threads of execution
matter:

- **Caller fiber** — whatever calls `say`/`sing`/`rest`/`pronounce`/
  `powerDownAudio` (or `say and wait`/`wait until speech finished`, which also
  block). These only *enqueue* an utterance.
- **Voice worker** — one background fiber (`voiceWorker`) that dequeues,
  renders through the 1982 SAM reciter + renderer, and streams 4096-byte
  windows into the CODAL mixer via `MemorySource::play()`.

```
say() → enqueueUtterance() → [queue depth 4: 3 usable slots] → voiceWorker
                                                             → speakNow()
                                                             → sampleSource->play()
                                                             → mixer → P0/speaker
```

Queue details that matter:

- A producer parked on a full queue also watches `queueGeneration`:
  `clearQueue()` ("stop speaking") bumps it, so a blocked producer
  notices its utterance belonged to a cancelled batch and drops it
  instead of inserting into the next show.
- `stop speaking` = `clearQueue()` + `requestCancel()`: `renderAborted`
  is checked inside the SAM render loop itself, so the current
  utterance is cut mid-phoneme, not merely dequeued.
- SAM's renderer emits a few samples out of order (it writes ahead of
  its position counter), so output is collected into a 4096-byte window
  indexed by absolute sample position; crossing a window boundary
  flushes the previous window to `play()`.

## Hard-won rule: never block on the event-dispatch fiber

`pxt-robotpu-cap` runs `on voice command` / `on any voice command` /
`on I2C message` handlers on a **single shared dispatch fiber**. One handler
that never returns silently kills every later event — no panic, no watchdog
reset (the I2C poll fiber keeps succeeding), and only a micro:bit reset
recovers. The cap keeps logging accepted commands the whole time.

**Therefore: handlers must return fast.** Things that must NOT run inside
an event handler:

- `robotpuVoice.say` / `sing` / `rest` / `pronounce` — can block when the
  utterance queue is full
- `say and wait` / `wait until speech finished` — blocks by design
- `robotPuPro.start X for N steps and wait` — parks until the counted action
  completes, which it may never do
- `music.play ... UntilDone`, `while` loops without `basic.pause`

The safe pattern is *flag in the handler, act in `forever`*:

```typescript
let pendingPhrase = ""
robotPuCap.onVoiceCommand(function () {
    pendingPhrase = voicePhrase[robotPuCap.lastVoiceCommand()]
    robotPuPro.start(robotPuPro.Action.Rest, 0)
})
basic.forever(function () {
    if (pendingPhrase != "") {
        let p = pendingPhrase
        pendingPhrase = ""
        robotpuVoice.say(p)   // a park here only mutes speech, not commands
    }
    basic.pause(50)
})
```

Same rule for extension internals: a producer-side wait must never be
unbounded — a wedged worker must drop utterances, not caller fibers.

The wedge is defended at three layers:

1. **Can't race the mixer to sleep** — `powerDownAudio` enqueues a
   `PUVOICE_MODE_POWERDOWN` item instead of calling `setSleep(true)`
   directly, so the pipeline can only be slept by the worker itself,
   in queue order, never underneath an active render.
2. **Re-wake before every pull** — each `sampleSource->play()` call site
   first runs `setSleep(false)` + `requestActivation()`, so a pipeline
   slept by anything else (e.g. another extension) is revived before the
   worker waits on it.
3. **Bounded producer wait** — a full queue with no `flushCount`
   progress for `PUVOICE_STALL_MS` (5 s) first earns the worker one
   wake-up nudge from the producer side (`setSleep(false)` +
   `requestActivation()`, same fix as layer 2) plus another 5 s of
   grace. Still nothing: the worker is declared wedged —
   `enqueueUtterance` drops the item and latches `queueWedged`, so
   later producers drop immediately instead of each parking for 10 s.
   The latch self-clears the moment flushes resume (a late-recovering
   worker reopens the queue on its own), and `clearQueue()`
   ("stop speaking") clears it too.

`wait until speech finished` gets the same treatment at block level: a
120 s deadline so a wedge degrades to a timeout rather than a dead fiber.

## Audio pipeline lifecycle

- `ensureStarted()` wakes the pipeline and re-asserts pin 0 +
  `setPinEnabled(true)` before **every** utterance: other packages
  (music, core pins) can disable the pin or move the audio pin
  elsewhere, and a stolen pin would mute the amp for the rest of the
  session.
- When the queue drains, the worker calls `powerDown()`: it waits up to
  ~2 s for `uBit.audio.isPlaying()` to clear, then `setSleep(true)` —
  the PWM on pin 0 stops driving the amp (battery drain + speaker
  hiss). If something else (e.g. music) is still playing, it leaves
  the pipeline alone.
- `speaking` stays set through the tail, so `is speaking` / `wait until
  speech finished` / `on speech finished` report done only after the
  last sample has played, not when the render finishes.
- Completion rides the message bus on `PUVOICE_EVENT_ID` (0x5055,
  spells "PU"): `DONE` when the queue drains and playback ends,
  `ERROR` when an utterance fails to render.

## Engine input

- Text mode runs `expandDigits` ("42" → "FOUR TWO", "3.5" → "THREE
  POINT FIVE"), upper-cases, then feeds the reciter. Phoneme mode runs
  `sanitizePhonemes`, which strips characters the 1982 parser would
  choke on — one bad char fails the *whole* utterance — and collapses
  runs of '.' into a single pause.
- The reciter keeps its working state in file-static globals, so
  `TextToPhonemes` is serialized by `reciterTryLock()`: the worker
  spins until it can recite, while `toPhonemes` returns "" rather than
  block when speech is in progress.
- `set speech gain` scales samples around the mid-rail (128) because
  SAM's sparse-pulse waveform sits far below full scale and sounds
  quiet next to continuous music tones.

## The bug this prevents (Nov 2026 incident)

Symptom: CogniCap kept detecting voice commands but the robot ignored every
command after the first few; no LED error; only a micro:bit reset helped.
Root cause: the voice worker wedged inside `sampleSource->play()` — which
waits forever if the mixer isn't pulling (e.g. after `powerDown()` sleeps
`uBit.audio`, or concurrent `input.soundLevel()` calls on the same audio
object from the poll and gait fibers). The queue filled, `enqueueUtterance`
blocked **forever** on the dispatch fiber, and the event queue silently
dropped every subsequent voice token.

Debug breadcrumbs for next time: on the micro:bit, compare
`last message type` (poll fiber) against `last voice command` (dispatch
fiber) and `is speaking` (worker). On the cap, `GET /i2c` —
`request_count` rising + `served_ms == action_ms` proves the packet was
delivered, isolating the fault to a micro:bit fiber.

## Hardware watchdog (scheduler-proof recovery)

All software mitigations above share one blind spot: a fiber stuck inside a
native call that never yields starves the **whole** cooperative scheduler —
poll fiber, watchdog fiber, everything. That is exactly what the
codal-nrf52 TWIM driver does in `waitForStop`: a `target_wait_us` busy-wait
whose errata retries (`locked = 0`) can postpone its timeout forever when
`EVENTS_LASTTX` stays latched under heavy interrupt load (servos + audio +
I2C, e.g. "go" = explore gait reading the IMU while speech plays). Symptom:
the cap's `request_count` goes flat, no watchdog reset, only power-cycling
helps.

The escape hatch is hardware: the nRF52 WDT (32.768 kHz LF clock — resets
the chip regardless of CPU state) plus a feeder fiber that reloads it
every 250 ms. A wedged scheduler starves the feeder → reset in ≤ N s.
Three arming paths, so a program cannot accidentally run unprotected:

- **Auto-arm at program start** — a `startWatchdog(5)` top-level call in
  `main.ts` runs at boot for every program that includes the extension.
- **Lazy arm on first utterance** — `ensureWorker()` calls
  `watchdogAutoArm(PUVOICE_WDT_SECONDS)`; covers programs where the
  top-level statement never ran.
- **Explicit `start watchdog N seconds` block** — arms on demand.

All three funnel into `armWdt`, which clamps the timeout to [3, 120] s.
The catch: the nRF52 **locks `CRV`/`RREN`/`CONFIG` once the WDT runs**, so
the first arm since power-on fixes the timeout for the whole session —
in practice the auto-arm's 5 s, and the explicit block cannot retime it
afterwards. The WDT also survives a soft reset still running, so
`armWdt` checks `RUNSTATUS`: a watchdog carried over from a previous
boot keeps its old (locked) timeout and only the feeder resumes.

`restarted by watchdog` reports `POWER->RESETREAS.DOG` so a program can
tell a watchdog recovery from a cold boot. It matters because the cap
re-serves the pending voice token after a reboot, so without a check the
robot can freeze→reset→re-freeze in a loop. Two guards cover it:

- **Automatic speech mute** — `enqueueUtterance` drops everything for
  `PUVOICE_WDT_MUTE_MS` (2 s) after a WDT reset (`watchdogRecoveryMute`),
  so a re-served token can't restart the audio pipeline that helped
  wedge the chip. No user code needed.
- **Program-level skip** — the block lets user code drop the whole
  action (e.g. don't re-run `go`, not just its speech) on the boot
  after a watchdog reset.

Caveats baked into `watchdog.cpp`:

- The WDT cannot be stopped once started. The auto-arm runs at every
  boot, so a WDT reset resumes feeding within ms — no boot loop; but a
  program that removed the extension entirely would reset-loop until a
  power cycle.
- `CONFIG.HALT` is set so the timer pauses while the CPU is halted — SWD
  flashing and debugging are unaffected.
- The feeder only proves the scheduler runs; a *parked* fiber (the old
  yielding wedge) doesn't starve it — that class is covered by the
  bounded queue waits above, not by the WDT.
