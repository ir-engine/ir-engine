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

import { Vector3 } from 'three'

export const TransformPivot = {
  Selection: 'Selection' as const,
  Center: 'Center' as const,
  Bottom: 'Bottom' as const,
  Origin: 'Origin' as const
}
export const TransformMode = {
  translate: 'translate' as const,
  rotate: 'rotate' as const,
  scale: 'scale' as const
}

export const TransformAxis = {
  X: 'X' as const,
  Y: 'Y' as const,
  Z: 'Z' as const,
  XY: 'XY' as const,
  YZ: 'YZ' as const,
  XZ: 'XZ' as const,
  XYZ: 'XYZ' as const
}
export const TransformAxisConstraints = {
  X: new Vector3(1, 0, 0),
  Y: new Vector3(0, 1, 0),
  Z: new Vector3(0, 0, 1),
  XY: new Vector3(1, 1, 0),
  YZ: new Vector3(0, 1, 1),
  XZ: new Vector3(1, 0, 1),
  XYZ: new Vector3(1, 1, 1)
}
export const TransformAxisAction = {
  Translate: 'Translate' as const,
  Rotate: 'Rotate' as const,
  Scale: 'Scale' as const
}
export const SnapMode = {
  Disabled: 'Disabled' as const,
  Grid: 'Grid' as const
}

export enum TransformSpace {
  World,
  Local
  // LocalSelection // The local space of the last selected object
  // TODO: Viewport, Cursor?
}

export type TransformAxisActionType = keyof typeof TransformAxisAction
export type TransformModeType = keyof typeof TransformMode
export type TransformPivotType = keyof typeof TransformPivot
export type TransformAxisType = keyof typeof TransformAxis
export type SnapModeType = keyof typeof SnapMode
