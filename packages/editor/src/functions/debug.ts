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

export function serializeVector2(value) {
  return `Vector2 { x: ${value.x}, y: ${value.y} }`
}
export function serializeVector3(value) {
  return `Vector3 { x: ${value.x}, y: ${value.y}, z: ${value.z} }`
}
export function serializeEuler(value) {
  return `Euler { x: ${value.x}, y: ${value.y}, z: ${value.z} }`
}
export function serializeColor(value) {
  return `Color { r: ${value.r}, g: ${value.g}, b: ${value.b}, hex: #${value.getHexString()}`
}
export function serializeVector4(value) {
  return `Vector4 { x: ${value.x}, y: ${value.y}, z: ${value.z}, w: ${value.w} }`
}
export function serializeQuaternion(value) {
  return `Quaternion { x: ${value.x}, y: ${value.y}, z: ${value.z}, w: ${value.w} }`
}
export function serializeObject3D(value) {
  if (!value?.constructor?.name || !value.name) return value
  return `${value.constructor.name} "${value.name}"`
}
export function serializeObject3DArray(value) {
  return value.map((o) => serializeObject3D(o)).join(',')
}
export function serializeProperty(value) {
  if (typeof value !== 'object' || value === null) {
    return value
  } else if (value.isVector2) {
    return serializeVector2(value)
  } else if (value.isVector3) {
    return serializeVector3(value)
  } else if (value.isEuler) {
    return serializeEuler(value)
  } else if (value.isColor) {
    return serializeColor(value)
  } else if (value.isVector4) {
    return serializeVector4(value)
  } else if (value.isQuaternion) {
    return serializeQuaternion(value)
  } else if (value.isObject3D) {
    return `${value.constructor.name} "${value.name}"`
  } else if (value.constructor) {
    return value.constructor.name
  } else {
    return value.toString()
  }
}
export function serializeProperties(properties) {
  const debugProperties = {}
  const propertyNames = Object.keys(properties)
  for (const propertyName of propertyNames) {
    if (typeof properties[propertyName] !== 'undefined') {
      debugProperties[propertyName] = serializeProperty(properties[propertyName])
    }
  }
  return debugProperties
}
