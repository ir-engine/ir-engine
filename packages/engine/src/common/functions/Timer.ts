/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Engine } from '../../ecs/classes/Engine'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { isClient } from './getEnvironment'
import { nowMilliseconds } from './nowMilliseconds'
import { ServerLoop } from './ServerLoop'

/**
 * @param elapsedTime The elapsed time in seconds
 */
type TimerUpdateCallback = (elapsedTime: number) => any

const TPS_REPORTS_ENABLED = false
const TPS_REPORT_INTERVAL_MS = 10000

export function Timer(update: TimerUpdateCallback, serverTickRate = 60) {
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
      serverLoop = new ServerLoop(_update, serverTickRate).start()
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
