/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Matrix4, Quaternion, Vector3 } from 'three'

export class DualQuaternion {
  real = new Quaternion(0, 0, 0, 1)
  dual = new Quaternion(0, 0, 0, 0)

  /**
   * Creates a new DualQuaternion initialized with values from an existing quaternion
   */
  clone() {
    return new DualQuaternion().copy(this)
  }

  /**
   * Copy the values from another DualQuaternion to this one
   */
  copy(dq: DualQuaternion) {
    this.real.x = dq.real.x
    this.real.y = dq.real.y
    this.real.z = dq.real.z
    this.real.w = dq.real.w
    this.dual.x = dq.dual.x
    this.dual.y = dq.dual.y
    this.dual.z = dq.dual.z
    this.dual.w = dq.dual.w
    return this
  }

  /**
   * Sets the dual quaternion from an XR pose
   */
  makeFromXRPose(pose: XRPose) {
    return this.makeFromRotationTranslation(pose.transform.orientation, pose.transform.position)
  }

  /**
   * Creates a dual quaternion from a normalized quaternion and a translation
   */
  makeFromRotationTranslation(q: Quaternion | DOMPointReadOnly, t: Vector3 | DOMPointReadOnly) {
    const qx = q.x
    const qy = q.y
    const qz = q.z
    const qw = q.w
    const tx = t.x * 0.5
    const ty = t.y * 0.5
    const tz = t.z * 0.5
    this.real.x = qx
    this.real.y = qy
    this.real.z = qz
    this.real.w = qw
    this.dual.x = tx * qw + ty * qz - tz * qy
    this.dual.y = ty * qw + tz * qx - tx * qz
    this.dual.z = tz * qw + tx * qy - ty * qx
    this.dual.w = -tx * qx - ty * qy - tz * qz
    return this
  }

  /**
   * Sets the dual quaternion from a translation
   */
  makeFromTranslation(t: Vector3 | DOMPointReadOnly) {
    this.real.x = 0
    this.real.y = 0
    this.real.z = 0
    this.real.w = 1
    this.dual.x = t.x * 0.5
    this.dual.y = t.y * 0.5
    this.dual.z = t.z * 0.5
    this.dual.w = 0
    return this
  }

  /**
   * Sets the dual quaternion from a rotation
   */
  makeFromMatrix4(m: Matrix4) {
    _rotMat.extractRotation(m)
    _rotation.setFromRotationMatrix(_rotMat)
    _translation.setFromMatrixPosition(m)
    return this.makeFromRotationTranslation(_rotation, _translation)
  }

  identity() {
    this.real.x = 0
    this.real.y = 0
    this.real.z = 0
    this.real.w = 1
    this.dual.x = 0
    this.dual.y = 0
    this.dual.z = 0
    this.dual.w = 0
    return this
  }

  getRotation(out: Quaternion) {
    out.x = this.real.x
    out.y = this.real.y
    out.z = this.real.z
    out.w = this.real.w
    return out
  }

  getTranslation(out: Vector3) {
    const ax = this.dual.x
    const ay = this.dual.y
    const az = this.dual.z
    const aw = this.dual.w
    const bx = -this.real.x
    const by = -this.real.y
    const bz = -this.real.z
    const bw = this.real.w
    out.x = (ax * bw + aw * bx + ay * bz - az * by) * 2
    out.y = (ay * bw + aw * by + az * bx - ax * bz) * 2
    out.z = (az * bw + aw * bz + ax * by - ay * bx) * 2
    return out
  }

  getMatrix4(out: Matrix4) {
    const rotation = this.getRotation(_rotation)
    const translation = this.getTranslation(_translation)
    return out.makeRotationFromQuaternion(rotation).setPosition(translation)
  }

  translate(t: Vector3) {
    const ax = this.real.x
    const ay = this.real.y
    const az = this.real.z
    const aw = this.real.w
    const bx = t.x * 0.5
    const by = t.y * 0.5
    const bz = t.z * 0.5
    const ax2 = this.dual.x
    const ay2 = this.dual.y
    const az2 = this.dual.z
    const aw2 = this.dual.w
    this.real.x = ax
    this.real.y = ay
    this.real.z = az
    this.real.w = aw
    this.dual.x = aw * bx + ay * bz - az * by + ax2
    this.dual.y = aw * by + az * bx - ax * bz + ay2
    this.dual.z = aw * bz + ax * by - ay * bx + az2
    this.dual.w = -ax * bx - ay * by - az * bz + aw2
    return this
  }

