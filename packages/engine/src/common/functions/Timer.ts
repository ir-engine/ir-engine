import { isClient } from './isClient'
import { now } from './now'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { XRSystem } from '../../xr/systems/XRSystem'
import { Engine } from '../../ecs/classes/Engine'

type TimerUpdateCallback = (delta: number, elapsedTime?: number) => any

const TPS_REPORTS_ENABLED = false
const TPS_REPORT_INTERVAL_MS = 10000

export function Timer(
  callbacks: { update?: TimerUpdateCallback; fixedUpdate?: TimerUpdateCallback; networkUpdate?: TimerUpdateCallback },
  fixedFrameRate?: number,
  networkTickRate?: number
): { start: Function; stop: Function; clear: Function } {
  const fixedRate = fixedFrameRate || 60
  const networkRate = networkTickRate || 20

  let lastTime = null
  let accumulated = 0
  let delta = 0
  let frameDelta = 0
  let frameId
  let running = false

  const freeUpdatesLimit = 120
  const freeUpdatesLimitInterval = 1 / freeUpdatesLimit
  let freeUpdatesTimer = 0

  const newEngineTicks = {
    fixed: 0,
    net: 0,
    update: 0,
    render: 0
  }
  const newEngineTimeSpent = {
    fixed: 0,
    net: 0,
    update: 0,
    render: 0
  }

  let timerStartTime = 0
  let tpsPrevTime = 0
  let tpsPrevTicks = 0
  let nextTpsReportTime = 0
  let timerRuns = 0
  let lastAnimTime = 0
  let prevTimerRuns = 0
  let updateInterval

  function xrAnimationLoop(time, xrFrame) {
    Engine.xrFrame = xrFrame
    if (lastAnimTime !== null) {
      frameDelta = (time - lastAnimTime) / 1000
      accumulated = accumulated + frameDelta
      if (callbacks.networkUpdate) {
        callbacks.networkUpdate(frameDelta, accumulated)
      }
      if (callbacks.fixedUpdate) {
        callbacks.fixedUpdate(frameDelta, accumulated)
      }
      if (callbacks.update) {
        callbacks.update(frameDelta, accumulated)
      }
    }
    lastAnimTime = time
  }

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.XR_START, async (ev: any) => {
    stop()
  })
  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.XR_SESSION, async (ev: any) => {
    Engine.xrRenderer.setAnimationLoop(xrAnimationLoop)
  })
  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.XR_END, async (ev: any) => {
    start()
  })

  const fixedRunner = callbacks.fixedUpdate ? new FixedStepsRunner(fixedRate, callbacks.fixedUpdate) : null
  const networkRunner = callbacks.fixedUpdate ? new FixedStepsRunner(networkRate, callbacks.networkUpdate) : null

  function onUpdate(time) {
    timerRuns += 1
    const itsTpsReportTime = TPS_REPORT_INTERVAL_MS && nextTpsReportTime <= time
    if (TPS_REPORTS_ENABLED && itsTpsReportTime) {
      tpsPrintReport(time)
    }

    delta = (time - lastTime) / 1000

    if (fixedRunner) {
      tpsSubMeasureStart('fixed')
      callbacks.fixedUpdate(delta, time)

      // accumulator doesn't like setInterval on client, disable for now
      // fixedRunner.run(delta);

      tpsSubMeasureEnd('fixed')
    }

    if (networkRunner) {
      tpsSubMeasureStart('net')
      callbacks.networkUpdate(delta, time)

      // accumulator doesn't like setInterval on client, disable for now
      // networkRunner.run(delta);

      tpsSubMeasureEnd('net')
    }
  }

  function onFrame(time) {
    frameId = window.requestAnimationFrame(onFrame)

    if (lastAnimTime !== null) {
      frameDelta = (time - lastAnimTime) / 1000
      accumulated = accumulated + frameDelta

      if (freeUpdatesLimit) {
        freeUpdatesTimer += frameDelta
      }
      const updateFrame = !freeUpdatesLimit || freeUpdatesTimer > freeUpdatesLimitInterval
      if (updateFrame) {
        if (callbacks.update) {
          tpsSubMeasureStart('update')
          callbacks.update(frameDelta, accumulated)
          tpsSubMeasureEnd('update')
        }

        if (freeUpdatesLimit) {
          freeUpdatesTimer %= freeUpdatesLimitInterval
        }
      }
    }
    lastAnimTime = time
  }

  const tpsMeasureStartData = new Map<string, { time: number; ticks: number }>()
  function tpsSubMeasureStart(name) {
    let measureData: { time: number; ticks: number }
    if (tpsMeasureStartData.has(name)) {
      measureData = tpsMeasureStartData.get(name)
    } else {
      measureData = { time: 0, ticks: 0 }
      tpsMeasureStartData.set(name, measureData)
    }
    measureData.ticks = Engine.tick
    measureData.time = now()
  }
  function tpsSubMeasureEnd(name) {
    const measureData = tpsMeasureStartData.get(name)
    newEngineTicks[name] += Engine.tick - measureData.ticks
    newEngineTimeSpent[name] += now() - measureData.time
  }

  function tpsReset() {
    tpsPrevTicks = Engine.tick
    timerStartTime = now()
    tpsPrevTime = now()
    nextTpsReportTime = now() + TPS_REPORT_INTERVAL_MS
  }

  function tpsPrintReport(time: number): void {
    const seconds = (time - tpsPrevTime) / 1000
    const newTicks = Engine.tick - tpsPrevTicks
    const tps = newTicks / seconds

    console.log(
      'Timer - tick:',
      Engine.tick,
      ' (+',
      newTicks,
      '), seconds',
      seconds.toFixed(1),
      ' tps:',
      tps.toFixed(1)
    )
    console.log(((time - timerStartTime) / timerRuns).toFixed(3), 'ms per onFrame')

    console.log(
      'Timer - fixed:',
      newEngineTicks.fixed,
      ', tps:',
      (newEngineTicks.fixed / seconds).toFixed(1),
      ' ms per tick:',
      newEngineTimeSpent.fixed / newEngineTicks.fixed
    )
    console.log(
      'Timer - net  :',
      newEngineTicks.net,
      ', tps:',
      (newEngineTicks.net / seconds).toFixed(1),
      ' ms per tick:',
      newEngineTimeSpent.net / newEngineTicks.net
    )
    console.log(
      'Timer - other:',
      newEngineTicks.update,
      ', tps:',
      (newEngineTicks.update / seconds).toFixed(1),
      ' ms per tick:',
      newEngineTimeSpent.update / newEngineTicks.update
    )
    console.log('Timer runs: +', timerRuns - prevTimerRuns)
    console.log('==================================================')

    tpsPrevTime = time
    nextTpsReportTime = time + TPS_REPORT_INTERVAL_MS
    tpsPrevTicks = Engine.tick
    newEngineTicks.fixed = 0
    newEngineTicks.net = 0
    newEngineTicks.update = 0
    newEngineTicks.render = 0

    newEngineTimeSpent.fixed = 0
    newEngineTimeSpent.net = 0
    newEngineTimeSpent.update = 0
    newEngineTimeSpent.render = 0

    prevTimerRuns = timerRuns
  }

  const expectedUpdateDelta = 1000 / fixedRate

  function start() {
    running = true
    lastTime = null
    lastAnimTime = null
    if (isClient) {
      // render loop
      frameId = window.requestAnimationFrame(onFrame)
      // logic loop
      updateInterval = setInterval(() => {
        const time = now()
        onUpdate(time)
        lastTime = time
      }, expectedUpdateDelta)
    } else {
      const serverLoop = () => {
        const time = Date.now()
        if (time - lastTime >= expectedUpdateDelta && running) {
          onUpdate(time)
          lastTime = time
        }
        setImmediate(serverLoop)
      }
      serverLoop()
    }
    tpsReset()
  }

  function stop() {
    running = false
    if (typeof updateInterval !== 'undefined') {
      clearInterval(updateInterval)
      updateInterval = undefined
    }
    if (isClient) {
      cancelAnimationFrame(frameId)
    }
  }

  function clear() {
    cancelAnimationFrame(frameId)
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.XR_START)
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.XR_SESSION)
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.XR_END)
    delete this.fixedRunner
    delete this.networkRunner
  }

  return {
    start: start,
    stop: stop,
    clear: clear
  }
}

