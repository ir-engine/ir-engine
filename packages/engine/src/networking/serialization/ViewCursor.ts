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

/* Writers */

export const writeProp = (v: ViewCursor, prop: TypedArray, entity: Entity) => {
  v[`set${prop.constructor.name.replace('Array', '')}`](v.cursor, prop[entity])
  v.cursor += prop.BYTES_PER_ELEMENT
  return v
}

export const writePropIfChanged = (v: ViewCursor, prop: TypedArray, entity: Entity) => {
  const { shadowMap } = v

  const shadowInit = !shadowMap.has(prop)

  const shadow = shadowMap.get(prop)! || (shadowMap.set(prop, prop.slice().fill(0)) && shadowMap.get(prop))!

  const changed = shadowInit || shadow[entity] !== prop[entity]

  shadow[entity] = prop[entity]

  if (!changed) {
    return false
  }

  writeProp(v, prop, entity)

  return true
}

export const writeFloat32 = (v: ViewCursor, value: number) => {
  v.setFloat32(v.cursor, value)
  v.cursor += Float32Array.BYTES_PER_ELEMENT
  return v
}

export const writeUint32 = (v: ViewCursor, value: number) => {
  v.setUint32(v.cursor, value)
  v.cursor += Uint32Array.BYTES_PER_ELEMENT
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

export const readFloat32 = (v: ViewCursor) => {
  const val = v.getFloat32(v.cursor)
  v.cursor += Float32Array.BYTES_PER_ELEMENT
  return val
}

export const readUint32 = (v: ViewCursor) => {
  const val = v.getUint32(v.cursor)
  v.cursor += Uint32Array.BYTES_PER_ELEMENT
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
