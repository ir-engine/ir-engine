import { Engine } from '../../ecs/classes/Engine'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { isClient } from './isClient'
import { nowMilliseconds } from './nowMilliseconds'
import { ServerLoop } from './ServerLoop'

/**
 * @param elapsedTime The elapsed time in seconds
 */
type TimerUpdateCallback = (elapsedTime: number) => any

const TPS_REPORTS_ENABLED = false
const TPS_REPORT_INTERVAL_MS = 10000

export function Timer(update: TimerUpdateCallback, tickRate: number) {
  let debugTick = 0

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
  let serverLoop = null as ServerLoop | null

  function onFrame(time, xrFrame) {
    timerRuns += 1
    const itsTpsReportTime = TPS_REPORT_INTERVAL_MS && nextTpsReportTime <= time
    if (TPS_REPORTS_ENABLED && itsTpsReportTime) {
      tpsPrintReport(time)
    }

    Engine.instance.xrFrame = xrFrame

    tpsSubMeasureStart('update')
    update(time)
    tpsSubMeasureEnd('update')

    Engine.instance.xrFrame = null
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
    measureData.ticks = debugTick
    measureData.time = nowMilliseconds()
  }
  function tpsSubMeasureEnd(name) {
    const measureData = tpsMeasureStartData.get(name)!
    newEngineTicks[name] += debugTick - measureData.ticks
    newEngineTimeSpent[name] += nowMilliseconds() - measureData.time
  }

  function tpsReset() {
    tpsPrevTicks = debugTick
    timerStartTime = nowMilliseconds()
    tpsPrevTime = nowMilliseconds()
    nextTpsReportTime = nowMilliseconds() + TPS_REPORT_INTERVAL_MS
  }

  function tpsPrintReport(time: number): void {
    const seconds = (time - tpsPrevTime) / 1000
    const newTicks = debugTick - tpsPrevTicks
    const tps = newTicks / seconds

    console.log('Timer - tick:', debugTick, ' (+', newTicks, '), seconds', seconds.toFixed(1), ' tps:', tps.toFixed(1))
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
    tpsPrevTicks = debugTick
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

  function start() {
    if (isClient) {
      EngineRenderer.instance.renderer.setAnimationLoop(onFrame)
    } else {
      const _update = () => {
        onFrame(nowMilliseconds(), null)
      }
      serverLoop = new ServerLoop(_update, tickRate).start()
    }
    tpsReset()
  }

  function stop() {
    if (isClient) {
      EngineRenderer.instance.renderer.setAnimationLoop(null)
    } else {
      serverLoop?.stop()
    }
  }

  function clear() {
    stop()
  }

  return {
    start: start,
    stop: stop,
    clear: clear
  }
}
