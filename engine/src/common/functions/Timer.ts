import { isBrowser } from "./isBrowser"

export function Timer(
  callbacks: { update?: Function; render?: Function },
  step?: number
): { start: Function; stop: Function } {
  const increment = step || 1 / 60

  let last = 0,
    accumulated = 0,
    tick = 0,
    frameId

  function onFrame(time) {
    if (last !== null) {
      accumulated = accumulated + (time - last) / 1000
      while (accumulated > increment) {
        if (callbacks.update) callbacks.update(increment, tick)
        tick = tick + 1
        accumulated = accumulated - increment
      }
    }
    last = time
    if (callbacks.render) callbacks.render()
    frameId = (isBrowser ? requestAnimationFrame : requestAnimationFrameOnServer)(onFrame)
  }

  function start() {
    last = null
    frameId = (isBrowser ? requestAnimationFrame : requestAnimationFrameOnServer)(onFrame)
  }

  function stop() {
    cancelAnimationFrame(frameId)
  }

  return {
    start: start,
    stop: stop
  }
}
function requestAnimationFrameOnServer(f) {
  setImmediate(() => f(Date.now()))
}
