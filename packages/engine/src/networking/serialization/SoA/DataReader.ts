import { TypedArray } from 'bitecs'
import { createViewCursor, readProp, readUint32, readUint8, ViewCursor } from '../ViewCursor'

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
    return readProps(view, props, idMap, packet)
  }
}
