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
