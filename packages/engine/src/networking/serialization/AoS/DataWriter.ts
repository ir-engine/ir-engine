import { Entity } from '../../../ecs/classes/Entity'
import { World } from '../../../ecs/classes/World'
import { hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../../xr/components/XRInputSourceComponent'
import { NetworkObjectComponent } from '../../components/NetworkObjectComponent'
import { flatten, Vector3SoA, Vector4SoA } from '../Utils'
import {
  createViewCursor,
  ViewCursor,
  spaceUint16,
  spaceUint32,
  spaceUint8,
  sliceViewCursor,
  writePropIfChanged,
  writeUint32,
  rewindViewCursor
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
    const rewind = rewindViewCursor(v)
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

    return changeMask > 0 || rewind()
  }
}

export const writeVector3 = (vector3: Vector3SoA) => (v: ViewCursor, entity: Entity) => {
  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  changeMask |= writePropIfChanged(v, vector3.x, entity) ? 1 << b++ : b++ && 0
  changeMask |= writePropIfChanged(v, vector3.y, entity) ? 1 << b++ : b++ && 0
  changeMask |= writePropIfChanged(v, vector3.z, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const writeVector4 = (vector4: Vector4SoA) => (v: ViewCursor, entity: Entity) => {
  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  changeMask |= writePropIfChanged(v, vector4.x, entity) ? 1 << b++ : b++ && 0
  changeMask |= writePropIfChanged(v, vector4.y, entity) ? 1 << b++ : b++ && 0
  changeMask |= writePropIfChanged(v, vector4.z, entity) ? 1 << b++ : b++ && 0
  changeMask |= writePropIfChanged(v, vector4.w, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

// todo: fix types
export const writePosition = writeVector3(TransformComponent.position)
export const writeRotation = writeVector4(TransformComponent.rotation)

// export const writeTransform = writeComponent(TransformComponent)
export const writeTransform = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, TransformComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  changeMask |= writePosition(v, entity) ? 1 << b++ : b++ && 0
  // todo: compress quaternion with custom writeQuaternion function
  changeMask |= writeRotation(v, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const writeXRContainerPosition = writeVector3(XRInputSourceComponent.container.position)
export const writeXRContainerRotation = writeVector4(XRInputSourceComponent.container.quaternion)

export const writeXRHeadPosition = writeVector3(XRInputSourceComponent.head.position)
export const writeXRHeadRotation = writeVector4(XRInputSourceComponent.head.quaternion)

export const writeXRControllerLeftPosition = writeVector3(XRInputSourceComponent.controllerLeft.position)
export const writeXRControllerLeftRotation = writeVector4(XRInputSourceComponent.controllerLeft.quaternion)

export const writeXRControllerGripLeftPosition = writeVector3(XRInputSourceComponent.controllerGripLeft.position)
export const writeXRControllerGripLeftRotation = writeVector4(XRInputSourceComponent.controllerGripLeft.quaternion)

export const writeXRControllerRightPosition = writeVector3(XRInputSourceComponent.controllerRight.position)
export const writeXRControllerRightRotation = writeVector4(XRInputSourceComponent.controllerRight.quaternion)

export const writeXRControllerGripRightPosition = writeVector3(XRInputSourceComponent.controllerGripRight.position)
export const writeXRControllerGripRightRotation = writeVector4(XRInputSourceComponent.controllerGripRight.quaternion)

export const writeXRInputs = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, XRInputSourceComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint16(v)
  let changeMask = 0
  let b = 0

  changeMask |= writeXRContainerPosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRContainerRotation(v, entity) ? 1 << b++ : b++ && 0

  changeMask |= writeXRHeadPosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRHeadRotation(v, entity) ? 1 << b++ : b++ && 0

  changeMask |= writeXRControllerLeftPosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRControllerLeftRotation(v, entity) ? 1 << b++ : b++ && 0

  changeMask |= writeXRControllerGripLeftPosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRControllerGripLeftRotation(v, entity) ? 1 << b++ : b++ && 0

  changeMask |= writeXRControllerRightPosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRControllerRightRotation(v, entity) ? 1 << b++ : b++ && 0

  changeMask |= writeXRControllerGripRightPosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRControllerGripRightRotation(v, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const writeEntity = (v: ViewCursor, entity: Entity) => {
  const rewind = rewindViewCursor(v)

  const writeNetworkId = spaceUint32(v)

  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  changeMask |= writeTransform(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRInputs(v, entity) ? 1 << b++ : b++ && 0

  return (
    (changeMask > 0 && writeNetworkId(NetworkObjectComponent.networkId[entity]) && writeChangeMask(changeMask)) ||
    rewind()
  )
}

export const writeEntities = (v: ViewCursor, entities: Entity[]) => {
  const writeCount = spaceUint32(v)

  let count = 0
  for (let i = 0, l = entities.length; i < l; i++) {
    count += writeEntity(v, entities[i]) ? 1 : 0
  }

  if (count > 0) writeCount(count)
  else v.cursor = 0 // nothing written
}

export const writeMetadata = (v: ViewCursor, world: World) => {
  writeUint32(v, world.fixedTick)
  // writeUint32(v, Date.now())
}

export const createDataWriter = (size: number = 100000) => {
  const view = createViewCursor(new ArrayBuffer(size))

  return (world: World, entities: Entity[]) => {
    writeMetadata(view, world)
    writeEntities(view, entities)
    return sliceViewCursor(view)
  }
}
