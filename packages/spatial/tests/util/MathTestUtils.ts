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

import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

export const compareArrays = (arr1, arr2, tolerance) => {
  if (tolerance) {
    arr1.forEach((val, i) => {
      assert(Math.abs(arr2[i] - val) < tolerance)
    })
  } else {
    arr1.forEach((val, i) => {
      assert.equal(val, arr2[i])
    })
  }
}

const tempQuat = new Quaternion()
export function quatNearEqual(a: Quaternion, b: Quaternion, epsilon: number = Number.EPSILON): boolean {
  return (
    tempQuat.set(a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w).lengthSq() < epsilon ||
    tempQuat.set(a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w).lengthSq() < epsilon
  )
}

export const equalsEpsilon = (v1: number, v2: number, epsilon = 0.001) => {
  return Math.abs(v1 - v2) < epsilon
}

export const vector3EqualsEpsilon = (v1: Vector3, v2: Vector3, epsilon = 0.001) => {
  return equalsEpsilon(v1.x, v2.x, epsilon) && equalsEpsilon(v1.y, v2.y, epsilon) && equalsEpsilon(v1.z, v2.z, epsilon)
}

export const quaternionEqualsEpsilon = (q1: Quaternion, q2: Quaternion, epsilon = 0.001) => {
  return (
    equalsEpsilon(Math.abs(q1.x), Math.abs(q2.x), epsilon) &&
    equalsEpsilon(Math.abs(q1.y), Math.abs(q2.y), epsilon) &&
    equalsEpsilon(Math.abs(q1.z), Math.abs(q2.z), epsilon) &&
    equalsEpsilon(Math.abs(q1.w), Math.abs(q2.w), epsilon)
  )
}

export const roundNumberToPlaces = (number: number, places = 2) => {
  return Math.pow(10, -places) * Math.round(number * Math.pow(10, places))
}

const vec3 = new Vector3()
export const roundVectorToPlaces = (vector: { x: number; y: number; z: number }, places = 2) => {
  return vec3.set(
    roundNumberToPlaces(vector.x, places),
    roundNumberToPlaces(vector.y, places),
    roundNumberToPlaces(vector.z, places)
  )
}
