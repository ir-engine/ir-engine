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

import { NumericOptions, Type } from '@feathersjs/typebox'

export const Vector3Schema = (options?: { x: NumericOptions; y: NumericOptions; z: NumericOptions }) =>
  Type.Object({
    x: Type.Number(options?.x ?? { default: 0 }),
    y: Type.Number(options?.y ?? { default: 0 }),
    z: Type.Number(options?.z ?? { default: 0 })
  })

export const QuaternionSchema = (options?: {
  x: NumericOptions
  y: NumericOptions
  z: NumericOptions
  w: NumericOptions
}) =>
  Type.Object({
    x: Type.Number(options?.x ?? { default: 0 }),
    y: Type.Number(options?.y ?? { default: 0 }),
    z: Type.Number(options?.z ?? { default: 0 }),
    w: Type.Number(options?.w ?? { default: 0 })
  })

export const Matrix4Schema = (options?: any) =>
  Type.Object({
    elements: Type.Array(Type.Number(), {
      default: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      maxItems: 16,
      minItems: 16
    })
  })
