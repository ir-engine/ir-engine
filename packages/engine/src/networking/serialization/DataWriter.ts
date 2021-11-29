import { TypedArray } from 'bitecs'
import { Entity } from '../../ecs/classes/Entity'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { createViewCursor, ViewCursor } from './ViewCursor'

/**
 * Types
 */

type Vector3SoA = {
  x: Float32Array
  y: Float32Array
  z: Float32Array
}

/**
 * Primitives
 */

export const writeProp = (v: ViewCursor, prop: TypedArray, entity: Entity) => {
  v[`set${prop.constructor.name.replace('Array', '')}`](v.cursor, prop[entity])
  v.cursor += prop.BYTES_PER_ELEMENT
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

export const writeFloat32 = (v: ViewCursor, value: number) => {
  v.setFloat32(v.cursor, value)
  v.cursor += Float32Array.BYTES_PER_ELEMENT
  return v
}

export const spacerUint32 = (v: ViewCursor) => {
  const savePoint = v.cursor
  v.cursor += Uint32Array.BYTES_PER_ELEMENT
  return (value: number) => {
    v.setUint32(savePoint, value)
    return v
  }
}

export const spacerUint8 = (v: ViewCursor) => {
  const savePoint = v.cursor
  v.cursor += Uint8Array.BYTES_PER_ELEMENT
  return (value: number) => {
    v.setUint8(savePoint, value)
    return v
  }
}

export const writeEntityId = (v: ViewCursor, entity: Entity) => writeUint32(v, entity)
export const writeNetworkId = (v: ViewCursor, entity: Entity) =>
  writeUint32(v, NetworkObjectComponent.networkId[entity])

/**
 * Array of Structures
 */

export const writeVector3 = (vector3: Vector3SoA) => (v: ViewCursor, entity: Entity) => {
  writeFloat32(v, vector3.x[entity])
  writeFloat32(v, vector3.y[entity])
  writeFloat32(v, vector3.z[entity])
  return v
}

// todo: fix types
export const writePosition = writeVector3(TransformComponent.position as unknown as Vector3SoA)
export const writeRotation = writeVector3(TransformComponent.rotation as unknown as Vector3SoA)

export const writeTransform = (v: ViewCursor, entity: Entity) => {
  writePosition(v, entity)
  writeRotation(v, entity)
  return v
}

export const writeEntity = (v: ViewCursor, entity: Entity) => {
  writeNetworkId(v, entity)
  writeTransform(v, entity)
  return v
}

export const writeEntities = (v: ViewCursor, entities: Entity[]) => {
  writeUint32(v, entities.length)

  for (let i = 0, l = entities.length; i < l; i++) {
    writeEntity(v, entities[i])
  }

  return v.buffer.slice(0, v.cursor)
}

export const createDataWriterAoS = (size: number = 100000) => {
  const buffer = new ArrayBuffer(size)
  const view = new DataView(buffer) as ViewCursor
  return (entities: Entity[]) => {
    view.cursor = 0
    return writeEntities(view, entities)
  }
}

/**
 * Structure of Arrays
 */

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

    const writePid = spacerUint8(v)
    const writeCount = spacerUint32(v)

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

  return v.buffer.slice(0, v.cursor)
}

export const createDataWriter = (props: TypedArray[], size: number = 100000) => {
  const buffer = new ArrayBuffer(size)
  const view = createViewCursor(buffer)
  return (entities: Entity[]) => {
    view.cursor = 0
    return writeProps(view, props, entities)
  }
}
