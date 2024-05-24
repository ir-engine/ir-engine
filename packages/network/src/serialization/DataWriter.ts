/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { getComponent, hasComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { PeerID, getState } from '@etherealengine/hyperflux'

import { Network } from '../Network'
import { NetworkObjectComponent, NetworkObjectSendPeriodicUpdatesTag } from '../NetworkObjectComponent'
import { NetworkState } from '../NetworkState'
import {
  QUAT_MAX_RANGE,
  QUAT_PRECISION_MULT,
  SerializationSchema,
  VEC3_MAX_RANGE,
  VEC3_PRECISION_MULT,
  Vector3SoA,
  Vector4SoA,
  compress,
  flatten,
  getVector4IndexBasedComponentValue
} from './Utils'
import {
  ViewCursor,
  createViewCursor,
  rewindViewCursor,
  sliceViewCursor,
  spaceUint16,
  spaceUint32,
  spaceUint64,
  spaceUint8,
  writeFloat64,
  writePropIfChanged,
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

  return (v: ViewCursor, entity: Entity, ignoreHasChanged = false) => {
    const rewind = rewindViewCursor(v)
    const writeChangeMask = changeMaskSpacer(v)
    let changeMask = 0

    for (let i = 0; i < props.length; i++) {
      changeMask |= writePropIfChanged(v, props[i], entity, ignoreHasChanged) ? 2 ** i : 0b0
    }

    writeChangeMask(changeMask)

    return changeMask > 0 || rewind()
  }
}

export const writeVector3 =
  (vector3: Vector3SoA) =>
  (v: ViewCursor, entity: Entity, ignoreHasChanged = false) => {
    const rewind = rewindViewCursor(v)
    const writeChangeMask = spaceUint8(v)
    let changeMask = 0
    let b = 0

    changeMask |= writePropIfChanged(v, vector3.x, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
    changeMask |= writePropIfChanged(v, vector3.y, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
    changeMask |= writePropIfChanged(v, vector3.z, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0

    return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
  }

// Writes a compressed Vector3 value to the DataView.
export const writeCompressedVector3 =
  (vector3: Vector3SoA, offset_mult = 1) =>
  (v: ViewCursor, entity: Entity) => {
    const rewind = rewindViewCursor(v)
    const writeChangeMask = spaceUint8(v)
    const rewindUptoChageMask = rewindViewCursor(v)
    let changeMask = 0
    let b = 0

    const ignoreHasChanged =
      hasComponent(entity, NetworkObjectSendPeriodicUpdatesTag) &&
      getState(ECSState).simulationTime % getState(ECSState).periodicUpdateFrequency === 0

    changeMask |= writePropIfChanged(v, vector3.x, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
    changeMask |= writePropIfChanged(v, vector3.y, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
    changeMask |= writePropIfChanged(v, vector3.z, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0

    if (changeMask > 0) {
      rewindUptoChageMask()
      let [x, y, z] = [vector3.x[entity], vector3.y[entity], vector3.z[entity]]

      x *= VEC3_MAX_RANGE * VEC3_PRECISION_MULT * offset_mult
      y *= VEC3_MAX_RANGE * VEC3_PRECISION_MULT * offset_mult
      z *= VEC3_MAX_RANGE * VEC3_PRECISION_MULT * offset_mult

      x = compress(x, 10)
      y = compress(y, 10)
      z = compress(z, 10)

      let binaryData = 0
      binaryData = binaryData | x
      binaryData = binaryData << 10
      binaryData = binaryData | y
      binaryData = binaryData << 10
      binaryData = binaryData | z

      writeUint32(v, binaryData)
    }

    return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
  }

export const writeVector4 =
  (vector4: Vector4SoA) =>
  (v: ViewCursor, entity: Entity, ignoreHasChanged = false) => {
    const rewind = rewindViewCursor(v)
    const writeChangeMask = spaceUint8(v)
    let changeMask = 0
    let b = 0

    changeMask |= writePropIfChanged(v, vector4.x, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
    changeMask |= writePropIfChanged(v, vector4.y, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
    changeMask |= writePropIfChanged(v, vector4.z, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
    changeMask |= writePropIfChanged(v, vector4.w, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0

    return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
  }

// Writes a compressed Quaternion value to the DataView. This function uses the "smallest three"
// method, which is well summarized here: http://gafferongames.com/networked-physics/snapshot-compression/
export const writeCompressedRotation =
  (vector4: Vector4SoA) =>
  (v: ViewCursor, entity: Entity, ignoreHasChanged = false) => {
    const rewind = rewindViewCursor(v)
    const writeChangeMask = spaceUint8(v)
    const rewindUptoChageMask = rewindViewCursor(v)
    let changeMask = 0
    let b = 0

    // Todo: writeVector4 here? how to handle rewind than.
    // Write to store
    changeMask |= writePropIfChanged(v, vector4.x, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
    changeMask |= writePropIfChanged(v, vector4.y, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
    changeMask |= writePropIfChanged(v, vector4.z, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
    changeMask |= writePropIfChanged(v, vector4.w, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0

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
      a *= sign * QUAT_MAX_RANGE * QUAT_PRECISION_MULT
      b *= sign * QUAT_MAX_RANGE * QUAT_PRECISION_MULT
      c *= sign * QUAT_MAX_RANGE * QUAT_PRECISION_MULT

      maxIndex = maxIndex | 0

      a = compress(a, 10)
      b = compress(b, 10)
      c = compress(c, 10)

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

export const writeEntity = (
  v: ViewCursor,
  networkId: NetworkId,
  ownerIndex: number,
  entity: Entity,
  serializationSchema: SerializationSchema[]
) => {
  const rewind = rewindViewCursor(v)

  const writeNetworkId = spaceUint32(v)
  const writeOwnerIndex = spaceUint32(v)

  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  for (const component of serializationSchema) {
    changeMask |= component.write(v, entity) ? 1 << b++ : b++ && 0
  }

  return (
    (changeMask > 0 && writeNetworkId(networkId) && writeOwnerIndex(ownerIndex) && writeChangeMask(changeMask)) ||
    rewind()
  )
}

export const writeEntities = (v: ViewCursor, network: Network, entities: Entity[]) => {
  const entitySchema = NetworkState.orderedNetworkSchema

  const writeCount = spaceUint32(v)

  let count = 0
  for (let i = 0, l = entities.length; i < l; i++) {
    const entity = entities[i]
    const networkId = NetworkObjectComponent.networkId[entity] as NetworkId
    const ownerPeer = getComponent(entity, NetworkObjectComponent).ownerPeer
    const ownerPeerIndex = network.peerIDToPeerIndex[ownerPeer]!

    count += writeEntity(v, networkId, ownerPeerIndex, entity, entitySchema) ? 1 : 0
  }

  if (count > 0) writeCount(count)
  else v.cursor = 0 // nothing written
}

export const writeMetadata = (v: ViewCursor, network: Network, peerID: PeerID) => {
  writeUint32(v, network.peerIDToPeerIndex[peerID])
  writeFloat64(v, getState(ECSState).simulationTime)
}

export const createDataWriter = (size = 100000) => {
  const view = createViewCursor(new ArrayBuffer(size))

  return (network: Network, peerID: PeerID, entities: Entity[]) => {
    writeMetadata(view, network, peerID)
    writeEntities(view, network, entities)
    return sliceViewCursor(view)
  }
}
