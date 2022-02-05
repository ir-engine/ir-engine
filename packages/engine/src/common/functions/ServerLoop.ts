interface Option {
  delta_log?: boolean
  dif_log?: boolean
  logs: boolean
  time_fn?: () => number
}

export class ServerLoop {
  _update: Function
  _lastFrameTime: number
  _running: boolean
  _step: number
  _deltas: Array<number>
  constructor(update = () => {}, public _times: number = 10, public _option?: Option) {
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
