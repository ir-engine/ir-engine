import { degreeLerp, lerp, quatSlerp, radianLerp } from '../../common/functions/MathLerpFunctions'
import { Quat, StateEntityClientGroup } from '../../networking/types/SnapshotDataTypes'
import {
  InterpolatedSnapshot,
  Snapshot,
  StateEntityGroup,
  StateInterEntity,
  StateEntityInterGroup,
  StateEntity,
  Time,
  Value
} from '../types/SnapshotDataTypes'
import { NetworkInterpolation } from '../classes/NetworkInterpolation'
import { Network } from '../classes/Network'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { ClientNetworkStateSystem } from '../systems/ClientNetworkStateSystem'

/** Get snapshot factory.
 * @author HydraFire <github.com/HydraFire>
 */
let _id = 0
export function snapshot(): any {
  return {
    /** Create the snapshot on the server. */
    create: (state: StateEntityGroup): Snapshot => createSnapshot(state),
    /** Add the snapshot you received from the server to automatically calculate the interpolation with calcInterpolation() */
    add: (snapshot: Snapshot): void => addSnapshot(snapshot)
  }
}
/**
 * Create a new Snapshot.
 * @param state State of the world or client to be stored in this snapshot.
 * @returns Newly created snapshot.
 */
export function createSnapshot(state: StateEntityClientGroup): Snapshot {
  //  console.log("state is");
  //  console.log(state);
  const check = (state: StateEntityClientGroup) => {
    // check if state is an array
    if (!Array.isArray(state)) throw new Error('You have to pass an Array to createSnapshot()')

    // check if each entity has an id
    const withoutID = state.filter((e) => typeof e.networkId !== 'number')
    if (withoutID.length > 0) throw new Error('Each Entity needs to have a id')
  }

  check(state)

  return {
    id: '' + _id++,
    time: Date.now(),
    //@ts-ignore
    state: state,
    timeCorrection: 0
  }
}

/**
 * Add snapshot into vault.
 * @param snapshot Snapshot to be added into the vault.
 */
export function addSnapshot(snapshot: Snapshot): void {
  //  let checkT = NetworkInterpolation.instance.checkCount;
  // the time offset between server and client is calculated,
  // by subtracting the current client date from the server time of the
  // first snapshot
  if (NetworkInterpolation.instance.checkCount != snapshot.time) {
    const io = Date.now() - snapshot.time
    const tr = io % NetworkInterpolation.instance._interpolationBuffer
    if (io - tr > NetworkInterpolation.instance.timeOffset) {
      NetworkInterpolation.instance.timeOffset = io - tr
      NetworkInterpolation.instance.checkDelay = 0
    } else if (NetworkInterpolation.instance.checkDelay > 500) {
      NetworkInterpolation.instance.timeOffset = io - tr
      NetworkInterpolation.instance.checkDelay = 0
    } else {
      NetworkInterpolation.instance.checkDelay += 1
    }
    NetworkInterpolation.instance.checkCount = snapshot.time
    NetworkInterpolation.instance.add(snapshot)
  }

  /* FASTER

  if( NetworkInterpolation.instance.checkCount != snapshot.time ) {
    let io = Date.now() - snapshot.time;
    let tr = io%NetworkInterpolation.instance._interpolationBuffer;
    if (io - tr < NetworkInterpolation.instance.timeOffset) {
      NetworkInterpolation.instance.timeOffset = io - tr;
      NetworkInterpolation.instance.checkDelay = 0;
    } else if (NetworkInterpolation.instance.checkDelay > 500) {
      NetworkInterpolation.instance.timeOffset = io - tr;
      NetworkInterpolation.instance.checkDelay = 0;
    } else {
      NetworkInterpolation.instance.checkDelay += 1;
    }
    NetworkInterpolation.instance.checkCount = snapshot.time;
    NetworkInterpolation.instance.add(snapshot);
  }
*/

  //  console.warn(NetworkInterpolation.instance.timeOffset+' '+(Date.now() - snapshot.time));
}

