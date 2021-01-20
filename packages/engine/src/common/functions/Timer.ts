import { isClient } from './isClient';
import { now } from "./now";
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";

type TimerUpdateCallback = (delta: number, elapsedTime?: number) => any;

const TPS_REPORTS_ENABLED = false;
const TPS_REPORT_INTERVAL_MS = 10000;

export function Timer (
  callbacks: { update?: TimerUpdateCallback; fixedUpdate?: TimerUpdateCallback; networkUpdate?: TimerUpdateCallback; render?: Function },
  fixedFrameRate?: number, networkTickRate?: number
): { start: Function; stop: Function } {
  const fixedRate = fixedFrameRate || 60;
  const networkRate = networkTickRate || 20;

  let last = 0;
  let accumulated = 0;
  let delta = 0;
  let frameId;

  const fpsLimit = 120;
  const interval = 1 / fpsLimit;
  let elapsedTime = 0;
  let updateFrame = true;

  const newEngineTicks = {
    fixed: 0,
    net: 0,
    update: 0,
    render: 0
  };
  const newEngineTimeSpent = {
    fixed: 0,
    net: 0,
    update: 0,
    render: 0
  };

  let timerStartTime = 0;
  let tpsPrevTime = 0;
  let tpsPrevTicks = 0;
  let nextTpsReportTime = 0;
  let timerRuns = 0;
  let prevTimerRuns = 0;

  function render(time) {
    if (Engine.xrSession) {
      if (last !== null) {
        delta = (time - last) / 1000;
        accumulated = accumulated + delta;

        if (fixedRunner) {
          fixedRunner.run(delta);
        }

        if (networkRunner) {
          networkRunner.run(delta);
        }

        if (callbacks.update) callbacks.update(delta, accumulated);
      }
      last = time;
  		Engine.renderer.render( Engine.scene, Engine.camera );
    } else {
      Engine.renderer.setAnimationLoop( null );
      start();
    }
	}

  const fixedRunner = callbacks.fixedUpdate? new FixedStepsRunner(fixedRate, callbacks.fixedUpdate) : null;
  const networkRunner = callbacks.fixedUpdate? new FixedStepsRunner(networkRate, callbacks.networkUpdate) : null;

  const updateFunction = (isClient ? requestAnimationFrame : requestAnimationFrameOnServer);

  function onFrame (time) {
    timerRuns+=1;
    const itsTpsReportTime = TPS_REPORT_INTERVAL_MS && nextTpsReportTime <= time;
    if (TPS_REPORTS_ENABLED && itsTpsReportTime) {
      tpsPrintReport(time);
    }

    if (Engine.xrSession) {
      stop();
      Engine.renderer.setAnimationLoop( render );
      //  frameId = Engine.xrSession.requestAnimationFrame(toXR)
    } else {
      frameId = updateFunction(onFrame);

      if (last !== null) {
        delta = (time - last) / 1000;
        accumulated = accumulated + delta;

        elapsedTime += delta;
        updateFrame = fpsLimit && (elapsedTime > interval)

        if (updateFrame) {
          if (fixedRunner) {
            tpsSubMeasureStart('fixed');
            fixedRunner.run(delta);
            tpsSubMeasureEnd('fixed');
          }
  
          if (networkRunner) {
            tpsSubMeasureStart('net');
            networkRunner.run(delta);
            tpsSubMeasureEnd('net');
          }
  
          if (callbacks.update) {
            tpsSubMeasureStart('update');
            callbacks.update(delta, accumulated);
            tpsSubMeasureEnd('update');
          }

          elapsedTime %= interval;
        }
      }
      last = time;
      if (callbacks.render && updateFrame) {
        tpsSubMeasureStart('render');
        callbacks.render();
        tpsSubMeasureEnd('render');
      }
    }
  }

  const tpsMeasureStartData = new Map<string, { time: number, ticks: number }>();
  function tpsSubMeasureStart(name) {
    let measureData:{ time: number, ticks: number };
    if (tpsMeasureStartData.has(name)) {
      measureData = tpsMeasureStartData.get(name);
    } else {
      measureData = { time: 0, ticks: 0 };
      tpsMeasureStartData.set(name, measureData);
    }
    measureData.ticks = Engine.tick;
    measureData.time = now();
  }
  function tpsSubMeasureEnd(name) {
    const measureData = tpsMeasureStartData.get(name);
    newEngineTicks[name] += Engine.tick - measureData.ticks;
    newEngineTimeSpent[name] += now() - measureData.time;
  }

  function tpsReset() {
    tpsPrevTicks = Engine.tick;
    timerStartTime = now();
    tpsPrevTime = now();
    nextTpsReportTime = now() + TPS_REPORT_INTERVAL_MS;
  }

  function tpsPrintReport(time:number): void {
    const seconds = (time -  tpsPrevTime)/1000;
    const newTicks = Engine.tick - tpsPrevTicks;
    const tps = newTicks / seconds;

    console.log('Timer - tick:', Engine.tick, ' (+', newTicks,'), seconds', seconds.toFixed(1), ' tps:', tps.toFixed(1));
    console.log(((time - timerStartTime)/timerRuns).toFixed(3), 'ms per onFrame');

    console.log('Timer - fixed:', newEngineTicks.fixed, ', tps:', (newEngineTicks.fixed / seconds).toFixed(1), " ms per tick:", (newEngineTimeSpent.fixed / newEngineTicks.fixed));
    console.log('Timer - net  :', newEngineTicks.net, ', tps:', (newEngineTicks.net / seconds).toFixed(1), " ms per tick:", (newEngineTimeSpent.net / newEngineTicks.net));
    console.log('Timer - other:', newEngineTicks.update, ', tps:', (newEngineTicks.update / seconds).toFixed(1), " ms per tick:", (newEngineTimeSpent.update / newEngineTicks.update));
    console.log('Timer runs: +', timerRuns - prevTimerRuns);
    console.log('==================================================');

    tpsPrevTime = time;
    nextTpsReportTime = time + TPS_REPORT_INTERVAL_MS;
    tpsPrevTicks = Engine.tick;
    newEngineTicks.fixed = 0;
    newEngineTicks.net = 0;
    newEngineTicks.update = 0;
    newEngineTicks.render = 0;

    newEngineTimeSpent.fixed = 0;
    newEngineTimeSpent.net = 0;
    newEngineTimeSpent.update = 0;
    newEngineTimeSpent.render = 0;

    prevTimerRuns = timerRuns;
  }

/*
  function toXR (timestamp, xrFrame) {
    if (Engine.xrSession) {
      Engine.xrSession.requestAnimationFrame(toXR)
      onFrameXR(timestamp, xrFrame, callbacks)
    } else {
      xrFrame.session.end();
      frameId = defaultAnimationFrame(onFrame)
    }
  }
*/
  function start () {
    last = null;
    frameId = updateFunction(onFrame);
    tpsReset();
  }

  function stop () {
    cancelAnimationFrame(frameId);
  }

  return {
    start: start,
    stop: stop
  };
}
function requestAnimationFrameOnServer(f) {
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
  readonly callback: (time: number) => void

  constructor(updatesPerSecond: number, callback: (time: number) => void) {
    this.timestep = 1 / updatesPerSecond;
    this.limit = this.timestep * 1000;
    this.updatesLimit = updatesPerSecond;
    this.callback = callback;
  }

  canRun(delta: number): boolean {
    return (this.accumulator + delta) > this.timestep;
  }

  run(delta: number): void {
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

export function createFixedTimestep(updatesPerSecond: number, callback: (time: number) => void): (delta: number) => void {
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
        // console.error('Fixed timesteps SKIPPED time used ', timeUsed, 'ms (of ', limit, 'ms), made ', updatesCount, 'updates. skipped ', Math.floor(accumulator / timestep));
        // console.log('accumulatorDepleted', accumulatorDepleted, 'timeout', timeout, 'updatesLimitReached', updatesLimitReached);
      } else {
        if (subsequentErorrsShown > subsequentErorrsResetLimit) {
          // console.error('FixedTimestep', subsequentErorrsResetLimit, ' subsequent errors catched');
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
