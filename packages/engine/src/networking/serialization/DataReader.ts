import { TypedArray } from 'bitecs'
import { Entity } from '../../ecs/classes/Entity'
import { createViewCursor, ViewCursor } from './ViewCursor'

export const readUint32 = (v: ViewCursor) => {
  const val = v.getUint32(v.cursor)
  v.cursor += Uint32Array.BYTES_PER_ELEMENT
  return val
}

export const readUint8 = (v: ViewCursor) => {
  const val = v.getUint8(v.cursor)
  v.cursor += Uint8Array.BYTES_PER_ELEMENT
  return val
}

export const readProp = (v: ViewCursor, prop: TypedArray) => {
  const val = v[`get${prop.constructor.name.replace('Array', '')}`](v.cursor)
  v.cursor += prop.BYTES_PER_ELEMENT
  return val
}

export const readProps = (v: ViewCursor, props: TypedArray[], idMap: Map<number, number>, packet: ArrayBuffer) => {
  while (v.cursor < packet.byteLength) {
    const pid = readUint8(v)
    const count = readUint32(v)

    const prop = props[pid]

    for (let i = 0; i < count; i++) {
      const eid = idMap.get(readUint32(v))
      if (eid) prop[eid] = readProp(v, prop)
    }
  }
}

export const createDataReader = (props: TypedArray[]) => {
  return (packet: ArrayBuffer, idMap: Map<number, number>) => {
    const view = createViewCursor(packet)
    view.cursor = 0
    return readProps(view, props, idMap, packet)
  }
}