  rotate(q: Quaternion) {
    const ax = this.real.x
    const ay = this.real.y
    const az = this.real.z
    const aw = this.real.w
    const ax2 = this.dual.x
    const ay2 = this.dual.y
    const az2 = this.dual.z
    const aw2 = this.dual.w
    const bx = q.x
    const by = q.y
    const bz = q.z
    const bw = q.w
    this.real.x = ax * bw + aw * bx + ay * bz - az * by
    this.real.y = ay * bw + aw * by + az * bx - ax * bz
    this.real.z = az * bw + aw * bz + ax * by - ay * bx
    this.real.w = aw * bw - ax * bx - ay * by - az * bz
    this.dual.x = ax2 * bw + aw2 * bx + ay2 * bz - az2 * by
    this.dual.y = ay2 * bw + aw2 * by + az2 * bx - ax2 * bz
    this.dual.z = az2 * bw + aw2 * bz + ax2 * by - ay2 * bx
    this.dual.w = aw2 * bw - ax2 * bx - ay2 * by - az2 * bz
    return this
  }

  prerotate(q: Quaternion) {
    const ax = this.real.x
    const ay = this.real.y
    const az = this.real.z
    const aw = this.real.w
    const ax2 = this.dual.x
    const ay2 = this.dual.y
    const az2 = this.dual.z
    const aw2 = this.dual.w
    const bx = q.x
    const by = q.y
    const bz = q.z
    const bw = q.w
    this.real.x = bx * aw + bw * ax + by * az - bz * ay
    this.real.y = by * aw + bw * ay + bz * ax - bx * az
    this.real.z = bz * aw + bw * az + bx * ay - by * ax
    this.real.w = bw * aw - bx * ax - by * ay - bz * az
    this.dual.x = bx * aw2 + bw * ax2 + by * az2 - bz * ay2
    this.dual.y = by * aw2 + bw * ay2 + bz * ax2 - bx * az2
    this.dual.z = bz * aw2 + bw * az2 + bx * ay2 - by * ax2
    this.dual.w = bw * aw2 - bx * ax2 - by * ay2 - bz * az2
    return this
  }

  /**
   * Rotates the dual quaternion around the given axis by the given angle.
   * The axis must be normalized.
   */
  rotateAroundAxis(axis: Vector3, rad: number) {
    //Special case for rad = 0
    if (Math.abs(rad) < 1e-8) {
      return this
    }
    rad = rad * 0.5
    const s = Math.sin(rad)
    const bx = s * axis.x
    const by = s * axis.y
    const bz = s * axis.z
    const bw = Math.cos(rad)
    const ax1 = this.real.x
    const ay1 = this.real.y
    const az1 = this.real.z
    const aw1 = this.real.w
    const ax2 = this.dual.x
    const ay2 = this.dual.y
    const az2 = this.dual.z
    const aw2 = this.dual.w
    this.real.x = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by
    this.real.y = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz
    this.real.z = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx
    this.real.w = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz
    this.dual.x = ax2 * bw + aw2 * bx + ay2 * bz - az2 * by
    this.dual.y = ay2 * bw + aw2 * by + az2 * bx - ax2 * bz
    this.dual.z = az2 * bw + aw2 * bz + ax2 * by - ay2 * bx
    this.dual.w = aw2 * bw - ax2 * bx - ay2 * by - az2 * bz
    return this
  }

  multiply(b: DualQuaternion) {
    const ax0 = this.real.x
    const ay0 = this.real.y
    const az0 = this.real.z
    const aw0 = this.real.w
    const bx1 = b.dual.x
    const by1 = b.dual.y
    const bz1 = b.dual.z
    const bw1 = b.dual.w
    const ax1 = this.dual.x
    const ay1 = this.dual.y
    const az1 = this.dual.z
    const aw1 = this.dual.w
    const bx0 = b.real.x
    const by0 = b.real.y
    const bz0 = b.real.z
    const bw0 = b.real.w

    this.real.x = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0
    this.real.y = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0
    this.real.z = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0
    this.real.w = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0
    this.dual.x = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0
    this.dual.y = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0
    this.dual.z = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0
    this.dual.w = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0

    return this
  }

  premultiply(b: DualQuaternion) {
    const ax0 = b.real.x
    const ay0 = b.real.y
    const az0 = b.real.z
    const aw0 = b.real.w
    const bx1 = this.dual.x
    const by1 = this.dual.y
    const bz1 = this.dual.z
    const bw1 = this.dual.w
    const ax1 = b.dual.x
    const ay1 = b.dual.y
    const az1 = b.dual.z
    const aw1 = b.dual.w
    const bx0 = this.real.x
    const by0 = this.real.y
    const bz0 = this.real.z
    const bw0 = this.real.w

    this.real.x = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0
    this.real.y = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0
    this.real.z = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0
    this.real.w = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0
    this.dual.x = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0
    this.dual.y = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0
    this.dual.z = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0
    this.dual.w = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0

    return this
  }

  /**
   * Calculates the dot product of two dual quaternions (The dot product of the real parts)
   */
  dot(b: DualQuaternion) {
    return this.real.x * b.real.x + this.real.y * b.real.y + this.real.z * b.real.z + this.real.w * b.real.w
  }

