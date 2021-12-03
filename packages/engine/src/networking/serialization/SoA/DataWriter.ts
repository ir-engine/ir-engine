import { TypedArray } from 'bitecs'
import { Entity } from '../../../ecs/classes/Entity'
import {
  createViewCursor,
  ViewCursor,
  spaceUint32,
  spaceUint8,
  writeNetworkId,
  writeProp,
  sliceViewCursor
} from './../ViewCursor'

const shadows = {}
export const writeProps = (v: ViewCursor, props: TypedArray[] | Function, entities: Entity[]) => {
  for (let pid = 0; pid < props.length; pid++) {
    const diff = typeof props[pid] === 'function'

    let prop, shadow
    if (diff) {
      prop = props[pid]()
      shadow = shadows[pid] || (shadows[pid] = prop.slice().fill(0))
    } else {
      prop = props[pid]
    }

    const writePid = spaceUint8(v)
    const writeCount = spaceUint32(v)

    let propsWritten = 0

    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]

      if (shadow && shadow[e] !== prop[e]) continue

      writeNetworkId(v, e)
      writeProp(v, prop, e)

      propsWritten++
    }

    if (propsWritten > 0) {
      writePid(pid)
      writeCount(propsWritten)
    }
  }

  return sliceViewCursor(v)
}

export const createDataWriter = (props: TypedArray[], size: number = 100000) => {
  const view = createViewCursor(new ArrayBuffer(size))
  return (entities: Entity[]) => {
    return writeProps(view, props, entities)
  }
}
