import { degreeLerp, lerp, quatSlerp, radianLerp } from '../../common/functions/MathLerpFunctions';
import { randomId } from '../../common/functions/MathRandomFunctions';
import { Quat } from '../../networking/types/SnapshotDataTypes';
import { NetworkInterpolation } from '../components/NetworkInterpolation';
import { InterpolatedSnapshot, Snapshot, StateEntityGroup, StateEntity, Time, Value } from '../types/SnapshotDataTypes';

/** Snapshot interpolation functions, based on this library by yandeu
 * https://github.com/geckosio/snapshot-interpolation */

export function snapshot () {
  return {
    /** Create the snapshot on the server. */
    create: (state: StateEntityGroup | { [key: string]: StateEntityGroup }): Snapshot => createSnapshot(state),
    /** Add the snapshot you received from the server to automatically calculate the interpolation with calcInterpolation() */
    add: (snapshot: Snapshot): void => addSnapshot(snapshot)
  };
}


/** Create a new Snapshot */
export function createSnapshot (state: StateEntityGroup | { [key: string]: StateEntityGroup }): Snapshot {
//  console.log("state is");
//  console.log(state);
  const check = (state: StateEntityGroup) => {
    // check if state is an array
    if (!Array.isArray(state)) throw new Error('You have to pass an Array to createSnapshot()');

    // check if each entity has an id
    const withoutID = state.filter(e => typeof e.networkId !== 'string' && typeof e.networkId !== 'number');
    if (withoutID.length > 0) throw new Error('Each Entity needs to have a id');
  };

  if (Array.isArray(state)) {
    check(state);
  } else {
    Object.keys(state).forEach(key => {
      check(state[key]);
    });
  }

  return {
    id: randomId(),
    time: Date.now(),
    state: state
  };
}

export function addSnapshot (snapshot: Snapshot): void {
  if (NetworkInterpolation.instance.timeOffset === -1) {
    // the time offset between server and client is calculated,
    // by subtracting the current client date from the server time of the
    // first snapshot
    NetworkInterpolation.instance.timeOffset = Date.now() - snapshot.time;
  }

  NetworkInterpolation.instance.add(snapshot);
}

export function interpolate (
  snapshotA: Snapshot,
  snapshotB: Snapshot,
  timeOrPercentage: number,
  parameters: string,
  deep: string
): InterpolatedSnapshot {
  const sorted = [snapshotA, snapshotB].sort((a, b) => b.time - a.time);
  const params = parameters
    .trim()
    .replace(/\W+/, ' ')
    .split(' ');

  const newer: Snapshot = sorted[0];
  const older: Snapshot = sorted[1];

  const t0: Time = newer.time;
  const t1: Time = older.time;
  /**
   * If <= it is in percentage
   * else it is the server time
   */
  const tn: number = timeOrPercentage; // serverTime is between t0 and t1

  // THE TIMELINE
  // t = time (serverTime)
  // p = entity position
  // ------ t1 ------ tn --- t0 ----->> NOW
  // ------ p1 ------ pn --- p0 ----->> NOW
  // ------ 0% ------ x% --- 100% --->> NOW
  const zeroPercent = tn - t1;
  const hundredPercent = t0 - t1;
  const pPercent = timeOrPercentage <= 1 ? timeOrPercentage : zeroPercent / hundredPercent;

  NetworkInterpolation.instance.serverTime = lerp(t1, t0, pPercent);

  const lerpFnc = (method: string, start: Value, end: Value, t: number) => {
    if (typeof start === 'undefined' || typeof end === 'undefined') return;

    if (typeof start === 'string' || typeof end === 'string') throw new Error('Can\'t interpolate string!');

    if (typeof start === 'number' && typeof end === 'number') {
      if (method === 'linear') return lerp(start, end, t);
      else if (method === 'deg') return degreeLerp(start, end, t);
      else if (method === 'rad') return radianLerp(start, end, t);
    }

    if (typeof start === 'object' && typeof end === 'object') {
      if (method === 'quat') return quatSlerp(start, end, t);
    }

    throw new Error(`No lerp method "${method}" found!`);
  };

  if (!Array.isArray(newer.state) && deep === '') throw new Error('You forgot to add the "deep" parameter.');

  if (Array.isArray(newer.state) && deep !== '') throw new Error('No "deep" needed it state is an array.');

  const newerState: StateEntityGroup = Array.isArray(newer.state) ? newer.state : newer.state[deep];
  const olderState: StateEntityGroup = Array.isArray(older.state) ? older.state : older.state[deep];

  const tmpSnapshot: Snapshot = JSON.parse(JSON.stringify({ ...newer, state: newerState }));

  newerState.forEach((e: StateEntity, i: number) => {
    const networkId = e.networkId;
    const other: StateEntity | undefined = olderState.find((e: any) => e.networkId === networkId);
    if (!other) return;

    params.forEach(p => {
      const lerpMethod = p == 'quat' ? 'quat' : 'linear';
      if(lerpMethod === 'quat'){

        const p0: Quat = {x: e.qX, y: e.qY, z: e.qZ, w: e.qW };
        const p1: Quat = { x: other.qX, y: other.qY, z: other.qZ, w: other.qW };

        const pn = lerpFnc(lerpMethod, p1, p0, pPercent);

        if (Array.isArray(tmpSnapshot.state)) tmpSnapshot.state[i].qX = pn.x;
        if (Array.isArray(tmpSnapshot.state)) tmpSnapshot.state[i].qY = pn.y;
        if (Array.isArray(tmpSnapshot.state)) tmpSnapshot.state[i].qZ = pn.z;
        if (Array.isArray(tmpSnapshot.state)) tmpSnapshot.state[i].qW = pn.w;

      }
      else {
        const p0 = e?.[p]
        const p1 = other?.[p]

        const pn = lerpFnc(lerpMethod, p1, p0, pPercent)
        if (Array.isArray(tmpSnapshot.state)) tmpSnapshot.state[i][p] = pn
      }
    });
  });

  const interpolatedSnapshot: InterpolatedSnapshot = {
    state: tmpSnapshot.state as StateEntityGroup,
    percentage: pPercent,
    newer: newer.id,
    older: older.id
  };

  return interpolatedSnapshot;
}

/** Get the calculated interpolation on the client. */
export function calculateInterpolation (parameters: string, arrayName = ''): InterpolatedSnapshot | undefined {
  // get the snapshots [_interpolationBuffer] ago
  const serverTime = Date.now() - NetworkInterpolation.instance.timeOffset - NetworkInterpolation.instance._interpolationBuffer;
  const shots = NetworkInterpolation.instance.get(serverTime);
  if (!shots) return;

  const { older, newer } = shots;
  if (!older || !newer) return;

  return interpolate(newer, older, serverTime, parameters, arrayName);
}
