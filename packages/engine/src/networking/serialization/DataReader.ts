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

import { TypedArray } from 'bitecs'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getState } from '@etherealengine/hyperflux'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { hasComponent } from '../../ecs/functions/ComponentFunctions'
// import { XRHandsInputComponent } from '../../xr/XRComponents'
// import { XRHandBones } from '../../xr/XRHandBones'
import { Network } from '../classes/Network'
import { NetworkObjectAuthorityTag, NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkState } from '../NetworkState'
import {
  expand,
  flatten,
  QUAT_MAX_RANGE,
  QUAT_PRECISION_MULT,
  SerializationSchema,
  VEC3_MAX_RANGE,
  VEC3_PRECISION_MULT,
  Vector3SoA,
  Vector4SoA
} from './Utils'
import {
  createViewCursor,
  readFloat64,
  readProp,
  readUint16,
  readUint32,
  readUint64,
  readUint8,
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

export const readComponentProp = (v: ViewCursor, prop: TypedArray, entity: Entity) => {
  if (entity) prop[entity] = readProp(v, prop)
  else readProp(v, prop)
}

export const readVector3 = (vector3: Vector3SoA) => (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector3.x, entity)
  if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector3.y, entity)
  if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector3.z, entity)
}

// Reads a compressed Vector3 from the DataView. This must have been previously written
// with writeCompressedVector3() in order to be properly decompressed.
export const readCompressedVector3 = (vector3: Vector3SoA) => (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  if (changeMask <= 0) return

  let compressedBinaryData = readUint32(v)

  let z = expand(compressedBinaryData, 10)
  compressedBinaryData = compressedBinaryData >>> 10
  let y = expand(compressedBinaryData, 10)
  compressedBinaryData = compressedBinaryData >>> 10
  let x = expand(compressedBinaryData, 10)
  compressedBinaryData = compressedBinaryData >>> 10

  let offset_mult = 1
  /** @todo this should be passed */
  if (entity && hasComponent(entity, AvatarComponent)) offset_mult = 100

  x /= VEC3_MAX_RANGE * VEC3_PRECISION_MULT * offset_mult
  y /= VEC3_MAX_RANGE * VEC3_PRECISION_MULT * offset_mult
  z /= VEC3_MAX_RANGE * VEC3_PRECISION_MULT * offset_mult

  if (entity) {
    vector3.x[entity] = x
    vector3.y[entity] = y
    vector3.z[entity] = z
  } else {
    // readComponentProp(v, vector3.x, entity)
    // readComponentProp(v, vector3.y, entity)
    // readComponentProp(v, vector3.z, entity)
  }
}

export const readVector4 = (vector4: Vector4SoA) => (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector4.x, entity)
  if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector4.y, entity)
  if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector4.z, entity)
  if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, vector4.w, entity)
}

// Reads a compressed rotation value from the DataView. This value must have been previously written
// with WriteCompressedRotation() in order to be properly decompressed.
export const readCompressedRotation = (vector4: Vector4SoA) => (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  if (changeMask <= 0) return

  let compressedBinaryData = readUint32(v)

  // Read the other three fields and derive the value of the omitted field
  let c = expand(compressedBinaryData, 10)
  compressedBinaryData = compressedBinaryData >>> 10
  let b = expand(compressedBinaryData, 10)
  compressedBinaryData = compressedBinaryData >>> 10
  let a = expand(compressedBinaryData, 10)
  compressedBinaryData = compressedBinaryData >>> 10

  const bitMaskForMaxIndex = 0b00000000000000000000000000000011
  let maxIndex = compressedBinaryData & bitMaskForMaxIndex

  a /= QUAT_MAX_RANGE * QUAT_PRECISION_MULT
  b /= QUAT_MAX_RANGE * QUAT_PRECISION_MULT
  c /= QUAT_MAX_RANGE * QUAT_PRECISION_MULT
  let d = Math.sqrt(1 - (a * a + b * b + c * c))

  let x, y, z, w
  if (maxIndex === 0) {
    x = d
    y = a
    z = b
    w = c
  } else if (maxIndex === 1) {
    x = a
    y = d
    z = b
    w = c
  } else if (maxIndex === 2) {
    x = a
    y = b
    z = d
    w = c
  } else {
    x = a
    y = b
    z = c
    w = d
  }

  if (entity) {
    vector4.x[entity] = x
    vector4.y[entity] = y
    vector4.z[entity] = z
    vector4.w[entity] = w
  } else {
    // readComponentProp(v, vector4.x, entity)
    // readComponentProp(v, vector4.y, entity)
    // readComponentProp(v, vector4.z, entity)
    // readComponentProp(v, vector4.w, entity)
  }
}

export const readEntity = (
  v: ViewCursor,
  network: Network,
  fromUserId: UserId,
  serializationSchema: SerializationSchema[]
) => {
  const netId = readUint32(v) as NetworkId
  const ownerIndex = readUint32(v) as NetworkId
  const changeMask = readUint8(v)

  const ownerId = network.userIndexToUserID.get(ownerIndex)!

  let entity = NetworkObjectComponent.getNetworkObject(ownerId, netId)
  if (entity && hasComponent(entity, NetworkObjectAuthorityTag)) entity = UndefinedEntity

  let b = 0

  for (const component of serializationSchema) {
    if (checkBitflag(changeMask, 1 << b++)) component.read(v, entity)
  }
}

export const readEntities = (v: ViewCursor, network: Network, byteLength: number, fromUserID: UserId) => {
  const entitySchema = Object.values(getState(NetworkState).networkSchema)
  while (v.cursor < byteLength) {
    const count = readUint32(v)
    for (let i = 0; i < count; i++) {
      readEntity(v, network, fromUserID, entitySchema)
    }
  }
}

export const readMetadata = (v: ViewCursor) => {
  const userIndex = readUint32(v)
  const peerIndex = readUint32(v)
  const simulationTime = readFloat64(v)
  // if (userIndex === world.peerIDToUserIndex.get(Engine.instance.worldNetwork.hostId)! && !Engine.instance.worldNetwork.isHosting) Engine.instance.fixedTick = fixedTick
  return { userIndex, peerIndex, simulationTime }
}

export const readDataPacket = (network: Network, packet: ArrayBuffer) => {
  const view = createViewCursor(packet)
  const { userIndex, peerIndex, simulationTime } = readMetadata(view)
  const fromUserID = network.userIndexToUserID.get(userIndex)
  const fromPeerID = network.peerIndexToPeerID.get(peerIndex)
  const isLoopback = fromPeerID && fromPeerID === Engine.instance.peerID
  if (!fromUserID || isLoopback) return
  network.jitterBufferTaskList.push({
    simulationTime,
    read: () => {
      readEntities(view, network, packet.byteLength, fromUserID)
    }
  })
}
