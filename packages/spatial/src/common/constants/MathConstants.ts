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

/** const Vector3(0,0,0) */
export const Vector3_Zero = Object.freeze(new Vector3(0, 0, 0))

/** const Vector3(1,0,0) */
export const Vector3_Right = Object.freeze(new Vector3(1, 0, 0))

/** const Vector3(-1,0,0) */
export const Vector3_Left = Object.freeze(new Vector3(-1, 0, 0))

/** const Vector3(0,1,0) */
export const Vector3_Up = Object.freeze(new Vector3(0, 1, 0))

/** const Vector3(0,-1,0) */
export const Vector3_Down = Object.freeze(new Vector3(0, -1, 0))

/** const Vector3(0,0,1) */
export const Vector3_Back = Object.freeze(new Vector3(0, 0, 1))

/** const Vector3(0,0,-1) */
export const Vector3_Forward = Object.freeze(new Vector3(0, 0, -1))

/** const Vector3(1,1,1) */
export const Vector3_One = Object.freeze(new Vector3(1, 1, 1))

/** const Vector2(0,0) */
export const Vector2_Zero = Object.freeze(new Vector2(0, 0))

/** const Vector2(1,0) */
export const Vector2_Right = Object.freeze(new Vector2(1, 0))

/** const Vector2(-1,0) */
export const Vector2_Left = Object.freeze(new Vector2(-1, 0))

/** const Vector2(0,1) */
export const Vector2_Up = Object.freeze(new Vector2(0, 1))

/** const Vector2(0,-1) */
export const Vector2_Down = Object.freeze(new Vector2(0, -1))

/** const Vector2(1,1) */
export const Vector2_One = Object.freeze(new Vector2(1, 1))

/** const Quaternion(0,0,0,1) */
export const Q_IDENTITY = Object.freeze(new Quaternion())

/** Matrix3x3 array in row-major order [1, 0, 0, 0, 1, 0, 0, 0, 1] */
export const MAT3_IDENTITY = Object.freeze(new Matrix3().identity())

/** Matrix4x4 array in row-major order [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] */
export const MAT4_IDENTITY = Object.freeze(new Matrix4().identity())

export const Q_X_90 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Right, HALF_PI))
export const Q_Y_90 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Up, HALF_PI))
export const Q_Z_90 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Back, HALF_PI))

export const Q_X_180 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Right, PI))
export const Q_Y_180 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Up, PI))
export const Q_Z_180 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Back, PI))

export const Q_X_270 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Right, PI + HALF_PI))
export const Q_Y_270 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Up, PI + HALF_PI))
export const Q_Z_270 = Object.freeze(new Quaternion().setFromAxisAngle(Vector3_Back, PI + HALF_PI))

export const Axis = {
  /** X Axis (1,0,0) */
  X: Vector3_Right,
  /** Y Axis (0,1,0) */
  Y: Vector3_Up,
  /** Z Axis (0,0,1) */
  Z: Vector3_Back
}

Object.freeze(Axis)

/** Right handed coordinate direction */
export const ObjectDirection = {
  /** const Vector3 (1,0,0) */
  Right: Vector3_Right,
  /** const Vector3 (-1,0,0) */
  Left: Vector3_Left,
  /** const Vector3 (0,1,0) */
  Up: Vector3_Up,
  /** const Vector3 (0,-1,0) */
  Down: Vector3_Down,
  /** const Vector3 (0,0,-1) */
  Forward: Vector3_Forward,
  /** const Vector3 (0,0,1) */
  Backward: Vector3_Back
}

Object.freeze(ObjectDirection)
