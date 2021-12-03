import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { TypedArray } from 'bitecs'
import { Entity } from '../../../ecs/classes/Entity'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { flatten, Vector3SoA } from '../Utils'
import { createViewCursor, ViewCursor, readProp, readUint16, readUint32, readUint8 } from '../ViewCursor'

/**
 * Reads a component dynamically
 * (less efficient than statically due to inner loop)
 *
 * @param  {any} component
 */
export const readComponent = (component: any) => {
  // todo: test performance of using flatten in the inner scope vs outer scope
  const props = flatten(component)

  return (v: ViewCursor, entity: Entity) => {
    const changeMask =
      props.length <= 8
        ? // use Uint8 if <= 8 properties
          readUint8(v)
        : // use Uint16 if > 8 properties
          readUint16(v)

    for (let i = 0; i < props.length; i++) {
      // skip reading property if not in the change mask
      if ((changeMask & i) === changeMask) {
        continue
      }
      const prop = props[i]
      const val = readProp(v, prop)
      prop[entity] = val
    }
  }
}

export const readComponentProp = (v: ViewCursor, prop: TypedArray, entity: Entity) => {
  prop[entity] = readProp(v, prop)
}

const checkBitflag = (changeMask: number, flag: number) => (changeMask & flag) === changeMask

export const readVector3 = (vector3: Vector3SoA) => (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  if (checkBitflag(changeMask, 0b001)) readComponentProp(v, vector3.x, entity)
  if (checkBitflag(changeMask, 0b010)) readComponentProp(v, vector3.y, entity)
  if (checkBitflag(changeMask, 0b100)) readComponentProp(v, vector3.z, entity)
}

export const readPosition = readVector3(TransformComponent.position as unknown as Vector3SoA)
export const readRotation = readVector3(TransformComponent.rotation as unknown as Vector3SoA)

// export const readTransform = readComponent(TransformComponent)
export const readTransform = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  if (checkBitflag(changeMask, 0b01)) readPosition(v, entity)
  if (checkBitflag(changeMask, 0b10)) readRotation(v, entity)
}

export const readEntity = (v: ViewCursor, netIdMap: Map<NetworkId, Entity>) => {
  const netId = readUint32(v) as NetworkId
  const entity = netIdMap.get(netId)!
  readTransform(v, entity)
}

export const readEntities = (v: ViewCursor, netIdMap: Map<NetworkId, Entity>, packet: ArrayBuffer) => {
  while (v.cursor < packet.byteLength) {
    const count = readUint32(v)
    for (let i = 0; i < count; i++) {
      readEntity(v, netIdMap)
    }
  }
}

export const createDataReader = () => {
  return (packet: ArrayBuffer, netIdMap: Map<NetworkId, Entity>) => {
    const view = createViewCursor(packet)
    return readEntities(view, netIdMap, packet)
  }
}