// Unused, may use again in future

function requestAnimationFrameOnServer(f) {}

export class FixedStepsRunner {
  timestep: number
  limit: number
  updatesLimit: number

  readonly subsequentErrorsLimit = 10
  readonly subsequentErrorsResetLimit = 1000
  private subsequentErrorsShown = 0
  private shownErrorPreviously = false
  private accumulator = 0
  readonly callback: (time: number) => void

  constructor(updatesPerSecond: number, callback: (time: number) => void) {
    this.timestep = 1 / updatesPerSecond
    this.limit = this.timestep * 1000
    this.updatesLimit = updatesPerSecond
    this.callback = callback
  }

  canRun(delta: number): boolean {
    return this.accumulator + delta > this.timestep
  }

  run(delta: number): void {
    const start = now()
    let timeUsed = 0
    let updatesCount = 0

    this.accumulator += delta

    let accumulatorDepleted = this.accumulator < this.timestep
    let timeout = timeUsed > this.limit
    let updatesLimitReached = updatesCount > this.updatesLimit
    while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
      this.callback(this.accumulator)
      console.log(this.accumulator)

      this.accumulator -= this.timestep
      ++updatesCount

      timeUsed = now() - start
      accumulatorDepleted = this.accumulator < this.timestep
      timeout = timeUsed > this.limit
      updatesLimitReached = updatesCount >= this.updatesLimit
    }

