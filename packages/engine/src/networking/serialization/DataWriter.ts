import { Group } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRHandsInputComponent } from '../../xr/components/XRHandsInputComponent'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { XRHandBones } from '../../xr/types/XRHandBones'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { compress, FLOAT_PRECISION_MULT, QUAT_MAX_RANGE } from './Utils'
import { flatten, getVector4IndexBasedComponentValue, Vector3SoA, Vector4SoA } from './Utils'
import {
  createViewCursor,
  rewindViewCursor,
  sliceViewCursor,
  spaceUint8,
  spaceUint16,
  spaceUint32,
  spaceUint64,
  ViewCursor,
  writeInt16,
  writePropIfChanged,
  writeUint8,
  writeUint16,
  writeUint32
} from './ViewCursor'

/**
 * Writes a component dynamically
 * (less efficient than statically due to inner loop)
 *
 * @param  {any} component
 */
export const writeComponent = (component: any) => {
  // todo: test performance of using flatten in the return scope vs this scope
  const props = flatten(component)

  const changeMaskSpacer =
    props.length <= 8 ? spaceUint8 : props.length <= 16 ? spaceUint16 : props.length <= 32 ? spaceUint32 : spaceUint64

  return (v: ViewCursor, entity: Entity) => {
    const rewind = rewindViewCursor(v)
    const writeChangeMask = changeMaskSpacer(v)
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

// Writes a compressed Quaternion value to the network stream. This function uses the "smallest three"
// method, which is well summarized here: http://gafferongames.com/networked-physics/snapshot-compression/
export const writeCompressedRotation = (vector4: Vector4SoA) => (v: ViewCursor, entity: Entity) => {
  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  const rewindUptoChageMask = rewindViewCursor(v)
  let changeMask = 0
  let b = 0

  // Todo: writeVector4 here? how to handle rewind than.
  // Write to store
  changeMask |= writePropIfChanged(v, vector4.x, entity) ? 1 << b++ : b++ && 0
  changeMask |= writePropIfChanged(v, vector4.y, entity) ? 1 << b++ : b++ && 0
  changeMask |= writePropIfChanged(v, vector4.z, entity) ? 1 << b++ : b++ && 0
  changeMask |= writePropIfChanged(v, vector4.w, entity) ? 1 << b++ : b++ && 0

  // Write to ViewCursor
  if (changeMask > 0) {
    rewindUptoChageMask()
    let maxIndex = 0
    let maxValue = Number.MIN_VALUE
    let sign = 1

    // Determine the index of the largest (absolute value) element in the Quaternion.
    // We will transmit only the three smallest elements, and reconstruct the largest
    // element during decoding.
    for (let i = 0; i < 4; i++) {
      let element = getVector4IndexBasedComponentValue(vector4, entity, i) as number
      let abs = Math.abs(element)
      if (abs > maxValue) {
        // We don't need to explicitly transmit the sign bit of the omitted element because you
        // can make the omitted element always positive by negating the entire quaternion if
        // the omitted element is negative (in quaternion space (x,y,z,w) and (-x,-y,-z,-w)
        // represent the same rotation.), but we need to keep track of the sign for use below.
        sign = element < 0 ? -1 : 1

        // Keep track of the index of the largest element
        maxIndex = i
        maxValue = abs
      }
    }

    let a = 0
    let b = 0
    let c = 0

    if (maxIndex === 0) {
      a = vector4.y[entity]
      b = vector4.z[entity]
      c = vector4.w[entity]
    } else if (maxIndex === 1) {
      a = vector4.x[entity]
      b = vector4.z[entity]
      c = vector4.w[entity]
    } else if (maxIndex === 2) {
      a = vector4.x[entity]
      b = vector4.y[entity]
      c = vector4.w[entity]
    } else {
      a = vector4.x[entity]
      b = vector4.y[entity]
      c = vector4.z[entity]
    }

    // Multiply with QUAT_MAX_RANGE & FLOAT_PRECISION_MULT before compression so that values are
    // capped to required range([-0.707107,+0.707107]) and precision(three decimal places)
    a *= sign * QUAT_MAX_RANGE * FLOAT_PRECISION_MULT
    b *= sign * QUAT_MAX_RANGE * FLOAT_PRECISION_MULT
    c *= sign * QUAT_MAX_RANGE * FLOAT_PRECISION_MULT

    maxIndex = maxIndex | 0

    a = compress(a)
    b = compress(b)
    c = compress(c)

    let binaryData = maxIndex
    binaryData = binaryData << 10
    binaryData = binaryData | a
    binaryData = binaryData << 10
    binaryData = binaryData | b
    binaryData = binaryData << 10
    binaryData = binaryData | c

    writeUint32(v, binaryData)
  }

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const writePosition = writeVector3(TransformComponent.position)
export const writeLinearVelocity = writeVector3(VelocityComponent.linear)
export const writeAngularVelocity = writeVector3(VelocityComponent.angular)
export const writeRotation = writeCompressedRotation(TransformComponent.rotation)

export const writeTransform = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, TransformComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  changeMask |= writePosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeRotation(v, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const writeVelocity = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, VelocityComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  changeMask |= writeLinearVelocity(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeAngularVelocity(v, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const writeXRContainerPosition = writeVector3(XRInputSourceComponent.container.position)
export const writeXRContainerRotation = writeCompressedRotation(XRInputSourceComponent.container.quaternion)

export const writeXRHeadPosition = writeVector3(XRInputSourceComponent.head.position)
export const writeXRHeadRotation = writeCompressedRotation(XRInputSourceComponent.head.quaternion)

export const writeXRControllerLeftPosition = writeVector3(XRInputSourceComponent.controllerLeftParent.position)
export const writeXRControllerLeftRotation = writeCompressedRotation(
  XRInputSourceComponent.controllerLeftParent.quaternion
)

export const writeXRControllerGripLeftPosition = writeVector3(XRInputSourceComponent.controllerGripLeftParent.position)
export const writeXRControllerGripLeftRotation = writeCompressedRotation(
  XRInputSourceComponent.controllerGripLeftParent.quaternion
)

export const writeXRControllerRightPosition = writeVector3(XRInputSourceComponent.controllerRightParent.position)
export const writeXRControllerRightRotation = writeCompressedRotation(
  XRInputSourceComponent.controllerRightParent.quaternion
)

export const writeXRControllerGripRightPosition = writeVector3(
  XRInputSourceComponent.controllerGripRightParent.position
)
export const writeXRControllerGripRightRotation = writeCompressedRotation(
  XRInputSourceComponent.controllerGripRightParent.quaternion
)

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

export const writeXRHandBoneJoints = (v: ViewCursor, entity: Entity, handedness, bone: string[]) => {
  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint16(v)
  let changeMask = 0
  let b = 0

  bone.forEach((jointName) => {
    changeMask |= writeVector3(XRHandsInputComponent[handedness][jointName].position)(v, entity) ? 1 << b++ : b++ && 0
    changeMask |= writeCompressedRotation(XRHandsInputComponent[handedness][jointName].quaternion)(v, entity)
      ? 1 << b++
      : b++ && 0
  })

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const writeXRHandBones = (v: ViewCursor, entity: Entity, hand: Group) => {
  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint16(v)
  const writeHandedness = spaceUint8(v)
  let changeMask = 0
  let b = 0

  let handednessBitValue = 0

  // Only write if hand is connected.
  if (hand.userData.mesh) {
    const handMesh = hand.userData.mesh
    const handedness = handMesh.handedness
    handednessBitValue = handedness === 'left' ? 0 : 1

    XRHandBones.forEach((bone) => {
      changeMask |= writeXRHandBoneJoints(v, entity, handedness, bone) ? 1 << b++ : b++ && 0
    })
  }

  return (changeMask > 0 && writeChangeMask(changeMask) && writeHandedness(handednessBitValue)) || rewind()
}

export const writeXRHands = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, XRHandsInputComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint16(v)
  let changeMask = 0
  let b = 0

  const xrHandsComponent = getComponent(entity as Entity, XRHandsInputComponent)
  xrHandsComponent.hands.forEach((hand) => {
    changeMask |= writeXRHandBones(v, entity, hand) ? 1 << b++ : b++ && 0
  })

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const writeEntity = (v: ViewCursor, networkId: NetworkId, entity: Entity) => {
  const rewind = rewindViewCursor(v)

  const writeNetworkId = spaceUint32(v)

  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  changeMask |= writeTransform(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeVelocity(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRInputs(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRHands(v, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeNetworkId(networkId) && writeChangeMask(changeMask)) || rewind()
}

export const writeEntities = (v: ViewCursor, entities: Entity[]) => {
  const writeCount = spaceUint32(v)

  let count = 0
  for (let i = 0, l = entities.length; i < l; i++) {
    const entity = entities[i]
    const networkId = NetworkObjectComponent.networkId[entity] as NetworkId
    count += writeEntity(v, networkId, entity) ? 1 : 0
  }

  if (count > 0) writeCount(count)
  else v.cursor = 0 // nothing written
}

export const writeMetadata = (v: ViewCursor, world: World) => {
  writeUint32(v, world.userIdToUserIndex.get(Engine.instance.userId)!)
  writeUint32(v, world.fixedTick)
}

export const createDataWriter = (size: number = 100000) => {
  const view = createViewCursor(new ArrayBuffer(size))

  return (world: World, entities: Entity[]) => {
    writeMetadata(view, world)
    writeEntities(view, entities)
    return sliceViewCursor(view)
  }
}
