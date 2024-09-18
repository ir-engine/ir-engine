/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

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
  maxSpeed = Infinity
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

/**
 * Create a lerp alpha value that is exponentially smoothed.
 *
 * Smoothing rate dictates the proportion of source remaining after one second.
 *
 * A smoothing rate of zero will give you back the target value (i.e. no smoothing),
 * and a rate of 1 is technically not allowed, but will just give you back the source value (i.e. infinite smoothing)
 *
 * @param smoothness the proportion of source value remaining after one second
 * @param deltaSeconds
 * @returns
 */
export function smootheLerpAlpha(smoothness: number, deltaSeconds: number) {
  return 1 - Math.pow(smoothness, deltaSeconds)
}

/**
 * Smoothstep function between 0 and 1 input and output
 * @param alpha value between 0 and 1
 */
export function smoothStep(alpha: number) {
  return alpha * alpha * (3 - 2 * alpha)
}

/**
 * Smootherstep function between 0 and 1 input and output
 * @param alpha value between 0 and 1
 */
export function smootherStep(alpha: number) {
  return alpha * alpha * alpha * (alpha * (alpha * 6 - 15) + 10)
}
