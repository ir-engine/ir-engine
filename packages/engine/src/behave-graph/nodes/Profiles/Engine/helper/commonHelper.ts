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

import { toQuat, toVector3, toVector4 } from '@behave-graph/scene'
import { Color, Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from 'three'

export const getSocketType = (name, value) => {
  switch (typeof value) {
    case 'number':
      if (name.toLowerCase().includes('entity')) return 'entity'
      else {
        return 'float'
      }
      // use float
      break
    case 'boolean':
      return 'boolean'
      // use boolean
      break
    case 'string':
    case 'undefined':
      return 'string'
    case 'object':
      if (value instanceof Vector2) {
        return 'vec2'
      } else if (value instanceof Vector3) {
        return 'vec3'
      } else if (value instanceof Vector4) {
        return 'vec4'
      } else if (value instanceof Quaternion) {
        return 'quat'
      } else if (value instanceof Matrix4) {
        return 'mat4'
      } else if (value instanceof Matrix3) {
        return 'mat3'
      } else if (value instanceof Color) {
        return 'color'
      }
      break
    case 'function':
      break
    default:
      return null
      break
    // add more objects later
  }
}

export function NodetoEnginetype(value, valuetype) {
  switch (valuetype) {
    case 'float':
    case 'integer':
      return Number(value)
      break
    case 'string':
      return String(value)
    case 'vec3':
    case 'vec2':
      return toVector3(value)
    case 'quat':
      return toQuat(value)
    case 'vec4':
      return toVector4(value)
    case 'mat4':
      return new Matrix4().fromArray(value.elements)
    case 'mat3':
      return new Matrix3().fromArray(value.elements)
    case 'color':
      return new Color().setFromVector3(value)
    case 'boolean':
      return Boolean(value)
    default:
  }
}

export function EnginetoNodetype(value) {
  if (typeof value === 'object') {
    if (value instanceof Color) {
      const style = value.getStyle() // 'rgb(255, 0, 0)'
      const rgbValues = style.match(/\d+/g)!.map(Number)
      return new Vector3(rgbValues[0], rgbValues[1], rgbValues[2])
    }
  }
  return value
}
