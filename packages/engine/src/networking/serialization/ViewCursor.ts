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

import { TypedArray } from 'bitecs'

import { Entity } from '../../ecs/classes/Entity'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export type ViewCursor = DataView & { cursor: number; shadowMap: Map<TypedArray, TypedArray> }

export const createViewCursor = (buffer = new ArrayBuffer(100000)): ViewCursor => {
  const view = new DataView(buffer) as ViewCursor
  view.cursor = 0
  view.shadowMap = new Map<TypedArray, TypedArray>()
  return view
}

export const sliceViewCursor = (v: ViewCursor) => {
  const packet = v.buffer.slice(0, v.cursor)
  v.cursor = 0
  return packet
}

export const scrollViewCursor = (v: ViewCursor, amount: number) => {
  v.cursor += amount
  return v
}

export const moveViewCursor = (v: ViewCursor, where: number) => {
  v.cursor = where
  return v
}

export const rewindViewCursor = (v: ViewCursor) => {
  const where = v.cursor
  return () => {
    v.cursor = where
  }
}

/* Writers */

export const writeProp = (v: ViewCursor, prop: TypedArray, entity: Entity) => {
  v[`set${prop.constructor.name.replace('Array', '')}`](v.cursor, prop[entity])
  v.cursor += prop.BYTES_PER_ELEMENT
  return v
}

/**
 * Writes property to view cursor if it has changed
 * @param v - view cursor
 * @param prop - property to write
 * @param entity - entity to write property for
 * @param ignoredChanged - if true, will write prop even if it hasn't changed
 * @returns true if property was written, false otherwise
 */
export const writePropIfChanged = (v: ViewCursor, prop: TypedArray, entity: Entity, ignoredChanged: boolean) => {
  const { shadowMap } = v

  const shadow = shadowMap.get(prop) || (shadowMap.set(prop, prop.slice().fill(0)) && shadowMap.get(prop))!

  const changed = shadow[entity] !== prop[entity] || ignoredChanged

  shadow[entity] = prop[entity]

  if (!changed) {
    return false
  }

  writeProp(v, prop, entity)

  return true
}

export const writeFloat64 = (v: ViewCursor, value: number) => {
  v.setFloat64(v.cursor, value)
  v.cursor += Float64Array.BYTES_PER_ELEMENT
  return v
}

export const writeFloat32 = (v: ViewCursor, value: number) => {
  v.setFloat32(v.cursor, value)
  v.cursor += Float32Array.BYTES_PER_ELEMENT
  return v
}

export const writeUint64 = (v, value) => {
  v.setUint32(v.cursor, value)
  v.cursor += BigUint64Array.BYTES_PER_ELEMENT
  return v
}

export const writeUint32 = (v: ViewCursor, value: number) => {
  v.setUint32(v.cursor, value)
  v.cursor += Uint32Array.BYTES_PER_ELEMENT
  return v
}

export const writeInt16 = (v: ViewCursor, value: number) => {
  v.setInt16(v.cursor, value)
  v.cursor += Int16Array.BYTES_PER_ELEMENT
  return v
}

export const writeUint16 = (v: ViewCursor, value: number) => {
  v.setUint16(v.cursor, value)
  v.cursor += Uint16Array.BYTES_PER_ELEMENT
  return v
}

export const writeUint8 = (v: ViewCursor, value: number) => {
  v.setUint8(v.cursor, value)
  v.cursor += Uint8Array.BYTES_PER_ELEMENT
  return v
}

export const spaceUint64 = (v) => {
  const savePoint = v.cursor
  v.cursor += BigUint64Array.BYTES_PER_ELEMENT
  return (value) => {
    v.setUint32(savePoint, value)
    return v
  }
}

export const spaceUint32 = (v: ViewCursor) => {
  const savePoint = v.cursor
  v.cursor += Uint32Array.BYTES_PER_ELEMENT
  return (value: number) => {
    v.setUint32(savePoint, value)
    return v
  }
}

export const spaceUint16 = (v: ViewCursor) => {
  const savePoint = v.cursor
  v.cursor += Uint16Array.BYTES_PER_ELEMENT
  return (value: number) => {
    v.setUint16(savePoint, value)
    return v
  }
}

export const spaceUint8 = (v: ViewCursor) => {
  const savePoint = v.cursor
  v.cursor += Uint8Array.BYTES_PER_ELEMENT
  return (value: number) => {
    v.setUint8(savePoint, value)
    return v
  }
}

export const writeEntityId = writeUint32

export const writeNetworkId = (v: ViewCursor, entity: Entity) =>
  writeUint32(v, NetworkObjectComponent.networkId[entity])

/* Readers */

export const readProp = (v: ViewCursor, prop: TypedArray) => {
  const val = v[`get${prop.constructor.name.replace('Array', '')}`](v.cursor)
  v.cursor += prop.BYTES_PER_ELEMENT
  return val
}

export const readFloat64 = (v: ViewCursor) => {
  const val = v.getFloat64(v.cursor)
  v.cursor += Float64Array.BYTES_PER_ELEMENT
  return val
}

export const readFloat32 = (v: ViewCursor) => {
  const val = v.getFloat32(v.cursor)
  v.cursor += Float32Array.BYTES_PER_ELEMENT
  return val
}

export const readUint64 = (v) => {
  const val = v.getBigUint64(v.cursor)
  v.cursor += BigUint64Array.BYTES_PER_ELEMENT
  return val
}

export const readUint32 = (v: ViewCursor) => {
  const val = v.getUint32(v.cursor)
  v.cursor += Uint32Array.BYTES_PER_ELEMENT
  return val
}

export const readInt16 = (v: ViewCursor) => {
  const val = v.getInt16(v.cursor)
  v.cursor += Int16Array.BYTES_PER_ELEMENT
  return val
}

export const readUint16 = (v: ViewCursor) => {
  const val = v.getUint16(v.cursor)
  v.cursor += Uint16Array.BYTES_PER_ELEMENT
  return val
}

export const readUint8 = (v: ViewCursor) => {
  const val = v.getUint8(v.cursor)
  v.cursor += Uint8Array.BYTES_PER_ELEMENT
  return val
}

export const readEntityId = readUint32
export const readNetworkId = readUint32
