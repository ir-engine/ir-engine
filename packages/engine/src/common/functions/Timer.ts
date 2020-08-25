import { isBrowser } from './isBrowser';

export function Timer (
  callbacks: { update?: Function, render?: Function },
  step?: number
): { start: Function, stop: Function } {
  const increment = step || 1 / 60;

  let last = 0;
  let accumulated = 0;
  //let tick = 0;
  let delta = 0;
  let frameId;

  function onFrame (time) {
    if (last !== null) {
      delta = (time - last) / 1000
      accumulated = accumulated + delta;
      // while (accumulated > increment) {
      //   if (callbacks.update) callbacks.update(increment, tick);
      //   tick = tick + 1;
      //   accumulated = accumulated - increment;
      // }
      if (callbacks.update) callbacks.update(accumulated, delta);
    }
    last = time;
    if (callbacks.render) callbacks.render();
    frameId = (isBrowser ? requestAnimationFrame : requestAnimationFrameOnServer)(onFrame);
  }

  function start () {
    last = null;
    frameId = (isBrowser ? requestAnimationFrame : requestAnimationFrameOnServer)(onFrame);
  }

  function stop () {
    cancelAnimationFrame(frameId);
  }

  return {
    start: start,
    stop: stop
  };
}
function requestAnimationFrameOnServer (f) {
  setImmediate(() => f(Date.now()));
}