/**
 * Interpolate between two snapshots.
 * @param snapshotA First snapshot to interpolate from.
 * @param snapshotB Second snapshot to interpolate to.
 * @param timeOrPercentage How far to interpolate from first snapshot.
 * @param parameters On which param interpolation should be applied.
 * @param deep
 *
 * @returns Interpolated snapshot.
 */
export function interpolate(
  snapshotA: Snapshot,
  snapshotB: Snapshot,
  timeOrPercentage: number,
  parameters: string,
  deep: string
): InterpolatedSnapshot {
  const sorted = [snapshotA, snapshotB].sort((a, b) => b.time - a.time)
  const params = parameters.trim().replace(/\W+/, ' ').split(' ')

  const newer: Snapshot = sorted[0]
  const older: Snapshot = sorted[1]

  const t0: Time = newer.time
  const t1: Time = older.time
  /**
   * If <= it is in percentage
   * else it is the server time
   */
  const tn: number = timeOrPercentage // serverTime is between t0 and t1

  // THE TIMELINE
  // t = time (serverTime)
  // p = entity position
  // ------ t1 ------ tn --- t0 ----->> NOW
  // ------ p1 ------ pn --- p0 ----->> NOW
  // ------ 0% ------ x% --- 100% --->> NOW
  const zeroPercent = tn - t1
  const hundredPercent = t0 - t1
  const pPercent = timeOrPercentage <= 1 ? timeOrPercentage : zeroPercent / hundredPercent

  NetworkInterpolation.instance.serverTime = lerp(t1, t0, pPercent)

  const lerpFnc = (method: string, start: Value, end: Value, t: number) => {
    if (typeof start === 'undefined' || typeof end === 'undefined') return

    if (typeof start === 'string' || typeof end === 'string') throw new Error("Can't interpolate string!")

    if (typeof start === 'number' && typeof end === 'number') {
      if (method === 'linear') return lerp(start, end, t)
      else if (method === 'deg') return degreeLerp(start, end, t)
      else if (method === 'rad') return radianLerp(start, end, t)
    }

    if (typeof start === 'object' && typeof end === 'object') {
      if (method === 'quat') return quatSlerp(start, end, t)
    }

    throw new Error(`No lerp method "${method}" found!`)
  }

  if (!Array.isArray(newer.state) && deep === '') throw new Error('You forgot to add the "deep" parameter.')

  if (Array.isArray(newer.state) && deep !== '') throw new Error('No "deep" needed it state is an array.')

  const newerState: StateEntityGroup = Array.isArray(newer.state) ? newer.state : newer.state[deep]
  const olderState: StateEntityGroup = Array.isArray(older.state) ? older.state : older.state[deep]

  const tmpSnapshot: Snapshot = JSON.parse(JSON.stringify({ ...newer, state: newerState }))

  newerState.forEach((e: StateEntity, i: number) => {
    const other: StateEntity | undefined = olderState.find((f: any) => f.networkId === e.networkId)
    if (e.networkId == Network.instance.localAvatarNetworkId) return
    if (!other) return

    params.forEach((p) => {
      if (p === 'quat') {
        const q0: Quat = { x: e.qX, y: e.qY, z: e.qZ, w: e.qW }
        const q1: Quat = { x: other.qX, y: other.qY, z: other.qZ, w: other.qW }
        const qn = lerpFnc('quat', q1, q0, pPercent)

        const qx = qn.x * -1
        const qy = qn.y * -1
        const qz = qn.z * -1
        const qw = qn.w

        const p0x = e.x
        const p0y = e.y
        const p0z = e.z

        const p1x = other.x
        const p1y = other.y
        const p1z = other.z

        const pnx = lerpFnc('linear', p1x, p0x, pPercent)
        const pny = lerpFnc('linear', p1y, p0y, pPercent)
        const pnz = lerpFnc('linear', p1z, p0z, pPercent)

        let x = e.x - pnx
        let y = e.y - pny
        let z = e.z - pnz

        //  let speed = (Math.sqrt(x*x + y*y + z*z)*60) / (t0 - tn);

        x = (x * 16.7) / (t0 - tn)
        y = (y * 16.7) / (t0 - tn)
        z = (z * 16.7) / (t0 - tn)

        //console.warn(speed);
        /*
        if (speed < 0.001) {
          x = 0;
          y = 0;
          z = 0;
        }
        */
        // normalize
        /*
        const scalar = 1 / (Math.sqrt(x*x + y*y + z*z) || 1);
        x *= scalar;
        y *= scalar;
        z *= scalar;
        */
        // applyQuaternion
        const ix = qw * x + qy * z - qz * y
        const iy = qw * y + qz * x - qx * z
        const iz = qw * z + qx * y - qy * x
        const iw = -qx * x - qy * y - qz * z
        x = ix * qw + iw * -qx + iy * -qz - iz * -qy
        y = iy * qw + iw * -qy + iz * -qx - ix * -qz
        z = iz * qw + iw * -qz + ix * -qy - iy * -qx
        // add to snaphot
        if (Array.isArray(tmpSnapshot.state)) {
          tmpSnapshot.state[i].x = pnx
          tmpSnapshot.state[i].y = pny
          tmpSnapshot.state[i].z = pnz

          tmpSnapshot.state[i].qX = qn.x
          tmpSnapshot.state[i].qY = qn.y
          tmpSnapshot.state[i].qZ = qn.z
          tmpSnapshot.state[i].qW = qn.w
          ;(tmpSnapshot.state[i] as StateInterEntity).vX = x
          ;(tmpSnapshot.state[i] as StateInterEntity).vY = y
          ;(tmpSnapshot.state[i] as StateInterEntity).vZ = z

          //  tmpSnapshot.state[i].speed = speed
        }
      }
    })
  })

  const interpolatedSnapshot: InterpolatedSnapshot = {
    state: tmpSnapshot.state as StateEntityInterGroup,
    percentage: pPercent,
    newer: newer.id,
    older: older.id
  }

  return interpolatedSnapshot
}

