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

import { Quaternion, Vector3, Vector4 } from 'three'

import { Vec3 } from './values/internal/Vec3'
import { Vec4 } from './values/internal/Vec4'

export function toVec3(value: Vector3): Vec3 {
  return new Vec3(value.x, value.y, value.z)
}

export function toVec4(value: Vector4 | Quaternion): Vec4 {
  return new Vec4(value.x, value.y, value.z, value.w)
}

export function toVector3(value: Vec3): Vector3 | null {
  return value ? new Vector3(value.x, value.y, value.z) : null
}

export function toVector4(value: Vec4): Vector4 | null {
  return value ? new Vector4(value.x, value.y, value.z, value.w) : null
}

export function toQuat(value: Vec4): Quaternion | null {
  return value ? new Quaternion(value.x, value.y, value.z, value.w) : null
}
