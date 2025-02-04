/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Types } from '@ir-engine/ecs'
import assert, { strictEqual } from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { EngineState } from '@ir-engine/ecs'
import { defineComponent, hasComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Engine, createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { PeerID, UserID, applyIncomingActions, dispatchAction, getMutableState, getState } from '@ir-engine/hyperflux'
import { NetworkId } from '@ir-engine/network/src/NetworkId'

import { roundNumberToPlaces } from '../../tests/MathTestUtils'
import { createMockNetwork } from '../../tests/createMockNetwork'
import { Network, NetworkTopics } from '../Network'
import {
  NetworkObjectAuthorityTag,
  NetworkObjectComponent,
  NetworkObjectSendPeriodicUpdatesTag
} from '../NetworkObjectComponent'
import { NetworkActions, NetworkState } from '../NetworkState'
import {
  checkBitflag,
  readComponentProp,
  readCompressedVector3,
  readEntities,
  readEntity,
  readMetadata,
  readVector3,
  readVector4
} from './DataReader'
import {
  createDataWriter,
  writeCompressedVector3,
  writeEntities,
  writeEntity,
  writeVector3,
  writeVector4
} from './DataWriter'
import { Vector3SoA } from './Utils'
import {
  ViewCursor,
  createViewCursor,
  readFloat64,
  readUint32,
  readUint8,
  rewindViewCursor,
  sliceViewCursor,
  spaceUint8,
  writeProp
} from './ViewCursor'

const { f64 } = Types

const MockPoseComponent = defineComponent({
  name: 'MockPoseComponent_Reader',
  schema: {
    Vec3: { x: f64, y: f64, z: f64 },
    Quat: { x: f64, y: f64, z: f64, w: f64 }
  }
})

const readPosition = readVector3(MockPoseComponent.Vec3)
const writePosition = writeVector3(MockPoseComponent.Vec3)
const readRotation = readVector4(MockPoseComponent.Quat)
const writeRotation = writeVector4(MockPoseComponent.Quat)

describe('DataReader', () => {
  beforeEach(() => {
    createEngine()
    createMockNetwork(NetworkTopics.world, 'host peer id' as PeerID, 'host user id' as UserID)

    getMutableState(NetworkState).networkSchema.merge({
      mock: {
        read: (v: ViewCursor, entity: Entity) => {
          const changeMask = readUint8(v)
          let b = 0
          if (checkBitflag(changeMask, 1 << b++)) readPosition(v, entity)
          if (checkBitflag(changeMask, 1 << b++)) readRotation(v, entity)
        },
        write: (v: ViewCursor, entity: Entity) => {
          const rewind = rewindViewCursor(v)
          const writeChangeMask = spaceUint8(v)
          let changeMask = 0
          let b = 0

          const ignoreHasChanged =
            hasComponent(entity, NetworkObjectSendPeriodicUpdatesTag) &&
            Math.round(getState(ECSState).simulationTime % getState(ECSState).periodicUpdateFrequency) === 0

          changeMask |= writePosition(v, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
          changeMask |= writeRotation(v, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0

          return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
        }
      }
    })
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should checkBitflag', () => {
    const A = 2 ** 0
    const B = 2 ** 1
    const C = 2 ** 2
    const mask = A | C
    strictEqual(checkBitflag(mask, A), true)
    strictEqual(checkBitflag(mask, B), false)
    strictEqual(checkBitflag(mask, C), true)
  })

  it('should readComponentProp', () => {
    const view = createViewCursor()
    const entity = createEntity()
    setComponent(entity, MockPoseComponent)

    const prop = MockPoseComponent.Vec3.x

    prop[entity] = 1.5

    writeProp(view, prop, entity)

    prop[entity] = 0

    view.cursor = 0

    readComponentProp(view, prop, entity)

    strictEqual(prop[entity], 1.5)
  })

  it('should readVector3', () => {
    const view = createViewCursor()
    const entity = createEntity()
    setComponent(entity, MockPoseComponent)
    const position = MockPoseComponent.Vec3 as Vector3SoA
    const [x, y, z] = [1.5, 2.5, 3.5]
    position.x[entity] = x
    position.y[entity] = y
    position.z[entity] = z

    writePosition(view, entity)

    position.x[entity] = 0
    position.y[entity] = 0
    position.z[entity] = 0

    view.cursor = 0

    readPosition(view, entity)

    strictEqual(MockPoseComponent.Vec3.x[entity], x)
    strictEqual(MockPoseComponent.Vec3.y[entity], y)
    strictEqual(MockPoseComponent.Vec3.z[entity], z)

    position.y[entity] = 10.5

    view.cursor = 0

    writePosition(view, entity)

    strictEqual(MockPoseComponent.Vec3.x[entity], x)
    strictEqual(MockPoseComponent.Vec3.y[entity], 10.5)
    strictEqual(MockPoseComponent.Vec3.z[entity], z)
  })

  it('should readVector4', () => {
    const view = createViewCursor()
    const entity = createEntity()
    setComponent(entity, MockPoseComponent)
    const rotation = MockPoseComponent.Quat
    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]
    rotation.x[entity] = x
    rotation.y[entity] = y
    rotation.z[entity] = z
    rotation.w[entity] = w

    const readRotation = readVector4(rotation)
    const writeRotation = writeVector4(rotation)

    writeRotation(view, entity)

    rotation.x[entity] = 0
    rotation.y[entity] = 0
    rotation.z[entity] = 0
    rotation.w[entity] = 0

    view.cursor = 0

    readRotation(view, entity)

    strictEqual(MockPoseComponent.Quat.x[entity], x)
    strictEqual(MockPoseComponent.Quat.y[entity], y)
    strictEqual(MockPoseComponent.Quat.z[entity], z)
    strictEqual(MockPoseComponent.Quat.w[entity], w)

    rotation.y[entity] = 10.5
    rotation.w[entity] = 11.5

    view.cursor = 0

    writeRotation(view, entity)

    strictEqual(MockPoseComponent.Quat.x[entity], x)
    strictEqual(MockPoseComponent.Quat.y[entity], 10.5)
    strictEqual(MockPoseComponent.Quat.z[entity], z)
    strictEqual(MockPoseComponent.Quat.w[entity], 11.5)
  })

  it('should readPosition', () => {
    const view = createViewCursor()
    const entity = createEntity()
    setComponent(entity, MockPoseComponent)
    const position = MockPoseComponent.Vec3
    const [x, y, z] = [1.5, 2.5, 3.5]
    position.x[entity] = x
    position.y[entity] = y
    position.z[entity] = z

    writePosition(view, entity)

    position.x[entity] = 0
    position.y[entity] = 0
    position.z[entity] = 0

    view.cursor = 0

    readPosition(view, entity)

    strictEqual(MockPoseComponent.Vec3.x[entity], x)
    strictEqual(MockPoseComponent.Vec3.y[entity], y)
    strictEqual(MockPoseComponent.Vec3.z[entity], z)

    position.y[entity] = 10.5

    view.cursor = 0

    writePosition(view, entity)

    strictEqual(MockPoseComponent.Vec3.x[entity], x)
    strictEqual(MockPoseComponent.Vec3.y[entity], 10.5)
    strictEqual(MockPoseComponent.Vec3.z[entity], z)
  })

  it('should readCompressedRotation', () => {
    const view = createViewCursor()
    const entity = createEntity()
    setComponent(entity, MockPoseComponent)
    const rotation = MockPoseComponent.Quat
    setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [x, y, z, w] = [a, b, c, d]
    rotation.x[entity] = x
    rotation.y[entity] = y
    rotation.z[entity] = z
    rotation.w[entity] = w

    writeRotation(view, entity)

    rotation.x[entity] = 0
    rotation.y[entity] = 0
    rotation.z[entity] = 0
    rotation.w[entity] = 0

    view.cursor = 0

    readRotation(view, entity)

    strictEqual(view.cursor, Uint8Array.BYTES_PER_ELEMENT + Float64Array.BYTES_PER_ELEMENT * 4)

    // Round values to 3 decimal places and compare
    strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.x[entity], 3), roundNumberToPlaces(x, 3))
    strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.y[entity], 3), roundNumberToPlaces(y, 3))
    strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.z[entity], 3), roundNumberToPlaces(z, 3))
    strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.w[entity], 3), roundNumberToPlaces(w, 3))
  })

  it('should readCompressedVector3', () => {
    const view = createViewCursor()
    const entity = createEntity()
    setComponent(entity, MockPoseComponent)
    setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

    const [x, y, z] = [1.333, 2.333, 3.333]
    MockPoseComponent.Vec3.x[entity] = x
    MockPoseComponent.Vec3.y[entity] = y
    MockPoseComponent.Vec3.z[entity] = z

    writeCompressedVector3(MockPoseComponent.Vec3)(view, entity)

    MockPoseComponent.Vec3.x[entity] = 0
    MockPoseComponent.Vec3.y[entity] = 0
    MockPoseComponent.Vec3.z[entity] = 0

    view.cursor = 0

    readCompressedVector3(MockPoseComponent.Vec3)(view, entity)

    strictEqual(view.cursor, Uint8Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT)

    // Round values to 3 decimal places and compare
    strictEqual(roundNumberToPlaces(MockPoseComponent.Vec3.x[entity], 1), roundNumberToPlaces(x, 1))
    strictEqual(roundNumberToPlaces(MockPoseComponent.Vec3.y[entity], 1), roundNumberToPlaces(y, 1))
    strictEqual(roundNumberToPlaces(MockPoseComponent.Vec3.z[entity], 1), roundNumberToPlaces(z, 1))
  })

  // it('should readXRHands', () => {
  //   const view = createViewCursor()
  //   const entity = createEntity()

  //   let joints = []
  //   XRHandBones.forEach((bone) => {
  //     joints = joints.concat(bone as any)
  //   })

  //   // construct values for a valid quaternion
  //   const [a, b, c] = [0.167, 0.167, 0.167]
  //   let d = Math.sqrt(1 - (a * a + b * b + c * c))

  //   const [posX, posY, posZ] = [1.5, 2.5, 3.5]
  //   const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

  //   const hands = [new Group(), new Group()]
  //   hands[0].userData.handedness = 'left'
  //   hands[1].userData.handedness = 'right'

  //   hands.forEach((hand) => {
  //     // setup mock hand state
  //     const handedness = hand.userData.handedness
  //     const dummyXRHandMeshModel = new Group() as any
  //     dummyXRHandMeshModel.handedness = handedness
  //     hand.userData.mesh = dummyXRHandMeshModel

  //     // proxify and copy values
  //     joints.forEach((jointName) => {
  //       proxifyVector3(MockComponent.Vec3, entity).set(posX, posY, posZ)
  //       proxifyQuaternion(MockComponent.Quat, entity).set(rotX, rotY, rotZ, rotW)
  //     })
  //   })

  //   // add component
  //   addComponent(entity, XRHandsInputComponent, { hands: hands })

  //   writeXRHands(view, entity)

  //   // reset joint pos and rot to zero
  //   hands.forEach((hand) => {
  //     const handedness = hand.userData.handedness

  //     joints.forEach((jointName) => {
  //       XRHandsInputComponent[handedness][jointName].position.x[entity] = 0
  //       XRHandsInputComponent[handedness][jointName].position.y[entity] = 0
  //       XRHandsInputComponent[handedness][jointName].position.z[entity] = 0

  //       XRHandsInputComponent[handedness][jointName].quaternion.x[entity] = 0
  //       XRHandsInputComponent[handedness][jointName].quaternion.y[entity] = 0
  //       XRHandsInputComponent[handedness][jointName].quaternion.z[entity] = 0
  //       XRHandsInputComponent[handedness][jointName].quaternion.w[entity] = 0
  //     })
  //   })

  //   view.cursor = 0

  //   readXRHands(view, entity)

  //   hands.forEach((hand) => {
  //     const handedness = hand.userData.handedness

  //     joints.forEach((jointName) => {
  //       strictEqual(MockComponent.Vec3.x[entity], posX)
  //       strictEqual(MockComponent.Vec3.y[entity], posY)
  //       strictEqual(MockComponent.Vec3.z[entity], posZ)
  //       // Round values to 3 decimal places and compare
  //       strictEqual(roundNumberToPlaces(MockComponent.Quat.x[entity], 3), roundNumberToPlaces(rotX, 3))
  //       strictEqual(roundNumberToPlaces(MockComponent.Quat.y[entity], 3), roundNumberToPlaces(rotY, 3))
  //       strictEqual(roundNumberToPlaces(MockComponent.Quat.z[entity], 3), roundNumberToPlaces(rotZ, 3))
  //       strictEqual(roundNumberToPlaces(MockComponent.Quat.w[entity], 3), roundNumberToPlaces(rotW, 3))
  //     })
  //   })
  // })

  it('should readEntity', () => {
    const view = createViewCursor()
    const entity = createEntity()
    setComponent(entity, NetworkObjectComponent)
    setComponent(entity, MockPoseComponent)
    const networkId = 5678 as NetworkId
    const network = NetworkState.worldNetwork as Network
    const userID = network.hostUserID!
    const peerID = network.hostPeerID!
    const peerIndex = 0

    NetworkObjectComponent.networkId[entity] = networkId

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [posX, posY, posZ] = [1.5, 2.5, 3.5]
    const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

    MockPoseComponent.Vec3.x[entity] = posX
    MockPoseComponent.Vec3.y[entity] = posY
    MockPoseComponent.Vec3.z[entity] = posZ
    MockPoseComponent.Quat.x[entity] = rotX
    MockPoseComponent.Quat.y[entity] = rotY
    MockPoseComponent.Quat.z[entity] = rotZ
    MockPoseComponent.Quat.w[entity] = rotW

    setComponent(entity, NetworkObjectComponent, {
      networkId,
      authorityPeerID: peerID,
      ownerPeer: peerID,
      ownerId: userID
    })

    writeEntity(view, networkId, peerIndex, entity, Object.values(getState(NetworkState).networkSchema))

    view.cursor = 0

    readEntity(view, network, peerID, Object.values(getState(NetworkState).networkSchema))

    strictEqual(MockPoseComponent.Vec3.x[entity], posX)
    strictEqual(MockPoseComponent.Vec3.y[entity], posY)
    strictEqual(MockPoseComponent.Vec3.z[entity], posZ)
    // Round values to 3 decimal places and compare
    strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.x[entity], 3), roundNumberToPlaces(rotX, 3))
    strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.y[entity], 3), roundNumberToPlaces(rotY, 3))
    strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.z[entity], 3), roundNumberToPlaces(rotZ, 3))
    strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.w[entity], 3), roundNumberToPlaces(rotW, 3))

    MockPoseComponent.Vec3.x[entity] = 0

    view.cursor = 0

    writeEntity(view, networkId, peerIndex, entity, Object.values(getState(NetworkState).networkSchema))

    MockPoseComponent.Vec3.x[entity] = posX

    view.cursor = 0

    readEntity(view, network, peerID, Object.values(getState(NetworkState).networkSchema))

    strictEqual(MockPoseComponent.Vec3.x[entity], 0)
    strictEqual(MockPoseComponent.Vec3.y[entity], posY)
    strictEqual(MockPoseComponent.Vec3.z[entity], posZ)
  })

  it('should not readEntity if reading back own data', () => {
    const view = createViewCursor()
    const entity = createEntity()
    setComponent(entity, NetworkObjectComponent)
    setComponent(entity, MockPoseComponent)
    const networkId = 5678 as NetworkId
    const network = NetworkState.worldNetwork as Network
    const userID = network.hostUserID!
    const peerID = network.hostPeerID!
    getMutableState(EngineState).userID.set(userID)
    const peerIndex = 0

    NetworkObjectComponent.networkId[entity] = networkId

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    MockPoseComponent.Vec3.x[entity] = x
    MockPoseComponent.Vec3.y[entity] = y
    MockPoseComponent.Vec3.z[entity] = z
    MockPoseComponent.Quat.x[entity] = x
    MockPoseComponent.Quat.y[entity] = y
    MockPoseComponent.Quat.z[entity] = z
    MockPoseComponent.Quat.w[entity] = w

    setComponent(entity, NetworkObjectComponent, {
      networkId,
      ownerPeer: peerID,
      authorityPeerID: peerID,
      ownerId: userID
    })

    setComponent(entity, NetworkObjectAuthorityTag)

    writeEntity(view, networkId, peerIndex, entity, Object.values(getState(NetworkState).networkSchema))

    view.cursor = 0

    // reset data on transform component
    MockPoseComponent.Vec3.x[entity] = 0
    MockPoseComponent.Vec3.y[entity] = 0
    MockPoseComponent.Vec3.z[entity] = 0
    MockPoseComponent.Quat.x[entity] = 0
    MockPoseComponent.Quat.y[entity] = 0
    MockPoseComponent.Quat.z[entity] = 0
    MockPoseComponent.Quat.w[entity] = 0

    // read entity will populate data stored in 'view'
    readEntity(view, network, peerID, Object.values(getState(NetworkState).networkSchema))

    // should no repopulate as we own this entity
    strictEqual(MockPoseComponent.Vec3.x[entity], 0)
    strictEqual(MockPoseComponent.Vec3.y[entity], 0)
    strictEqual(MockPoseComponent.Vec3.z[entity], 0)
    strictEqual(MockPoseComponent.Quat.x[entity], 0)
    strictEqual(MockPoseComponent.Quat.y[entity], 0)
    strictEqual(MockPoseComponent.Quat.z[entity], 0)
    strictEqual(MockPoseComponent.Quat.w[entity], 0)

    // should update the view cursor accordingly
    strictEqual(
      view.cursor,
      // network id
      Uint32Array.BYTES_PER_ELEMENT +
        // owner index
        Uint32Array.BYTES_PER_ELEMENT +
        // change mask for entity
        Uint8Array.BYTES_PER_ELEMENT +
        // change mask for transform
        Uint8Array.BYTES_PER_ELEMENT +
        // change mask for position
        Uint8Array.BYTES_PER_ELEMENT +
        // transform position
        Float64Array.BYTES_PER_ELEMENT * 3 +
        // change mask for rotation
        Uint8Array.BYTES_PER_ELEMENT +
        // transform rotation
        Float64Array.BYTES_PER_ELEMENT * 4
    )
  })

  it('should not readEntity if entity is undefined', () => {
    // this test does not configure the entity in the network objects nor give it the network components
    // it should not read from network but update the cursor

    const view = createViewCursor()
    const entity = createEntity()
    setComponent(entity, MockPoseComponent)

    const networkId = 5678 as NetworkId
    const network = NetworkState.worldNetwork as Network
    const userID = network.hostUserID!
    const peerID = network.hostPeerID!
    getMutableState(EngineState).userID.set(userID)
    const peerIndex = 0

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    MockPoseComponent.Vec3.x[entity] = x
    MockPoseComponent.Vec3.y[entity] = y
    MockPoseComponent.Vec3.z[entity] = z
    MockPoseComponent.Quat.x[entity] = x
    MockPoseComponent.Quat.y[entity] = y
    MockPoseComponent.Quat.z[entity] = z
    MockPoseComponent.Quat.w[entity] = w

    writeEntity(view, networkId, peerIndex, entity, Object.values(getState(NetworkState).networkSchema))

    view.cursor = 0

    // reset data on transform component
    MockPoseComponent.Vec3.x[entity] = 0
    MockPoseComponent.Vec3.y[entity] = 0
    MockPoseComponent.Vec3.z[entity] = 0
    MockPoseComponent.Quat.x[entity] = 0
    MockPoseComponent.Quat.y[entity] = 0
    MockPoseComponent.Quat.z[entity] = 0
    MockPoseComponent.Quat.w[entity] = 0

    // read entity will populate data stored in 'view'
    readEntity(view, network, peerID, Object.values(getState(NetworkState).networkSchema))

    // should no repopulate as entity is not listed in network entities
    strictEqual(MockPoseComponent.Vec3.x[entity], 0)
    strictEqual(MockPoseComponent.Vec3.y[entity], 0)
    strictEqual(MockPoseComponent.Vec3.z[entity], 0)
    strictEqual(MockPoseComponent.Quat.x[entity], 0)
    strictEqual(MockPoseComponent.Quat.y[entity], 0)
    strictEqual(MockPoseComponent.Quat.z[entity], 0)
    strictEqual(MockPoseComponent.Quat.w[entity], 0)

    // should update the view cursor accordingly
    strictEqual(
      view.cursor,
      // network id
      Uint32Array.BYTES_PER_ELEMENT +
        // owner index
        Uint32Array.BYTES_PER_ELEMENT +
        // change mask for entity
        Uint8Array.BYTES_PER_ELEMENT +
        // change mask for transform
        Uint8Array.BYTES_PER_ELEMENT +
        // change mask for position
        Uint8Array.BYTES_PER_ELEMENT +
        // transform position
        Float64Array.BYTES_PER_ELEMENT * 3 +
        // change mask for rotation
        Uint8Array.BYTES_PER_ELEMENT +
        // transform rotation
        Float64Array.BYTES_PER_ELEMENT * 4
    )
  })

  it('should not readEntity if peer is not the authority of the entity', () => {
    const view = createViewCursor()
    const entity = createEntity()
    setComponent(entity, NetworkObjectComponent)
    setComponent(entity, MockPoseComponent)
    const networkId = 5678 as NetworkId
    const network = NetworkState.worldNetwork as Network
    const userID = network.hostUserID!
    const peerID = network.hostPeerID!
    const peerID2 = 'peer id 2' as PeerID

    getMutableState(EngineState).userID.set(userID)
    const peerIndex = 0
    const peer2Index = 1

    NetworkObjectComponent.networkId[entity] = networkId

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    MockPoseComponent.Vec3.x[entity] = x
    MockPoseComponent.Vec3.y[entity] = y
    MockPoseComponent.Vec3.z[entity] = z
    MockPoseComponent.Quat.x[entity] = x
    MockPoseComponent.Quat.y[entity] = y
    MockPoseComponent.Quat.z[entity] = z
    MockPoseComponent.Quat.w[entity] = w

    setComponent(entity, NetworkObjectComponent, {
      networkId,
      ownerPeer: peerID,
      authorityPeerID: peerID,
      ownerId: userID
    })

    setComponent(entity, NetworkObjectAuthorityTag)

    writeEntity(view, networkId, peerIndex, entity, Object.values(getState(NetworkState).networkSchema))

    view.cursor = 0

    // reset data on transform component
    MockPoseComponent.Vec3.x[entity] = 0
    MockPoseComponent.Vec3.y[entity] = 0
    MockPoseComponent.Vec3.z[entity] = 0
    MockPoseComponent.Quat.x[entity] = 0
    MockPoseComponent.Quat.y[entity] = 0
    MockPoseComponent.Quat.z[entity] = 0
    MockPoseComponent.Quat.w[entity] = 0

    setComponent(entity, NetworkObjectComponent, {
      networkId,
      ownerPeer: peerID,
      authorityPeerID: peerID2,
      ownerId: userID
    })

    removeComponent(entity, NetworkObjectAuthorityTag)

    // read entity will populate data stored in 'view'
    readEntity(view, network, peerID, Object.values(getState(NetworkState).networkSchema))

    // should no repopulate as we own this entity
    strictEqual(MockPoseComponent.Vec3.x[entity], 0)
    strictEqual(MockPoseComponent.Vec3.y[entity], 0)
    strictEqual(MockPoseComponent.Vec3.z[entity], 0)
    strictEqual(MockPoseComponent.Quat.x[entity], 0)
    strictEqual(MockPoseComponent.Quat.y[entity], 0)
    strictEqual(MockPoseComponent.Quat.z[entity], 0)
    strictEqual(MockPoseComponent.Quat.w[entity], 0)

    // should update the view cursor accordingly
    strictEqual(
      view.cursor,
      // network id
      Uint32Array.BYTES_PER_ELEMENT +
        // owner index
        Uint32Array.BYTES_PER_ELEMENT +
        // change mask for entity
        Uint8Array.BYTES_PER_ELEMENT +
        // change mask for transform
        Uint8Array.BYTES_PER_ELEMENT +
        // change mask for position
        Uint8Array.BYTES_PER_ELEMENT +
        // transform position
        Float64Array.BYTES_PER_ELEMENT * 3 +
        // change mask for rotation
        Uint8Array.BYTES_PER_ELEMENT +
        // transform rotation
        Float64Array.BYTES_PER_ELEMENT * 4
    )
  })

  it('should readEntities', () => {
    const writeView = createViewCursor()

    const network = NetworkState.worldNetwork as Network
    const userID = network.hostUserID!
    const peerID = network.hostPeerID!
    const n = 50
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [posX, posY, posZ] = [1.5, 2.5, 3.5]
    const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

    entities.forEach((entity) => {
      const networkId = entity as unknown as NetworkId
      const peerIndex = entity

      setComponent(entity, MockPoseComponent)
      MockPoseComponent.Vec3.x[entity] = posX
      MockPoseComponent.Vec3.y[entity] = posY
      MockPoseComponent.Vec3.z[entity] = posZ
      MockPoseComponent.Quat.x[entity] = rotX
      MockPoseComponent.Quat.y[entity] = rotY
      MockPoseComponent.Quat.z[entity] = rotZ
      MockPoseComponent.Quat.w[entity] = rotW

      setComponent(entity, NetworkObjectComponent, {
        networkId,
        ownerPeer: peerID,
        authorityPeerID: peerID,
        ownerId: userID
      })
      dispatchAction(
        NetworkActions.peerJoined({
          $network: network.id,
          peerID,
          peerIndex,
          userID
        })
      )
    })

    applyIncomingActions()

    writeEntities(writeView, network, entities)

    const packet = sliceViewCursor(writeView)

    const readView = createViewCursor(packet)
    readEntities(readView, network, packet.byteLength, peerID)

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      strictEqual(MockPoseComponent.Vec3.x[entity], posX)
      strictEqual(MockPoseComponent.Vec3.y[entity], posY)
      strictEqual(MockPoseComponent.Vec3.z[entity], posZ)
      // Round values to 3 decimal places and compare
      strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.x[entity], 3), roundNumberToPlaces(rotX, 3))
      strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.y[entity], 3), roundNumberToPlaces(rotY, 3))
      strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.z[entity], 3), roundNumberToPlaces(rotZ, 3))
      strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.w[entity], 3), roundNumberToPlaces(rotW, 3))
    }
  })

  it('should createDataWriter', () => {
    const write = createDataWriter()
    const network = NetworkState.worldNetwork as Network
    const userID = network.hostUserID!
    const peerID = network.hostPeerID!

    getMutableState(EngineState).userID.set(userID)
    const peerIndex = 0

    const n = 10
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [posX, posY, posZ] = [1.5, 2.5, 3.5]
    const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

    entities.forEach((entity) => {
      const networkId = entity as unknown as NetworkId

      setComponent(entity, MockPoseComponent)
      MockPoseComponent.Vec3.x[entity] = posX
      MockPoseComponent.Vec3.y[entity] = posY
      MockPoseComponent.Vec3.z[entity] = posZ
      MockPoseComponent.Quat.x[entity] = rotX
      MockPoseComponent.Quat.y[entity] = rotY
      MockPoseComponent.Quat.z[entity] = rotZ
      MockPoseComponent.Quat.w[entity] = rotW

      setComponent(entity, NetworkObjectComponent, {
        networkId,
        ownerPeer: peerID,
        authorityPeerID: peerID,
        ownerId: userID
      })
    })

    const packet = write(network, peerID, entities)

    const readView = createViewCursor(packet)

    const _peerIndex = readUint32(readView)
    const _simulationTime = readFloat64(readView)

    const count = readUint32(readView)
    strictEqual(count, entities.length)

    for (let i = 0; i < count; i++) {
      // read networkId
      strictEqual(readUint32(readView), entities[i])

      // read peerIndex
      strictEqual(readUint32(readView), peerIndex)

      // read writeEntity changeMask (only reading TransformComponent)
      strictEqual(readUint8(readView), 0b01)

      // read writeTransform changeMask
      strictEqual(readUint8(readView), 0b11)

      // read writePosition changeMask
      strictEqual(readUint8(readView), 0b111)

      // read position values
      strictEqual(readFloat64(readView), posX)
      strictEqual(readFloat64(readView), posY)
      strictEqual(readFloat64(readView), posZ)

      // read writeRotation changeMask
      strictEqual(readUint8(readView), 0b1111)

      // read compressed rotation values
      // readFloat32(readView)

      // read rotation values
      strictEqual(readFloat64(readView), rotX)
      strictEqual(readFloat64(readView), rotY)
      strictEqual(readFloat64(readView), rotZ)
      strictEqual(readFloat64(readView), rotW)
    }

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      setComponent(entity, MockPoseComponent)
      MockPoseComponent.Vec3.x[entity] = 0
      MockPoseComponent.Vec3.y[entity] = 0
      MockPoseComponent.Vec3.z[entity] = 0
      MockPoseComponent.Quat.x[entity] = 0
      MockPoseComponent.Quat.y[entity] = 0
      MockPoseComponent.Quat.z[entity] = 0
      MockPoseComponent.Quat.w[entity] = 0

      // have to remove this so the data can be read back in
      removeComponent(entity, NetworkObjectAuthorityTag)
    }

    const view = createViewCursor(packet)
    const fromPeerID = network.peerIndexToPeerID[peerIndex]!
    readMetadata(view)
    readEntities(view, network, packet.byteLength, fromPeerID)

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      strictEqual(MockPoseComponent.Vec3.x[entity], posX)
      strictEqual(MockPoseComponent.Vec3.y[entity], posY)
      strictEqual(MockPoseComponent.Vec3.z[entity], posZ)
      // Round values to 3 decimal places and compare
      strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.x[entity], 3), roundNumberToPlaces(rotX, 3))
      strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.y[entity], 3), roundNumberToPlaces(rotY, 3))
      strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.z[entity], 3), roundNumberToPlaces(rotZ, 3))
      strictEqual(roundNumberToPlaces(MockPoseComponent.Quat.w[entity], 3), roundNumberToPlaces(rotW, 3))
    }
  })

  it('should readDataPacket and return empty packet if no changes were made on a fixedTick not divisible by 60', () => {
    const write = createDataWriter()

    const network = NetworkState.worldNetwork as Network
    const peerID = network.hostPeerID!
    const engineState = getMutableState(ECSState)
    engineState.simulationTime.set(1)

    const n = 10
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    const [x, y, z, w] = [0, 0, 0, 0]

    entities.forEach((entity) => {
      const networkID = entity as unknown as NetworkId
      const userID = `${entity}` as unknown as UserID & PeerID
      const peerIndex = entity

      setComponent(entity, MockPoseComponent)
      MockPoseComponent.Vec3.x[entity] = x
      MockPoseComponent.Vec3.y[entity] = y
      MockPoseComponent.Vec3.z[entity] = z
      MockPoseComponent.Quat.x[entity] = x
      MockPoseComponent.Quat.y[entity] = y
      MockPoseComponent.Quat.z[entity] = z
      MockPoseComponent.Quat.w[entity] = w
      setComponent(entity, NetworkObjectComponent, {
        networkId: networkID,
        ownerPeer: peerID,
        authorityPeerID: peerID,
        ownerId: userID
      })
      dispatchAction(
        NetworkActions.peerJoined({
          $network: network.id,
          peerID,
          peerIndex,
          userID
        })
      )
    })

    applyIncomingActions()

    const packet = write(network, peerID, entities)

    strictEqual(packet.byteLength, 0)

    const readView = createViewCursor(packet)

    assert.throws(() => {
      const tick = readUint32(readView)
    })
  })

  // todo - since we are now passing this down through the writers, we need to refactor this test
  // it('should createDataReader and return populated packet if no changes were made but on a fixedTick divisible by 60', () => {
  //   const write = createDataWriter()
  //   const network = NetworkState.worldNetwork as Network
  //   const engineState = getMutableState(EngineState)
  //   engineState.fixedTick.set(60)
  //   const peerID = 'peerID' as PeerID

  //   const n = 10
  //   const entities: Entity[] = Array(n)
  //     .fill(0)
  //     .map(() => createEntity())

  //   const [x, y, z, w] = [0, 0, 0, 0]

  //   entities.forEach((entity) => {
  //     const networkId = entity as unknown as NetworkId
  //     const userId = entity as unknown as UserID & PeerID
  //     const userIndex = entity

  //     setTransformComponent(entity)
  //     const transform = getComponent(entity, TransformComponent)
  //     transform.position.set(x, y, z)
  //     transform.rotation.set(x, y, z, w)
  //     addComponent(entity, NetworkObjectComponent, {
  //       networkId,
  //       authorityPeerID: userId,
  //       ownerId: userId
  //     })
  //     network.userIndexToUserID.set(userIndex, userId)
  //     network.userIDToUserIndex.set(userId, userIndex)
  //   })

  //   const packet = write(network, Engine.instance.userID, peerID, entities)

  //   strictEqual(packet.byteLength, 376)
  // })

  it('should createDataWriter and detect changes', async () => {
    const write = createDataWriter()

    const network = NetworkState.worldNetwork as Network
    const engineState = getMutableState(ECSState)
    engineState.simulationTime.set(1)
    const peerID = Engine.instance.store.peerID

    const n = 10
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    const [x, y, z, w] = [0, 0, 0, 0]

    const userID = 'userId' as unknown as UserID & PeerID
    const peerIndex = 0
    network.peerIDToPeerIndex[peerID] = peerIndex
    network.peerIndexToPeerID[peerIndex] = peerID

    entities.forEach((entity) => {
      setComponent(entity, MockPoseComponent)
      const networkId = entity as unknown as NetworkId
      MockPoseComponent.Vec3.x[entity] = x
      MockPoseComponent.Vec3.y[entity] = y
      MockPoseComponent.Vec3.z[entity] = z
      MockPoseComponent.Quat.x[entity] = x
      MockPoseComponent.Quat.y[entity] = y
      MockPoseComponent.Quat.z[entity] = z
      MockPoseComponent.Quat.w[entity] = w
      setComponent(entity, NetworkObjectComponent, {
        networkId,
        ownerPeer: peerID,
        authorityPeerID: peerID,
        ownerId: userID
      })
    })

    let packet = write(network, Engine.instance.store.peerID, entities)

    strictEqual(packet.byteLength, 0)

    let readView = createViewCursor(packet)

    assert.throws(() => {
      const tick = readUint32(readView)
    })

    const entity = entities[0]
    setComponent(entity, MockPoseComponent)
    MockPoseComponent.Vec3.x[entity] = 1
    MockPoseComponent.Vec3.y[entity] = 1
    MockPoseComponent.Vec3.z[entity] = 1

    packet = write(network, peerID, entities)

    strictEqual(
      packet.byteLength,
      // peer id
      Uint32Array.BYTES_PER_ELEMENT +
        // simulation time
        Float64Array.BYTES_PER_ELEMENT +
        // entity count
        Uint32Array.BYTES_PER_ELEMENT +
        // network id
        Uint32Array.BYTES_PER_ELEMENT +
        // owner index
        Uint32Array.BYTES_PER_ELEMENT +
        // change mask for entity
        Uint8Array.BYTES_PER_ELEMENT +
        // change mask for transform
        Uint8Array.BYTES_PER_ELEMENT +
        // change mask for position
        Uint8Array.BYTES_PER_ELEMENT +
        // transform position
        Float64Array.BYTES_PER_ELEMENT * 3
    )

    readView = createViewCursor(packet)

    const _peerIndex = readUint32(readView)
    const _simulationTime = readFloat64(readView)

    const count = readUint32(readView)
    strictEqual(count, 1) // only one entity changed

    for (let i = 0; i < count; i++) {
      // read networkId
      strictEqual(readUint32(readView), entities[i])

      // read owner peer index
      strictEqual(readUint32(readView), peerIndex)

      // read writeEntity changeMask (only reading TransformComponent)
      strictEqual(readUint8(readView), 0b01)

      // read writeTransform changeMask
      strictEqual(readUint8(readView), 0b01) // only position changed

      // read writePosition changeMask
      strictEqual(readUint8(readView), 0b111)

      // read position values
      strictEqual(readFloat64(readView), 1)
      strictEqual(readFloat64(readView), 1)
      strictEqual(readFloat64(readView), 1)

      // ensure rotation wasn't written and we reached the end of the packet
      assert.throws(() => {
        readUint8(readView)
      })
    }
  })
})