  /**
   * Calculates the inverse of this dual quat. If already normalized, conjugate is cheaper
   */
  invert() {
    let sqlen = this.real.lengthSq()
    this.real.x = -this.real.x / sqlen
    this.real.y = -this.real.y / sqlen
    this.real.z = -this.real.z / sqlen
    this.real.w = this.real.w / sqlen
    this.dual.x = -this.dual.x / sqlen
    this.dual.y = -this.dual.y / sqlen
    this.dual.z = -this.dual.z / sqlen
    this.dual.w = this.dual.w / sqlen
    return this
  }

  /**
   * Calculates the conjugate of this dual quaternion
   * If the dual quaternion is normalized, this function is faster than inverse and produces the same result.
   */
  conjugate() {
    this.real.x = -this.real.x
    this.real.y = -this.real.y
    this.real.z = -this.real.z
    this.dual.x = -this.dual.x
    this.dual.y = -this.dual.y
    this.dual.z = -this.dual.z
    return this
  }

  /**
   * Normalize this dual quaternion
   */
  normalize() {
    const magnitudeSq =
      this.real.x * this.real.x + this.real.y * this.real.y + this.real.z * this.real.z + this.real.w * this.real.w
    if (magnitudeSq > 0) {
      const magnitude = Math.sqrt(magnitudeSq)
      const ax = this.real.x / magnitude
      const ay = this.real.y / magnitude
      const az = this.real.z / magnitude
      const aw = this.real.w / magnitude
      const bx = this.dual.x
      const by = this.dual.y
      const bz = this.dual.z
      const bw = this.dual.w
      const a_dot_b = ax * bx + ay * by + az * bz + aw * bw
      this.real.x = ax
      this.real.y = ay
      this.real.z = az
      this.real.w = aw
      this.dual.x = (bx - ax * a_dot_b) / magnitude
      this.dual.y = (by - ay * a_dot_b) / magnitude
      this.dual.z = (bz - az * a_dot_b) / magnitude
      this.dual.w = (bw - aw * a_dot_b) / magnitude
    }
  }

  /**
   * Scales a dual quaternion by a scalar number
   */
  multiplyScalar(s: number) {
    this.real.x *= s
    this.real.y *= s
    this.real.z *= s
    this.real.w *= s
    this.dual.x *= s
    this.dual.y *= s
    this.dual.z *= s
    this.dual.w *= s
    return this
  }

  /**
   * Performs a linear interpolation between two dual quaternions
   * NOTE: The resulting dual quaternions won't always be normalized (The error is most noticeable when t = 0.5)
   */
  lerp(b: DualQuaternion, t: number) {
    let mt = 1 - t
    const a_dot_b = this.real.x * b.real.x + this.real.y * b.real.y + this.real.z * b.real.z + this.real.w * b.real.w
    t = a_dot_b < 0 ? -t : t
    this.real.x = this.real.x * mt + b.real.x * t
    this.real.y = this.real.y * mt + b.real.y * t
    this.real.z = this.real.z * mt + b.real.z * t
    this.real.w = this.real.w * mt + b.real.w * t
    this.dual.x = this.dual.x * mt + b.dual.x * t
    this.dual.y = this.dual.y * mt + b.dual.y * t
    this.dual.z = this.dual.z * mt + b.dual.z * t
    this.dual.w = this.dual.w * mt + b.dual.w * t
    return this
  }

  /**
   * Performs a screw linear interpolation between two dual quaternions
   */
  sclerp(target: DualQuaternion, t: number) {
    // Shortest path
    const dot = this.dot(target)
    const b = _dual.copy(target).multiplyScalar(dot < 0 ? -1 : 1)
    // ScLERP = qa(qa^-1 qb)^t
    const diff = _dual.copy(this).conjugate().multiply(b)
    const vr = _vr.set(diff.real.x, diff.real.y, diff.real.z)
    const vd = _vd.set(diff.dual.x, diff.dual.y, diff.dual.z)
    const invr = 1 / vr.length()
    // Screw parameters
    let angle = 2 * Math.acos(diff.real.w)
    let pitch = -2 * diff.dual.w * invr
    const direction = vr.multiplyScalar(invr)
    const moment = vd.sub(direction.multiplyScalar(pitch * diff.real.w * 0.5)).multiplyScalar(invr)
    // Exponential power
    angle *= t
    pitch *= t
    // Convert back to dual-quaternion
    const sinAngle = Math.sin(0.5 * angle)
    const cosAngle = Math.cos(0.5 * angle)
    _dual.real.setFromAxisAngle(_axis.copy(direction).multiplyScalar(sinAngle), cosAngle)
    _dual.dual.setFromAxisAngle(
      moment.multiplyScalar(sinAngle).add(direction.multiplyScalar(pitch * 0.5 * cosAngle)),
      -pitch * 0.5 * sinAngle
    )
    // Complete the multiplication and return the interpolated value
    return this.multiply(_dual)
  }
}

const _rotation = new Quaternion()
const _translation = new Vector3()
const _axis = new Vector3()
const _rotMat = new Matrix4()
const _dual = new DualQuaternion()
const _vr = new Vector3()
const _vd = new Vector3()
