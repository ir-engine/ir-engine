import { TypedArray } from 'bitecs'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'

import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { NetworkObjectAuthorityTag } from '../components/NetworkObjectAuthorityTag'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { flatten, Vector3SoA, Vector4SoA } from './Utils'
import {
  createViewCursor,
  readProp,
  readUint8,
  readUint16,
  readUint32,
  readUint64,
  scrollViewCursor,
  ViewCursor
} from './ViewCursor'

export const checkBitflag = (mask: number, flag: number) => (mask & flag) === flag

/**
 * Reads a component dynamically
 * (less efficient than statically due to inner loop)
 *
 * @param  {any} component
 */
export const readComponent = (component: any) => {
  // todo: test performance of using flatten in the inner scope vs outer scope
  const props = flatten(component)

  const readChanged =
    props.length <= 8 ? readUint8 : props.length <= 16 ? readUint16 : props.length <= 32 ? readUint32 : readUint64

  return (v: ViewCursor, entity: Entity) => {
    const changeMask = readChanged(v)

    for (let i = 0; i < props.length; i++) {
      // skip reading property if not in the change mask
      if (!checkBitflag(changeMask, 2 ** i)) {
        continue
      }
      const prop = props[i]
      const val = readProp(v, prop)
      prop[entity] = val
    }
  }
}

export const readComponentProp = (v: ViewCursor, prop: TypedArray, entity: Entity, shouldWrite = true) => {
  if (entity !== undefined && shouldWrite) prop[entity] = readProp(v, prop)
  else readProp(v, prop)
}

export const readVector3 =
  (vector3: Vector3SoA) =>
  (v: ViewCursor, entity: Entity, shouldWrite = true) => {
    const changeMask = readUint8(v)
    let b = 0
    if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector3.x, entity, shouldWrite)
    if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector3.y, entity, shouldWrite)
    if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector3.z, entity, shouldWrite)
  }

export const readVector4 =
  (vector4: Vector4SoA) =>
  (v: ViewCursor, entity: Entity, shouldWrite = true) => {
    const changeMask = readUint8(v)
    let b = 0
    if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector4.x, entity, shouldWrite)
    if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector4.y, entity, shouldWrite)
    if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector4.z, entity, shouldWrite)
    if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector4.w, entity, shouldWrite)
  }

export const readPosition = readVector3(TransformComponent.position)
export const readLinearVelocity = readVector3(VelocityComponent.linear)
export const readAngularVelocity = readVector3(VelocityComponent.angular)
export const readRotation = readVector4(TransformComponent.rotation)

export const readTransform = (v: ViewCursor, entity: Entity, shouldWrite = true) => {
  const changeMask = readUint8(v)
  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readPosition(v, entity, shouldWrite)
  if (checkBitflag(changeMask, 1 << b++)) readRotation(v, entity, shouldWrite)
}

export const readVelocity = (v: ViewCursor, entity: Entity, shouldWrite = true) => {
  const changeMask = readUint8(v)
  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readLinearVelocity(v, entity, shouldWrite)
  if (checkBitflag(changeMask, 1 << b++)) readAngularVelocity(v, entity, shouldWrite)
}

export const readXRContainerPosition = readVector3(XRInputSourceComponent.container.position)
export const readXRContainerRotation = readVector4(XRInputSourceComponent.container.quaternion)

export const readXRHeadPosition = readVector3(XRInputSourceComponent.head.position)
export const readXRHeadRotation = readVector4(XRInputSourceComponent.head.quaternion)

export const readXRControllerLeftPosition = readVector3(XRInputSourceComponent.controllerLeftParent.position)
export const readXRControllerLeftRotation = readVector4(XRInputSourceComponent.controllerLeftParent.quaternion)

export const readXRControllerGripLeftPosition = readVector3(XRInputSourceComponent.controllerGripLeftParent.position)
export const readXRControllerGripLeftRotation = readVector4(XRInputSourceComponent.controllerGripLeftParent.quaternion)

export const readXRControllerRightPosition = readVector3(XRInputSourceComponent.controllerRightParent.position)
export const readXRControllerRightRotation = readVector4(XRInputSourceComponent.controllerRightParent.quaternion)

export const readXRControllerGripRightPosition = readVector3(XRInputSourceComponent.controllerGripRightParent.position)
export const readXRControllerGripRightRotation = readVector4(
  XRInputSourceComponent.controllerGripRightParent.quaternion
)

export const readXRInputs = (v: ViewCursor, entity: Entity, shouldWrite = true) => {
  const changeMask = readUint16(v)
  let b = 0

  if (checkBitflag(changeMask, 1 << b++)) readXRContainerPosition(v, entity, shouldWrite)
  if (checkBitflag(changeMask, 1 << b++)) readXRContainerRotation(v, entity, shouldWrite)

  if (checkBitflag(changeMask, 1 << b++)) readXRHeadPosition(v, entity, shouldWrite)
  if (checkBitflag(changeMask, 1 << b++)) readXRHeadRotation(v, entity, shouldWrite)

  if (checkBitflag(changeMask, 1 << b++)) readXRControllerLeftPosition(v, entity, shouldWrite)
  if (checkBitflag(changeMask, 1 << b++)) readXRControllerLeftRotation(v, entity, shouldWrite)

  if (checkBitflag(changeMask, 1 << b++)) readXRControllerGripLeftPosition(v, entity, shouldWrite)
  if (checkBitflag(changeMask, 1 << b++)) readXRControllerGripLeftRotation(v, entity, shouldWrite)

  if (checkBitflag(changeMask, 1 << b++)) readXRControllerRightPosition(v, entity, shouldWrite)
  if (checkBitflag(changeMask, 1 << b++)) readXRControllerRightRotation(v, entity, shouldWrite)

  if (checkBitflag(changeMask, 1 << b++)) readXRControllerGripRightPosition(v, entity, shouldWrite)
  if (checkBitflag(changeMask, 1 << b++)) readXRControllerGripRightRotation(v, entity, shouldWrite)
}

export const readEntity = (v: ViewCursor, world: World, fromUserId: UserId) => {
  const netId = readUint32(v) as NetworkId
  const changeMask = readUint8(v)

  const entity = world.getNetworkObject(fromUserId, netId)
  const shouldWrite = entity && !hasComponent(entity, NetworkObjectAuthorityTag)

  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readTransform(v, entity)
  if (checkBitflag(changeMask, 1 << b++)) readVelocity(v, entity)
  if (checkBitflag(changeMask, 1 << b++)) readXRInputs(v, entity)

  const nameComponent = getComponent(entity, NameComponent)
  console.log('network state set for:', nameComponent.name, world.fixedTick)
  const network = getComponent(entity, NetworkObjectComponent)
  network.lastTick = world.fixedTick
}

export const readEntities = (v: ViewCursor, world: World, byteLength: number, fromUserId: UserId) => {
  while (v.cursor < byteLength) {
    const count = readUint32(v)
    for (let i = 0; i < count; i++) {
      readEntity(v, world, fromUserId)
    }
  }
}

export const readMetadata = (v: ViewCursor, world: World) => {
  const userIndex = readUint32(v)
  const fixedTick = readUint32(v)
  if (userIndex === world.userIdToUserIndex.get(world.hostId)! && !world.isHosting) world.fixedTick = fixedTick
  return userIndex
}

export const createDataReader = () => {
  return (world: World, packet: ArrayBuffer) => {
    const view = createViewCursor(packet)
    const userIndex = readMetadata(view, world)
    const fromUserId = world.userIndexToUserId.get(userIndex)
    if (fromUserId) readEntities(view, world, packet.byteLength, fromUserId)
  }
}
