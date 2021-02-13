import { isClient } from './isClient';
import { now } from "./now";
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";

type TimerUpdateCallback = (delta: number, elapsedTime?: number) => any;

const TPS_REPORTS_ENABLED = false;
const TPS_REPORT_INTERVAL_MS = 10000;

export function IKTimer (
  callbacks: { update?: TimerUpdateCallback; fixedUpdate?: TimerUpdateCallback; networkUpdate?: TimerUpdateCallback; render?: Function },
  fixedFrameRate?: number, networkTickRate?: number
): { start: Function; stop: Function } {
  const fixedRate = fixedFrameRate || 60;
  const networkRate = networkTickRate || 20;

  let last = 0;
  let accumulated = 0;
  let delta = 0;
  let frameId;

  const freeUpdatesLimit = 120;
  const freeUpdatesLimitInterval = 1 / freeUpdatesLimit;
  let freeUpdatesTimer = 0;

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

        // if (fixedRunner) {
        //   fixedRunner.run(delta);
        // }

        // updateActor(time);
        // if (networkRunner) {
        //   networkRunner.run(delta);
        // }

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

  function onFrame (time, frame) {
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

        if (freeUpdatesLimit) {
          freeUpdatesTimer += delta;
        }
        const updateFrame = !freeUpdatesLimit || freeUpdatesTimer > freeUpdatesLimitInterval;
        if (updateFrame) {
          if (callbacks.update) {
            tpsSubMeasureStart('update');
            callbacks.update(delta, accumulated);
            tpsSubMeasureEnd('update');
          }

          if (freeUpdatesLimit) {
            freeUpdatesTimer %= freeUpdatesLimitInterval;
          }
        }
      }
      last = time;
      if (callbacks.render) {
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

function updateActor(time, frame, referenceSpace) {
  // const actor = getComponent(entity)
  // const now = Date.now();
  // const timeDiff = now - lastTimestamp;

  // if (rig) {
  //   if (renderer.vr.enabled) {
  //     const vrCameras = renderer.vr.getCamera(camera).cameras;
  //     const vrCamera = vrCameras[0];
  //     const vrCamera2 = vrCameras[1];
  //     vrCamera.matrixWorld.decompose(vrCamera.position, vrCamera.quaternion, vrCamera.scale);
  //     vrCamera2.matrixWorld.decompose(vrCamera2.position, vrCamera2.quaternion, vrCamera2.scale);
  //     vrCamera.position.add(vrCamera2.position).divideScalar(2);
  //     const inputSources = Array.from(session.inputSources);
  //     const gamepads = navigator.getGamepads();

  //     rig.inputs.hmd.position.copy(vrCamera.position).sub(container.position).multiplyScalar(heightFactor);
  //     rig.inputs.hmd.quaternion.copy(vrCamera.quaternion);

  //     const _getGamepad = i => {
  //       const handedness = i === 0 ? 'left' : 'right';
  //       const inputSource = inputSources.find(inputSource => inputSource.handedness === handedness);
  //       let pose, gamepad;
  //       if (inputSource && (pose = frame.getPose(inputSource.gripSpace, referenceSpace)) && (gamepad = inputSource.gamepad || gamepads[i])) {
  //         const { transform } = pose;
  //         const { position, orientation, matrix } = transform;
  //         if (position) { // new WebXR api
  //           const rawP = localVector.copy(position);
  //           const p = localVector2.copy(rawP).sub(container.position).multiplyScalar(heightFactor);
  //           const q = localQuaternion.copy(orientation);
  //           const pressed = gamepad.buttons[0].pressed;
  //           const lastPressed = lastPresseds[i];
  //           const pointer = gamepad.buttons[0].value;
  //           const grip = gamepad.buttons[1].value;
  //           const pad = gamepad.axes[1] <= -0.5 || gamepad.axes[3] <= -0.5;
  //           const padX = gamepad.axes[0] !== 0 ? gamepad.axes[0] : gamepad.axes[2];
  //           const padY = gamepad.axes[1] !== 0 ? gamepad.axes[1] : gamepad.axes[3];
  //           const stick = !!gamepad.buttons[3] && gamepad.buttons[3].pressed;
  //           const a = !!gamepad.buttons[4] && gamepad.buttons[4].pressed;
  //           const b = !!gamepad.buttons[5] && gamepad.buttons[5].pressed;
  //           const lastB = lastBs[i];
  //           return {
  //             rawPosition: rawP,
  //             position: p,
  //             quaternion: q,
  //             pressed,
  //             lastPressed,
  //             pointer,
  //             grip,
  //             pad,
  //             padX,
  //             padY,
  //             stick,
  //             a,
  //             b,
  //             lastB,
  //           };
  //         } else if (matrix) { // old WebXR api
  //           const rawP = localVector;
  //           const p = localVector2;
  //           const q = localQuaternion;
  //           const s = localVector3;
  //           localMatrix
  //             .fromArray(transform.matrix)
  //             .decompose(rawP, q, s);
  //           p.copy(rawP).sub(container.position).multiplyScalar(heightFactor);
  //           const pressed = gamepad.buttons[0].pressed;
  //           const lastPressed = lastPresseds[i];
  //           const pointer = gamepad.buttons[0].value;
  //           const grip = gamepad.buttons[1].value;
  //           const pad = gamepad.axes[1] <= -0.5 || gamepad.axes[3] <= -0.5;
  //           const padX = gamepad.axes[0] !== 0 ? gamepad.axes[0] : gamepad.axes[2];
  //           const padY = gamepad.axes[1] !== 0 ? gamepad.axes[1] : gamepad.axes[3];
  //           const stick = !!gamepad.buttons[3] && gamepad.buttons[3].pressed;
  //           const a = !!gamepad.buttons[4] && gamepad.buttons[4].pressed;
  //           const b = !!gamepad.buttons[5] && gamepad.buttons[5].pressed;
  //           const lastB = lastBs[i];
  //           return {
  //             rawPosition: rawP,
  //             position: p,
  //             quaternion: q,
  //             pressed,
  //             lastPressed,
  //             pointer,
  //             grip,
  //             pad,
  //             padX,
  //             padY,
  //             stick,
  //             a,
  //             b,
  //             lastB,
  //           };
  //         } else {
  //           return null;
  //         }
  //       } else {
  //         return null;
  //       }
  //     };
  //     const _updateTeleportMesh = (i, pad, lastPad, position, quaternion, padX, padY, stick) => {
  //       const teleportMesh = teleportMeshes[i];
  //       teleportMesh.visible = false;

  //       if (pad) {
  //         localVector.copy(vrCamera.position).applyMatrix4(localMatrix.getInverse(container.matrix));
  //         localEuler.setFromQuaternion(quaternion, 'YXZ');

  //         for (let i = 0; i < 20; i++, localVector.add(localVector2), localEuler.x = Math.max(localEuler.x - Math.PI * 0.07, -Math.PI / 2)) {
  //           localRay.set(localVector, localVector2.set(0, 0, -1).applyQuaternion(localQuaternion.setFromEuler(localEuler)));
  //           const intersection = localRay.intersectPlane(floorPlane, localVector3);
  //           if (intersection && intersection.distanceTo(localRay.origin) <= 1) {
  //             teleportMesh.position.copy(intersection);
  //             localEuler.setFromQuaternion(localQuaternion, 'YXZ');
  //             localEuler.x = 0;
  //             localEuler.z = 0;
  //             teleportMesh.quaternion.setFromEuler(localEuler);
  //             teleportMesh.visible = true;
  //             break;
  //           }
  //         }
  //       } else if (lastPad) {
  //         localVector.copy(teleportMesh.position).applyMatrix4(container.matrix).sub(vrCamera.position);
  //         localVector.y = 0;
  //         container.position.sub(localVector);
  //       }

  //       if (padX !== 0 || padY !== 0) {
  //         localVector.set(padX, 0, padY);
  //         const moveLength = localVector.length();
  //         if (moveLength > 1) {
  //           localVector.divideScalar(moveLength);
  //         }
  //         const hmdEuler = localEuler.setFromQuaternion(rig.inputs.hmd.quaternion, 'YXZ');
  //         localEuler.x = 0;
  //         localEuler.z = 0;
  //         container.position.sub(localVector.multiplyScalar(walkSpeed * timeDiff * (stick ? 3 : 1) * rig.height).applyEuler(hmdEuler));
  //       }
  //     };

  //     const wasLastBd = lastBs[0] && lastBs[1];

  //     const lg = _getGamepad(1);
  //     let li = -1;
  //     if (lg) {
  //       const { rawPosition, position, quaternion, pressed, lastPressed, pointer, grip, pad, b } = lg;
  //       rig.inputs.leftGamepad.quaternion.copy(quaternion);
  //       rig.inputs.leftGamepad.position.copy(position);
  //       rig.inputs.leftGamepad.pointer = pointer;
  //       rig.inputs.leftGamepad.grip = grip;

  //       li = mirrorMesh.getButtonIntersectionIndex(position);
  //       if (pressed && !lastPressed) {
  //         if (li !== -1) {
  //           aAvatars[li].click();
  //         }
  //       }

  //       _updateTeleportMesh(0, pad, lastPads[0], position, quaternion, 0, 0, false);

  //       lastPresseds[0] = pressed;
  //       lastPads[0] = pad;
  //       lastBs[0] = b;
  //       lastPositions[0].copy(rawPosition);
  //     }
  //     const rg = _getGamepad(0);
  //     let ri = -1;
  //     if (rg) {
  //       const { rawPosition, position, quaternion, pressed, lastPressed, pointer, grip, pad, padX, padY, stick, b } = rg;
  //       rig.inputs.rightGamepad.quaternion.copy(quaternion);
  //       rig.inputs.rightGamepad.position.copy(position);
  //       rig.inputs.rightGamepad.pointer = pointer;
  //       rig.inputs.rightGamepad.grip = grip;

  //       ri = mirrorMesh.getButtonIntersectionIndex(position);
  //       if (pressed && !lastPressed) {
  //         if (ri !== -1) {
  //           aAvatars[ri].click();
  //         }
  //       }

  //       _updateTeleportMesh(1, false, false, position, quaternion, padX, padY, stick);

  //       lastPresseds[1] = pressed;
  //       lastPads[1] = pad;
  //       lastBs[1] = b;
  //       lastPositions[1].copy(rawPosition);
  //     }

  //     const _startScale = () => {
  //       for (let i = 0; i < startGripPositions.length; i++) {
  //         startGripPositions[i].copy(lastPositions[i]);
  //       }
  //       startSceneMatrix.copy(container.matrix);
  //       startModelScale = rig ? rig.inputs.hmd.scaleFactor : 1;
  //     };
  //     const _processScale = () => {
  //       const startDistance = startGripPositions[0].distanceTo(startGripPositions[1]);
  //       const currentDistance = lastPositions[0].distanceTo(lastPositions[1]);
  //       const scaleFactor = currentDistance / startDistance;

  //       let startGripPosition = localVector3.copy(startGripPositions[0]).add(startGripPositions[1]).divideScalar(2)
  //       let currentGripPosition = localVector4.copy(lastPositions[0]).add(lastPositions[1]).divideScalar(2)
  //       startGripPosition.applyMatrix4(localMatrix.getInverse(startSceneMatrix));
  //       currentGripPosition.applyMatrix4(localMatrix/*.getInverse(startSceneMatrix)*/);

  //       const positionDiff = localVector5.copy(currentGripPosition).sub(startGripPosition);

  //       container.matrix.copy(startSceneMatrix)
  //         .multiply(localMatrix.makeTranslation(currentGripPosition.x, currentGripPosition.y, currentGripPosition.z))
  //         .multiply(localMatrix.makeScale(scaleFactor, scaleFactor, scaleFactor))
  //         .multiply(localMatrix.makeTranslation(-currentGripPosition.x, -currentGripPosition.y, -currentGripPosition.z))
  //         .multiply(localMatrix.makeTranslation(positionDiff.x, positionDiff.y, positionDiff.z))
  //         .decompose(container.position, container.quaternion, container.scale);

  //       if (rig) {
  //         rig.inputs.hmd.scaleFactor = startModelScale / scaleFactor;
  //       }

  //       // _startScale();
  //     };
  //     const isLastBd = lastBs[0] && lastBs[1];
  //     if (!wasLastBd && isLastBd) {
  //       _startScale();
  //     } else if (isLastBd) {
  //       _processScale();
  //     }

  //     for (let i = 0; i < mirrorMesh.buttonMeshes.length; i++) {
  //       mirrorMesh.buttonMeshes[i].material.color.setHex((i === li || i === ri) ? colors.highlight : colors.normal);
  //     }

  //     rig.update();
  //   } else if (controlsBound) {
  //     // defer
  //   } else {
  //     const positionOffset = Math.sin((realDateNow() % 10000) / 10000 * Math.PI * 2) * 2;
  //     const positionOffset2 = -Math.sin((realDateNow() % 5000) / 5000 * Math.PI * 2) * 1;
  //     const standFactor = rig.height - 0.1 * rig.height + Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * 0.2 * rig.height;
  //     const rotationAngle = (realDateNow() % 5000) / 5000 * Math.PI * 2;

  //     // rig.inputs.hmd.position.set(positionOffset, 0.6 + standFactor, 0);
  //     rig.inputs.hmd.position.set(positionOffset, standFactor, positionOffset2);
  //     rig.inputs.hmd.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle)
  //       .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * Math.PI * 0.2))
  //       .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * Math.PI * 0.25));

  //     rig.inputs.rightGamepad.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle)
  //     // .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin((realDateNow()%5000)/5000*Math.PI*2)*Math.PI*0.6));
  //     rig.inputs.rightGamepad.position.set(positionOffset, rig.height * 0.7 + Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * 0.1, positionOffset2).add(
  //       new THREE.Vector3(-rig.shoulderWidth / 2, 0, -0.2).applyQuaternion(rig.inputs.rightGamepad.quaternion)
  //     )/*.add(
  //       new THREE.Vector3(-0.1, 0, -1).normalize().multiplyScalar(rig.rightArmLength*0.4).applyQuaternion(rig.inputs.rightGamepad.quaternion)
  //     ); */
  //     rig.inputs.leftGamepad.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
  //     rig.inputs.leftGamepad.position.set(positionOffset, rig.height * 0.7, positionOffset2).add(
  //       new THREE.Vector3(rig.shoulderWidth / 2, 0, -0.2).applyQuaternion(rig.inputs.leftGamepad.quaternion)
  //     )/*.add(
  //       new THREE.Vector3(0.1, 0, -1).normalize().multiplyScalar(rig.leftArmLength*0.4).applyQuaternion(rig.inputs.leftGamepad.quaternion)
  //     );*/

  //     rig.inputs.leftGamepad.pointer = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;
  //     rig.inputs.leftGamepad.grip = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;

  //     rig.inputs.rightGamepad.pointer = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;
  //     rig.inputs.rightGamepad.grip = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;

  //     rig.update();
  //   }
}