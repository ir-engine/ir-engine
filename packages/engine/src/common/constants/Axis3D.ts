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

// Common readonly 3D Axis definitions
import { Vector3 } from 'three'

import { V_001, V_010, V_100 } from './MathConstants'

export const Axis = {
  /** X Axis (1,0,0) */
  X: V_100,
  /** Y Axis (0,1,0) */
  Y: V_010,
  /** Z Axis (0,0,1) */
  Z: V_001
}

Object.freeze(Axis)

/** Right handed coordinate direction */
export const ObjectDirection = {
  Right: Object.freeze(new Vector3().copy(Axis.X).multiplyScalar(-1)),
  Left: Axis.X,
  Up: Axis.Y,
  Down: Object.freeze(new Vector3().copy(Axis.Y).multiplyScalar(-1)),
  Forward: Object.freeze(new Vector3().copy(Axis.Z).multiplyScalar(-1)),
  Backward: Axis.Z
}

Object.freeze(ObjectDirection)
