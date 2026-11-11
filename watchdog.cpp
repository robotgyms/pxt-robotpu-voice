/*
 * MIT License
 *
 * Copyright (c) 2026 RobotGyms
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE. */

#include "pxt.h"
#include "nrf.h"
#include "voice.h"

using namespace pxt;

namespace puvoice {

// ---------------------------------------------------------------------------
// Hardware watchdog
//
// The nRF52 WDT runs on the 32.768 kHz LF clock and resets the chip no matter
// what the CPU is doing — including a fiber spinning inside a native call
// that starves the whole cooperative scheduler (e.g. the codal-nrf52 TWIM
// waitForStop busy-wait when an I2C transaction never completes). A software
// watchdog cannot catch that case: it is just another fiber and starves with
// everyone else. The feeder fiber below proves the scheduler still runs —
// the moment it stops, the WDT bites and the robot recovers by itself.
//
// Warning: once started the WDT cannot be stopped, and it survives a soft
// reset still running — after a WDT reset the new program has one CRV period
// to start feeding or it resets again (and a program that never enables it
// loops until a power cycle). The nRF52 also locks CRV/RREN/CONFIG once the
// WDT runs, so the first arm since power-on fixes the timeout for the whole
// session: later calls can only start the feeder, not retune the watchdog.
// RUNSTATUS distinguishes "not yet armed" from "still running since the
// previous boot". CONFIG.HALT is set so the timer pauses while the CPU is
// halted, keeping SWD flashing and debugging unaffected.
// ---------------------------------------------------------------------------

static bool wdtStarted = false;
static bool wdtFeederStarted = false;
static int wdtResetFlag = -1;

// POWER->RESETREAS survives reset; capture it once at first use and clear so
// each boot reports the reason that actually caused it.
static void captureResetReason() {
    if (wdtResetFlag < 0) {
        wdtResetFlag = (NRF_POWER->RESETREAS & POWER_RESETREAS_DOG_Msk) ? 1 : 0;
        NRF_POWER->RESETREAS = 0xFFFFFFFF;
    }
}

static void wdtFeeder(void *) {
    while (true) {
        NRF_WDT->RR[0] = WDT_RR_RR_Reload;
        fiber_sleep(250);
    }
}

static void startFeeder() {
    target_disable_irq();
    bool start = !wdtFeederStarted;
    wdtFeederStarted = true;
    target_enable_irq();
    if (start)
        create_fiber(wdtFeeder, NULL);
}

static void configureWdt() {
    NRF_WDT->RREN = WDT_RREN_RR0_Msk;
    NRF_WDT->CONFIG = WDT_CONFIG_SLEEP_Msk | WDT_CONFIG_HALT_Msk;
    NRF_WDT->TASKS_START = 1;
}

// Arms the WDT on the first call since boot — unless it is still running
// from a previous soft reset, in which case its (locked) configuration
// carries over untouched and only the feeder resumes. The nRF52 ignores
// writes to CRV/RREN/CONFIG once the WDT is started, so whichever call arms
// first since power-on fixes the timeout; every later call just ensures
// the feeder runs.
static void armWdt(int seconds) {
    if (seconds < 3) seconds = 3;
    if (seconds > 120) seconds = 120;

    captureResetReason();

    target_disable_irq();
    bool startWdt = !wdtStarted;
    wdtStarted = true;
    target_enable_irq();

    if (startWdt &&
        !(NRF_WDT->RUNSTATUS & WDT_RUNSTATUS_RUNSTATUS_Msk)) {
        configureWdt();
        NRF_WDT->CRV = seconds * 32768;
    }
    startFeeder();
}

// Auto-arm (main.ts top level, ensureWorker).
void watchdogAutoArm(int seconds) {
    armWdt(seconds);
}

/**
 * Arm the hardware watchdog and start the background feeder.
 */
//%
void watchdogStartShim(int seconds) {
    armWdt(seconds);
}

/**
 * True when the previous reset was caused by the watchdog biting — the
 * program froze and the chip restarted itself.
 */
//%
bool watchdogResetShim() {
    captureResetReason();
    return wdtResetFlag == 1;
}

// True briefly after a watchdog recovery: the cap re-serves the voice
// token that was queued when the chip froze, and replaying its utterance
// would restart the audio pipeline that helped cause the wedge. Dropping
// speech in this window breaks the freeze → reset → freeze loop on its
// own — no user code needed.
bool watchdogRecoveryMute() {
    captureResetReason();
    return wdtResetFlag == 1 &&
           system_timer_current_time() < PUVOICE_WDT_MUTE_MS;
}

}
