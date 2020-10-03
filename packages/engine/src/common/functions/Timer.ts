import { isBrowser } from './isBrowser';
import { now } from "./now";

export function Timer (
  callbacks: { update?: Function, render?: Function },
  step?: number
): { start: Function, stop: Function } {
  const increment = step || 1 / 60;

  let last = 0;
  let accumulated = 0;
  let delta = 0;
  let frameId;

  function onFrame (time) {
    frameId = (isBrowser ? requestAnimationFrame : requestAnimationFrameOnServer)(onFrame);

    if (last !== null) {
      delta = (time - last) / 1000;
      accumulated = accumulated + delta;

      if (callbacks.update) callbacks.update(delta, accumulated);
    }
    last = time;
    if (callbacks.render) callbacks.render();
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

export class FixedStepsRunner {
  timestep: number
  limit: number
  updatesLimit: number

  readonly subsequentErrorsLimit = 10
  readonly subsequentErrorsResetLimit = 1000
  private subsequentErrorsShown = 0
  private shownErrorPreviously = false
  private accumulator = 0
  readonly callback:(time:number)=>void

  constructor(updatesPerSecond:number, callback:(time:number)=>void) {
    this.timestep = 1 / updatesPerSecond;
    this.limit = this.timestep * 1000;
    this.updatesLimit = updatesPerSecond;
    this.callback = callback;
  }

  canRun(delta:number):boolean {
    return (this.accumulator + delta) > this.timestep;
  }

  run(delta:number):void {
    const start = now();
    let timeUsed = 0;
    let updatesCount = 0;

    this.accumulator += delta;

    let accumulatorDepleted = this.accumulator < this.timestep;
    let timeout = timeUsed > this.limit;
    let updatesLimitReached = updatesCount > this.updatesLimit;
    while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
      this.callback(this.accumulator);

      this.accumulator -= this.timestep;
      ++updatesCount;

      timeUsed = now() - start;
      accumulatorDepleted = this.accumulator < this.timestep;
      timeout = timeUsed > this.limit;
      updatesLimitReached = updatesCount >= this.updatesLimit;
    }

    if (!accumulatorDepleted) {
      if (this.subsequentErrorsShown <= this.subsequentErrorsLimit) {
        // console.error('Fixed timesteps SKIPPED time used ', timeUsed, 'ms (of ', this.limit, 'ms), made ', updatesCount, 'updates. skipped ', Math.floor(this.accumulator / this.timestep))
        // console.log('accumulatorDepleted', accumulatorDepleted, 'timeout', timeout, 'updatesLimitReached', updatesLimitReached)
      } else {
        if (this.subsequentErrorsShown > this.subsequentErrorsResetLimit) {
          console.error('FixedTimestep', this.subsequentErrorsResetLimit, ' subsequent errors catched');
          this.subsequentErrorsShown = this.subsequentErrorsLimit - 1;
        }
      }

      if (this.shownErrorPreviously) {
        this.subsequentErrorsShown++;
      }
      this.shownErrorPreviously = true;

      this.accumulator = this.accumulator % this.timestep;
    } else {
      this.subsequentErrorsShown = 0;
      this.shownErrorPreviously = false;
    }
  }
}

export function createFixedTimestep(updatesPerSecond:number, callback:(time:number)=>void):(delta:number)=>void {
  const timestep = 1 / updatesPerSecond;
  const limit = timestep * 1000;
  const updatesLimit = updatesPerSecond;

  const subsequentErorrsLimit = 10;
  const subsequentErorrsResetLimit = 1000;
  let subsequentErorrsShown = 0;
  let shownErrorPreviously = false;
  let accumulator = 0;

  return delta => {
    const start = now();
    let timeUsed = 0;
    let updatesCount = 0;

    accumulator += delta;

    let accumulatorDepleted = accumulator < timestep;
    let timeout = timeUsed > limit;
    let updatesLimitReached = updatesCount > updatesLimit;
    while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
      callback(accumulator);

      accumulator -= timestep;
      ++updatesCount;

      timeUsed = now() - start;
      accumulatorDepleted = accumulator < timestep;
      timeout = timeUsed > limit;
      updatesLimitReached = updatesCount >= updatesLimit;
    }

    if (!accumulatorDepleted) {
      if (subsequentErorrsShown <= subsequentErorrsLimit) {
        console.error('Fixed timesteps SKIPPED time used ', timeUsed, 'ms (of ', limit, 'ms), made ', updatesCount, 'updates. skipped ', Math.floor(accumulator / timestep));
        console.log('accumulatorDepleted', accumulatorDepleted, 'timeout', timeout, 'updatesLimitReached', updatesLimitReached);
      } else {
        if (subsequentErorrsShown > subsequentErorrsResetLimit) {
          console.error('FixedTimestep', subsequentErorrsResetLimit, ' subsequent errors catched');
          subsequentErorrsShown = subsequentErorrsLimit - 1;
        }
      }

      if (shownErrorPreviously) {
        subsequentErorrsShown++;
      }
      shownErrorPreviously = true;

      accumulator = accumulator % timestep;
    } else {
      subsequentErorrsShown = 0;
      shownErrorPreviously = false;
    }
  };
}
