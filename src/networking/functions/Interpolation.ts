import { Quat, State, Snapshot, InterpolatedSnapshot, Time, Value, Entity } from "../types/SnapshotDataTypes"
import { NetworkInterpolation } from "../components/NetworkInterpolation"

const PI = 3.14159265359
const PI_TIMES_TWO = 6.28318530718

function snapshot() {
  return {
    /** Create the snapshot on the server. */
    create: (state: State | { [key: string]: State }): Snapshot => CreateSnapshot(state),
    /** Add the snapshot you received from the server to automatically calculate the interpolation with calcInterpolation() */
    add: (snapshot: Snapshot): void => addSnapshot(snapshot)
  }
}

/** Create a new Snapshot */
function CreateSnapshot(state: State | { [key: string]: State }): Snapshot {
  const check = (state: State) => {
    // check if state is an array
    if (!Array.isArray(state)) throw new Error("You have to pass an Array to createSnapshot()")

    // check if each entity has an id
    const withoutID = state.filter(e => typeof e.id !== "string" && typeof e.id !== "number")
    //console.log(withoutID)
    if (withoutID.length > 0) throw new Error("Each Entity needs to have a id")
  }

  if (Array.isArray(state)) {
    check(state)
  } else {
    Object.keys(state).forEach(key => {
      check(state[key])
    })
  }

  return {
    id: NewId(),
    time: Now(),
    state: state
  }
}

function addSnapshot(snapshot: Snapshot): void {
  if (NetworkInterpolation.instance.timeOffset === -1) {
    // the time offset between server and client is calculated,
    // by subtracting the current client date from the server time of the
    // first snapshot
    NetworkInterpolation.instance.timeOffset = Now() - snapshot.time
  }

  NetworkInterpolation.instance.add(snapshot)
}

/** Interpolate between two snapshots give the percentage or time. */
function interpolate(snapshotA: Snapshot, snapshotB: Snapshot, timeOrPercentage: number, parameters: string, deep = ""): InterpolatedSnapshot {
  return _interpolate(snapshotA, snapshotB, timeOrPercentage, parameters, deep)
}

function _interpolate(snapshotA: Snapshot, snapshotB: Snapshot, timeOrPercentage: number, parameters: string, deep: string): InterpolatedSnapshot {
  const sorted = [snapshotA, snapshotB].sort((a, b) => b.time - a.time)
  const params = parameters
    .trim()
    .replace(/\W+/, " ")
    .split(" ")

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
    if (typeof start === "undefined" || typeof end === "undefined") return

    if (typeof start === "string" || typeof end === "string") throw new Error(`Can't interpolate string!`)

    if (typeof start === "number" && typeof end === "number") {
      if (method === "linear") return lerp(start, end, t)
      else if (method === "deg") return degreeLerp(start, end, t)
      else if (method === "rad") return radianLerp(start, end, t)
    }

    if (typeof start === "object" && typeof end === "object") {
      if (method === "quat") return quatSlerp(start, end, t)
    }

    throw new Error(`No lerp method "${method}" found!`)
  }

  if (!Array.isArray(newer.state) && deep === "") throw new Error('You forgot to add the "deep" parameter.')

  if (Array.isArray(newer.state) && deep !== "") throw new Error('No "deep" needed it state is an array.')

  const newerState: State = Array.isArray(newer.state) ? newer.state : newer.state[deep]
  const olderState: State = Array.isArray(older.state) ? older.state : older.state[deep]

  const tmpSnapshot: Snapshot = JSON.parse(JSON.stringify({ ...newer, state: newerState }))

  newerState.forEach((e: Entity, i: number) => {
    const id = e.id
    const other: Entity | undefined = olderState.find((e: any) => e.id === id)
    if (!other) return

    params.forEach(p => {
      // TODO yandeu: improve this code
      const match = p.match(/\w\(([\w]+)\)/)
      const lerpMethod = match ? match?.[1] : "linear"
      if (match) p = match?.[0].replace(/\([\S]+$/gm, "")

      const p0 = e?.[p]
      const p1 = other?.[p]

      const pn = lerpFnc(lerpMethod, p1, p0, pPercent)
      if (Array.isArray(tmpSnapshot.state)) tmpSnapshot.state[i][p] = pn
    })
  })

  const interpolatedSnapshot: InterpolatedSnapshot = {
    state: tmpSnapshot.state as State,
    percentage: pPercent,
    newer: newer.id,
    older: older.id
  }

  return interpolatedSnapshot
}

