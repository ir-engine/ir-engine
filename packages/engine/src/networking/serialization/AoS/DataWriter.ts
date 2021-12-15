import { TypedArray } from 'bitecs'
import { Entity } from '../../../ecs/classes/Entity'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../../components/NetworkObjectComponent'
import { flatten, Vector3SoA } from '../Utils'
import {
  createViewCursor,
  ViewCursor,
  spaceUint16,
  spaceUint32,
  spaceUint8,
  writeProp,
  sliceViewCursor,
  writePropIfChanged
} from './../ViewCursor'

/**
 * Writes a component dynamically
 * (less efficient than statically due to inner loop)
 *
 * @param  {any} component
 */
export const writeComponent = (component: any) => {
  // todo: test performance of using flatten in the return scope vs this scope
  const props = flatten(component)

  return (v: ViewCursor, entity: Entity) => {
    const writeChangeMask =
      props.length <= 8
        ? // use Uint8 if <= 8 properties
          spaceUint8(v)
        : // use Uint16 if > 8 properties
          spaceUint16(v)

    let changeMask = 0

    for (let i = 0; i < props.length; i++) {
      changeMask |= writePropIfChanged(v, props[i], entity) ? 2 ** i : 0b0
    }

    writeChangeMask(changeMask)

    return changeMask > 0
  }
}

export const writeVector3 = (vector3: Vector3SoA) => (v: ViewCursor, entity: Entity) => {
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0

  changeMask |= writePropIfChanged(v, vector3.x, entity) ? 0b001 : 0b0
  changeMask |= writePropIfChanged(v, vector3.y, entity) ? 0b010 : 0b0
  changeMask |= writePropIfChanged(v, vector3.z, entity) ? 0b100 : 0b0

  return changeMask > 0 && writeChangeMask(changeMask)
}

// todo: fix types
export const writePosition = writeVector3(TransformComponent.position as unknown as Vector3SoA)
export const writeRotation = writeVector3(TransformComponent.rotation as unknown as Vector3SoA)

// export const writeTransform = writeComponent(TransformComponent)
export const writeTransform = (v: ViewCursor, entity: Entity) => {
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  changeMask |= writePosition(v, entity) ? 0b01 : 0b0
  // todo: compress quaternion with custom writeQuaternion function
  changeMask |= writeRotation(v, entity) ? 0b10 : 0b0
  return changeMask > 0 && writeChangeMask(changeMask)
}

export const writeEntity = (v: ViewCursor, entity: Entity) => {
  const writeNetworkId = spaceUint32(v)
  const written = writeTransform(v, entity)
  if (written) writeNetworkId(NetworkObjectComponent.networkId[entity])
  return written
}

export const writeEntities = (v: ViewCursor, entities: Entity[]) => {
  const writeCount = spaceUint32(v)

  let count = 0
  for (let i = 0, l = entities.length; i < l; i++) {
    count += writeEntity(v, entities[i]) ? 1 : 0
  }

  writeCount(count)

  return sliceViewCursor(v)
}

export const createDataWriter = (size: number = 100000) => {
  const view = createViewCursor(new ArrayBuffer(size))

  return (entities: Entity[]) => {
    return writeEntities(view, entities)
  }
}
