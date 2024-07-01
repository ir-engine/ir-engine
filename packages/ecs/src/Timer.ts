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

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'

const performance: Performance = isClient ? window.performance : require('perf_hooks').performance

/**
 * return current time of the system.
 */
export const nowMilliseconds = performance.now.bind(performance)

/**
 * @param elapsedTime The elapsed time in seconds
 */
type TimerUpdateCallback = (elapsedTime: number, xrFrame: XRFrame | null) => any

const TPS_REPORTS_ENABLED = false
const TPS_REPORT_INTERVAL_MS = 10000

/**
 * @returns callback function to call after running what you want to profile
 */
export function profile(): () => number {
  const now = nowMilliseconds()
  return (): number => {
    return nowMilliseconds() - now
  }
}

export function Timer(update: TimerUpdateCallback, serverTickRate = 60) {
  const animation = 'requestAnimationFrame' in self ? createAnimationLoop() : createServerLoop(serverTickRate)

  animation.setContext(self)

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

  function onFrame(time: number, xrFrame: XRFrame | null) {
    timerRuns += 1
    const itsTpsReportTime = TPS_REPORT_INTERVAL_MS && nextTpsReportTime <= time
    if (TPS_REPORTS_ENABLED && itsTpsReportTime) {
      tpsPrintReport(time)
    }

    tpsSubMeasureStart('update')
    update(time, xrFrame)
    tpsSubMeasureEnd('update')
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
    animation.setAnimationLoop(onFrame)
    animation.start()
    tpsReset()
  }

  function stop() {
    animation.setAnimationLoop(null)
    animation.stop()
  }

  function clear() {
    stop()
  }

  return {
    animation,
    start: start,
    stop: stop,
    clear: clear
  }
}

interface Option {
  delta_log?: boolean
  dif_log?: boolean
  logs: boolean
  time_fn?: () => number
}

export class ServerLoop {
  _update: (delta: number) => void
  _lastFrameTime: number
  _running: boolean
  _step: number
  _deltas: Array<number>
  constructor(
    update = () => {},
    public _times: number = 10,
    public _option?: Option
  ) {
    this._update = update
    this._running = false
    this._step = 1000 / this._times
    this._lastFrameTime = this._time()
    this._deltas = Array<number>()
  }
  _nano() {
    const hrtime = process.hrtime()
    return +hrtime[0] * 1e9 + +hrtime[1]
  }
  _ConvertSecondsToNano(sec: number): number {
    return sec * 1e9
  }
  _ConvertNanoToSeconds(nano: number): number {
    return nano * (1 / 1e9)
  }
  _ConvertNanoToMs(nano: number): number {
    return this._ConvertNanoToSeconds(nano) * 1000
  }
  _ConvertMsToNano(ms: number): number {
    return ms * 1e6
  }
  now_ms(): number {
    return this._ConvertNanoToMs(this._time())
  }
  _time(): number {
    return this._option?.time_fn?.() ?? this._nano()
  }
  start(): ServerLoop {
    this._running = true
    this._lastFrameTime = this._time()
    this._deltas = Array<number>()
    const expectedLength = this._ConvertMsToNano(this._step)
    const _interval = Math.max(Math.floor(this._step - 1), 16)
    const jitterThreshold = 3 // ms
    const maxDeltaLength = Math.ceil(((1 / this._step) * 1000) / 2) + 1
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this // changes to _this will also happen on this

    let _target = this._time()

    function _tick() {
      if (!_this._running) return

      const now = _this._time()
      const delta = now - _this._lastFrameTime

      if (now <= _target) {
        // we dont need to simulate yet!!
        return setImmediate(_tick)
      }

      // average out the delta!!
      if (_this._deltas.length >= maxDeltaLength) {
        _this._deltas.shift()
      }
      _this._deltas.push(delta)

      const averageDelta = _this._deltas.reduce((a, b) => a + b, 0) / (_this._deltas.length || 1)

      // shift some values !!!
      _this._lastFrameTime = now
      _target = now + expectedLength

      if (_this._ConvertNanoToMs(Math.abs(expectedLength - averageDelta)) >= jitterThreshold) {
        // lets shift the target !!!! :D

        if (_this._option?.logs || _this._option?.dif_log) {
          console.log(_this._ConvertNanoToMs(expectedLength - averageDelta))
        }

        _target += expectedLength - averageDelta
      }

      // run the update !!
      _this._update(_this._ConvertNanoToMs(delta) / 1000) // (delta in seconds)

      if (_this._option?.logs || _this._option?.delta_log) {
        console.log(`${_this._ConvertNanoToMs(delta)} ms`)
      }

      const remaining = _target - _this._time()
      if (remaining > expectedLength) {
        // this shouldnt happen!
        return setTimeout(_tick, _interval)
      } else {
        // to make it very precise, runs next event loop !!
        return setImmediate(_tick)
      }
    }

    setTimeout(_tick, _interval)

    return this
  }
  stop(): ServerLoop {
    this._running = false
    return this
  }
}

export function createServerLoop(serverTickRate: number) {
  let serverLoop = null as null | ServerLoop
  let onFrame = null as null | ((time: number, frame: XRFrame) => void)
  return {
    start: function () {
      const _update = () => {
        if (onFrame) onFrame(nowMilliseconds(), null!)
      }
      serverLoop = new ServerLoop(_update, serverTickRate).start()
    },
    stop: function () {
      serverLoop?.stop()
    },
    setAnimationLoop: function (callback) {
      onFrame = callback
    },
    setContext: function () {
      // do nothing
    }
  }
}

export function createAnimationLoop() {
  let context = null as any
  let isAnimating = false
  let animationLoop = null as null | ((time: number, frame: XRFrame) => void)
  let requestId = null

  function onAnimationFrame(time, frame) {
    requestId = context.requestAnimationFrame(onAnimationFrame)
    animationLoop!(time, frame)
  }

  return {
    start: function () {
      if (isAnimating === true) return
      if (animationLoop === null) return

      requestId = context.requestAnimationFrame(onAnimationFrame)

      isAnimating = true
    },

    stop: function () {
      context.cancelAnimationFrame(requestId)

      isAnimating = false
    },

    setAnimationLoop: function (callback) {
      animationLoop = callback
    },

    setContext: function (value) {
      context = value
    }
  }
}
