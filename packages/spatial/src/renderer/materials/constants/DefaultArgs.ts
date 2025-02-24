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

import { Color, Euler, Quaternion, Texture, Vector2, Vector3, Vector4 } from 'three'

export const BoolArg = { default: false, type: 'boolean' }

export const FloatArg = { default: 0.0, type: 'float' }
export const NormalizedFloatArg = { ...FloatArg, min: 0.0, max: 1.0 }

export const Vec2Arg = { default: [1, 1], type: 'vec2' }
export const Vec3Arg = { default: [1, 1, 1], type: 'vec3' }
export const Vec4Arg = { default: [1, 1, 1, 1], type: 'vec4' }
export const EulerArg = { default: new Euler(), type: 'euler' }
export const ColorArg = { default: new Color(), type: 'color' }

export const TextureArg = { default: null, type: 'texture' }

export const SelectArg = { default: '', options: [], type: 'select' }
export const StringArg = { default: '', type: 'string' }
export const ShaderArg = { default: '', type: 'shader' }

export const ObjectArg = { default: {}, type: 'object' }

export function getDefaultType(value) {
  switch (typeof value) {
    case 'boolean':
      return BoolArg.type
    case 'string':
      return StringArg.type
    case 'number':
      return FloatArg.type
    case 'object':
      if ((value as Texture)?.isTexture) return TextureArg.type
      if ((value as Color)?.isColor) return ColorArg.type
      if ((value as Vector2)?.isVector2) return Vec2Arg.type
      if ((value as Vector3)?.isVector3) return Vec3Arg.type
      if ((value as Quaternion)?.isQuaternion || (value as Vector4)?.isVector4) return Vec4Arg.type
      if ((value as Euler)?.isEuler) return EulerArg.type
      return ''
    //todo: selects, objects
    default:
      return ''
  }
}

export function generateDefaults(value) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([k, v]) => getDefaultType(v))
      .map(([k, v]) => {
        return [
          k,
          {
            type: getDefaultType(v),
            default: v
          }
        ]
      })
  )
}