    if (!accumulatorDepleted) {
      if (this.subsequentErrorsShown <= this.subsequentErrorsLimit) {
        // console.error('Fixed timesteps SKIPPED time used ', timeUsed, 'ms (of ', this.limit, 'ms), made ', updatesCount, 'updates. skipped ', Math.floor(this.accumulator / this.timestep))
        // console.log('accumulatorDepleted', accumulatorDepleted, 'timeout', timeout, 'updatesLimitReached', updatesLimitReached)
      } else {
        if (this.subsequentErrorsShown > this.subsequentErrorsResetLimit) {
          console.error('FixedTimestep', this.subsequentErrorsResetLimit, ' subsequent errors catched')
          this.subsequentErrorsShown = this.subsequentErrorsLimit - 1
        }
      }

      if (this.shownErrorPreviously) {
        this.subsequentErrorsShown++
      }
      this.shownErrorPreviously = true

      this.accumulator = this.accumulator % this.timestep
    } else {
      this.subsequentErrorsShown = 0
      this.shownErrorPreviously = false
    }
  }
}

// TODO: unused
export function createFixedTimestep(
  updatesPerSecond: number,
  callback: (time: number) => void
): (delta: number) => void {
  const timestep = 1 / updatesPerSecond
  const limit = timestep * 1000
  const updatesLimit = updatesPerSecond

  const subsequentErorrsLimit = 10
  const subsequentErorrsResetLimit = 1000
  let subsequentErorrsShown = 0
  let shownErrorPreviously = false
  let accumulator = 0

  return (delta) => {
    const start = now()
    let timeUsed = 0
    let updatesCount = 0

    accumulator += delta

    let accumulatorDepleted = accumulator < timestep
    let timeout = timeUsed > limit
    let updatesLimitReached = updatesCount > updatesLimit
    while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
      callback(accumulator)

      accumulator -= timestep
      ++updatesCount

      timeUsed = now() - start
      accumulatorDepleted = accumulator < timestep
      timeout = timeUsed > limit
      updatesLimitReached = updatesCount >= updatesLimit
    }

    if (!accumulatorDepleted) {
      if (subsequentErorrsShown <= subsequentErorrsLimit) {
        // console.error('Fixed timesteps SKIPPED time used ', timeUsed, 'ms (of ', limit, 'ms), made ', updatesCount, 'updates. skipped ', Math.floor(accumulator / timestep));
        // console.log('accumulatorDepleted', accumulatorDepleted, 'timeout', timeout, 'updatesLimitReached', updatesLimitReached);
      } else {
        if (subsequentErorrsShown > subsequentErorrsResetLimit) {
          // console.error('FixedTimestep', subsequentErorrsResetLimit, ' subsequent errors catched');
          subsequentErorrsShown = subsequentErorrsLimit - 1
        }
      }

      if (shownErrorPreviously) {
        subsequentErorrsShown++
      }
      shownErrorPreviously = true

      accumulator = accumulator % timestep
    } else {
      subsequentErorrsShown = 0
      shownErrorPreviously = false
    }
  }
}