/** Get the current time in milliseconds. */
function Now() {
  return Date.now() // - Date.parse('01 Jan 2020')
}

/** Create a new ID */
function NewId() {
  return Math.random()
    .toString(36)
    .substr(2, 6)
}

/** Get the calculated interpolation on the client. */
function calcInterpolation(parameters: string, deep = ""): InterpolatedSnapshot | undefined {
  // get the snapshots [_interpolationBuffer] ago
  const serverTime = Now() - NetworkInterpolation.instance.timeOffset - NetworkInterpolation.instance._interpolationBuffer

  const shots = NetworkInterpolation.instance.get(serverTime)
  if (!shots) return

  const { older, newer } = shots
  if (!older || !newer) return

  return _interpolate(newer, older, serverTime, parameters, deep)
}

export const lerp = (start: number, end: number, t: number) => {
  return start + (end - start) * t
}

// https://gist.github.com/itsmrpeck/be41d72e9d4c72d2236de687f6f53974
export const degreeLerp = (start: number, end: number, t: number) => {
  let result
  const diff = end - start
  if (diff < -180) {
    // lerp upwards past 360
    end += 360
    result = lerp(start, end, t)
    if (result >= 360) {
      result -= 360
    }
  } else if (diff > 180) {
    // lerp downwards past 0
    end -= 360
    result = lerp(start, end, t)
    if (result < 0) {
      result += 360
    }
  } else {
    // straight lerp
    result = lerp(start, end, t)
  }

  return result
}

// https://gist.github.com/itsmrpeck/be41d72e9d4c72d2236de687f6f53974
export const radianLerp = (start: number, end: number, t: number) => {
  let result
  const diff = end - start
  if (diff < -PI) {
    // lerp upwards past PI_TIMES_TWO
    end += PI_TIMES_TWO
    result = lerp(start, end, t)
    if (result >= PI_TIMES_TWO) {
      result -= PI_TIMES_TWO
    }
  } else if (diff > PI) {
    // lerp downwards past 0
    end -= PI_TIMES_TWO
    result = lerp(start, end, t)
    if (result < 0) {
      result += PI_TIMES_TWO
    }
  } else {
    // straight lerp
    result = lerp(start, end, t)
  }

  return result
}

// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
export const quatSlerp = (qa: Quat, qb: Quat, t: number) => {
  // quaternion to return
  const qm: Quat = { x: 0, y: 0, z: 0, w: 1 }
  // Calculate angle between them.
  const cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z
  // if qa=qb or qa=-qb then theta = 0 and we can return qa
  if (Math.abs(cosHalfTheta) >= 1.0) {
    qm.w = qa.w
    qm.x = qa.x
    qm.y = qa.y
    qm.z = qa.z
    return qm
  }
  // Calculate temporary values.
  const halfTheta = Math.acos(cosHalfTheta)
  const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta)
  // if theta = 180 degrees then result is not fully defined
  // we could rotate around any axis normal to qa or qb
  if (Math.abs(sinHalfTheta) < 0.001) {
    qm.w = qa.w * 0.5 + qb.w * 0.5
    qm.x = qa.x * 0.5 + qb.x * 0.5
    qm.y = qa.y * 0.5 + qb.y * 0.5
    qm.z = qa.z * 0.5 + qb.z * 0.5
    return qm
  }
  const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta
  const ratioB = Math.sin(t * halfTheta) / sinHalfTheta
  //calculate Quaternion.
  qm.w = qa.w * ratioA + qb.w * ratioB
  qm.x = qa.x * ratioA + qb.x * ratioB
  qm.y = qa.y * ratioA + qb.y * ratioB
  qm.z = qa.z * ratioA + qb.z * ratioB
  return qm
}