/**
 * Get the calculated interpolation on the client.
 * @param parameters On which param interpolation should be applied.
 * @param arrayName
 *
 * @returns Interpolated snapshot.
 */
let hasLostConnection = true
export function calculateInterpolation(parameters: string, arrayName = ''): InterpolatedSnapshot {
  // get the snapshots [_interpolationBuffer] ago
  const serverTime =
    Date.now() - NetworkInterpolation.instance.timeOffset - NetworkInterpolation.instance._interpolationBuffer
  // protection from going back in time during a ping jump
  //  serverTime < NetworkInterpolation.instance.serverTimePrev ? serverTime = NetworkInterpolation.instance.serverTimePrev:'';
  //console.warn((Date.now() - serverTime) / 1000);
  // find snapshots between which our time goes
  const shots = NetworkInterpolation.instance.get(serverTime)
  if (!shots) {
    console.log('Skipping network interpolation, are you lagging or disconnected?')
    EngineEvents.instance.dispatchEvent({
      type: EngineEvents.EVENTS.CONNECTION_LOST,
      hasLostConnection: true
    })
    hasLostConnection = true
    return
  }
  if (hasLostConnection) {
    hasLostConnection = false
    EngineEvents.instance.dispatchEvent({
      type: EngineEvents.EVENTS.CONNECTION_LOST,
      hasLostConnection: false
    })
  }
  const { older, newer } = shots
  if (!older || !newer) return
  // we record the time of the snapshots that we managed to get

  //NetworkInterpolation.instance.serverTimePrev = serverTime;
  return interpolate(newer, older, serverTime, parameters, arrayName)
}
