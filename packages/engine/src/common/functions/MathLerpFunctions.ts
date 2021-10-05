import { PI, TAU } from '../constants/MathConstants'

/**
 * Find Interpolation between 2 number.
 * @param start Number from which to interpolate.
 * @param end Number to which to interpolate.
 * @param t How far to interpolate from start.
 * @returns Interpolation between start and end.
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t
}

/**
 * Find Interpolation between 2 degree angles.
 * @param start Degree from which to interpolate.
 * @param end Degree to which to interpolate.
 * @param t How far to interpolate from start.
 * @returns Interpolation between start and end.
 */
export const degreeLerp = (start: number, end: number, t: number): number => {
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

/**
 * Find Interpolation between 2 radian angles.
 * @param start Radian from which to interpolate.
 * @param end Radian to which to interpolate.
 * @param t How far to interpolate from start.
 * @returns Interpolation between start and end.
 */
export const radianLerp = (start: number, end: number, t: number): number => {
  let result
  const diff = end - start
  if (diff < -PI) {
    // lerp upwards past TAU
    end += TAU
    result = lerp(start, end, t)
    if (result >= TAU) {
      result -= TAU
    }
  } else if (diff > PI) {
    // lerp downwards past 0
    end -= TAU
    result = lerp(start, end, t)
    if (result < 0) {
      result += TAU
    }
  } else {
    // straight lerp
    result = lerp(start, end, t)
  }

  return result
}

type Quat = { x: number; y: number; z: number; w: number }

/**
 * Find Interpolation between 2 quaternion.
 * @param start Quaternion from which to interpolate.
 * @param end Quaternion to which to interpolate.
 * @param t How far to interpolate from start.
 * @returns Interpolation between start and end.
 */
export const quatSlerp = (qa: Quat, qb: Quat, t: number): any => {
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
  // calculate Quaternion.
  qm.w = qa.w * ratioA + qb.w * ratioB
  qm.x = qa.x * ratioA + qb.x * ratioB
  qm.y = qa.y * ratioA + qb.y * ratioB
  qm.z = qa.z * ratioA + qb.z * ratioB
  return qm
}

/**
 * Returns values which will be clamped if goes out of minimum and maximum range.
 * @param value Value to be clamped.
 * @param min Minimum boundary value.
 * @param max Maximum boundary value.
 * @returns Clamped value.
 */
export const clamp = (value: number, min: number, max: number): number => {
  if (value < min) return min
  if (value > max) return max
  return value
}

/**
 * Gradually changes a value towards a desired goal over time.
 * @param current The current position.
 * @param target The position we are trying to reach.
 * @param currentVelocity The current velocity, this value is modified by the function every time you call it.
 * @param smoothTime Approximately the time it will take to reach the target. A smaller value will reach the target faster.
 * @param deltaTime The time since the last call to this function.
 * @param maxSpeed Optionally allows you to clamp the maximum speed.
 * @returns Smoothed interpolation between current and target.
 */
export const smoothDamp = (
  current: number,
  target: number,
  currentVelocity,
  smoothTime: number,
  deltaTime,
  maxSpeed: number = Infinity
) => {
  // Based on Game Programming Gems 4 Chapter 1.10
  smoothTime = Math.max(0.0001, smoothTime)
  let omega = 2 / smoothTime

  let x = omega * deltaTime
  let exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
  let change = current - target
  let originalTo = target

  // Clamp maximum speed
  let maxChange = maxSpeed * smoothTime
  change = Math.min(Math.max(change, -maxChange), maxChange)
  target = current - change

  let temp = (currentVelocity.value + omega * change) * deltaTime
  currentVelocity.value = (currentVelocity.value - omega * temp) * exp
  let output = target + (change + temp) * exp

  // Prevent overshooting
  if (originalTo - current > 0.0 == output > originalTo) {
    output = originalTo
    currentVelocity = (output - originalTo) / deltaTime
  }

  return output
}
