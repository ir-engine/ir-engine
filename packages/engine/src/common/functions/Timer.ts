import { isClient } from './isClient'
import { nowMilliseconds } from './nowMilliseconds'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Engine } from '../../ecs/classes/Engine'

type TimerUpdateCallback = (delta: number, elapsedTime: number) => any

const TPS_REPORTS_ENABLED = false
const TPS_REPORT_INTERVAL_MS = 10000

export function Timer(update: TimerUpdateCallback): { start: Function; stop: Function; clear: Function } {
  let lastTime = null
  let elapsedTime = 0
  let delta = 0
  let frameId

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
  let prevTimerRuns = 0
  let serverLoop

  function xrAnimationLoop(time, xrFrame) {
    Engine.xrFrame = xrFrame
    if (lastTime !== null) {
      delta = (time - lastTime) / 1000
      elapsedTime += delta
      update(delta, elapsedTime)
    }
    lastTime = time
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

  function onFrame(time) {
    timerRuns += 1
    const itsTpsReportTime = TPS_REPORT_INTERVAL_MS && nextTpsReportTime <= time
    if (TPS_REPORTS_ENABLED && itsTpsReportTime) {
      tpsPrintReport(time)
    }

    if (lastTime !== null) {
      delta = (time - lastTime) / 1000

      elapsedTime += delta

      tpsSubMeasureStart('update')
      update(delta, elapsedTime)
      tpsSubMeasureEnd('update')
    }

    lastTime = time
  }

  const tpsMeasureStartData = new Map<string, { time: number; ticks: number }>()
  function tpsSubMeasureStart(name) {
    let measureData: { time: number; ticks: number }
    if (tpsMeasureStartData.has(name)) {
      measureData = tpsMeasureStartData.get(name)!
    } else {
      measureData = { time: 0, ticks: 0 }
      tpsMeasureStartData.set(name, measureData)
    }
    measureData.ticks = Engine.tick
    measureData.time = nowMilliseconds()
  }
  function tpsSubMeasureEnd(name) {
    const measureData = tpsMeasureStartData.get(name)!
    newEngineTicks[name] += Engine.tick - measureData.ticks
    newEngineTimeSpent[name] += nowMilliseconds() - measureData.time
  }

  function tpsReset() {
    tpsPrevTicks = Engine.tick
    timerStartTime = nowMilliseconds()
    tpsPrevTime = nowMilliseconds()
    nextTpsReportTime = nowMilliseconds() + TPS_REPORT_INTERVAL_MS
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

  const expectedDelta = 1000 / 60

  function start() {
    elapsedTime = 0
    lastTime = null
    if (isClient) {
      const _onFrame = (time) => {
        frameId = window.requestAnimationFrame(_onFrame)
        onFrame(time)
      }
      frameId = window.requestAnimationFrame(_onFrame)
    } else {
      serverLoop = () => {
        const time = nowMilliseconds()
        if (time - lastTime! >= expectedDelta) {
          onFrame(time)
          lastTime = time
        }
        setImmediate(serverLoop)
      }
      serverLoop()
    }
    tpsReset()
  }

  function stop() {
    if (isClient) {
      cancelAnimationFrame(frameId)
    } else {
      clearImmediate(serverLoop)
    }
  }

  function clear() {
    stop()
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.XR_START)
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.XR_SESSION)
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.XR_END)
  }

  return {
    start: start,
    stop: stop,
    clear: clear
  }
}

/*
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
*/
