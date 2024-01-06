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

import { Matrix3, Matrix4, Quaternion, Vector2, Vector3 } from 'three'

export const PI = Math.PI
export const HALF_PI = PI / 2
export const TAU = Math.PI * 2

export const V_000 = Object.freeze(new Vector3(0, 0, 0))
export const V_100 = Object.freeze(new Vector3(1, 0, 0))
export const V_010 = Object.freeze(new Vector3(0, 1, 0))
export const V_001 = Object.freeze(new Vector3(0, 0, 1))
export const V_111 = Object.freeze(new Vector3(1, 1, 1))
export const V_00 = Object.freeze(new Vector2(0, 0))

export const Q_IDENTITY = Object.freeze(new Quaternion())

export const MAT3_IDENTITY = Object.freeze(new Matrix3().identity())
export const MAT4_IDENTITY = Object.freeze(new Matrix4().identity())

export const X_180 = Object.freeze(new Quaternion().setFromAxisAngle(V_100, PI))
export const Y_180 = Object.freeze(new Quaternion().setFromAxisAngle(V_010, PI))
export const Z_180 = Object.freeze(new Quaternion().setFromAxisAngle(V_001, PI))
