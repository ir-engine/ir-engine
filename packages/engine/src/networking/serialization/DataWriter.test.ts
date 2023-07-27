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

import { strictEqual } from 'assert'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { roundNumberToPlaces } from '../../../tests/util/MathTestUtils'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import {
  readRotation,
  TransformSerialization,
  writePosition,
  writeTransform
} from '../../transform/TransformSerialization'
import { Network } from '../classes/Network'
import { NetworkObjectComponent, NetworkObjectSendPeriodicUpdatesTag } from '../components/NetworkObjectComponent'
import { NetworkState } from '../NetworkState'
import { readCompressedRotation, readCompressedVector3 } from './DataReader'
import {
  createDataWriter,
  writeComponent,
  writeCompressedRotation,
  writeCompressedVector3,
  writeEntities,
  writeEntity,
  writeVector3
  // writeXRHands
} from './DataWriter'
import { createViewCursor, readFloat64, readUint32, readUint8, sliceViewCursor } from './ViewCursor'

describe('DataWriter', () => {
  beforeEach(() => {
    createEngine()
    createMockNetwork()
    getMutableState(NetworkState).networkSchema[TransformSerialization.ID].set({
      read: TransformSerialization.readTransform,
      write: TransformSerialization.writeTransform
    })
    const engineState = getMutableState(EngineState)
    engineState.simulationTime.set(1)
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should writeComponent', () => {
    const writeView = createViewCursor()
    const entity = createEntity()

    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z

    const writePosition = writeComponent(TransformComponent.position)

    writePosition(writeView, entity)

    const testView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 1 * Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT)

    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat64(testView), x)
    strictEqual(readFloat64(testView), y)
    strictEqual(readFloat64(testView), z)

    sliceViewCursor(writeView)

    TransformComponent.position.x[entity]++
    TransformComponent.position.z[entity]++

    writePosition(writeView, entity)

    const readView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 1 * Uint8Array.BYTES_PER_ELEMENT + 2 * Float64Array.BYTES_PER_ELEMENT)

    strictEqual(readUint8(readView), 0b101)
    strictEqual(readFloat64(readView), x + 1)
    strictEqual(readFloat64(readView), z + 1)
  })

  it('should writeVector3', () => {
    const writeView = createViewCursor()
    const entity = createEntity()

    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z

    writeVector3(TransformComponent.position)(writeView, entity)

    const testView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 1 * Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT)

    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat64(testView), x)
    strictEqual(readFloat64(testView), y)
    strictEqual(readFloat64(testView), z)

    sliceViewCursor(writeView)

    TransformComponent.position.x[entity]++
    TransformComponent.position.z[entity]++

    writeVector3(TransformComponent.position)(writeView, entity)

    const readView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 1 * Uint8Array.BYTES_PER_ELEMENT + 2 * Float64Array.BYTES_PER_ELEMENT)

    strictEqual(readUint8(readView), 0b101)
    strictEqual(readFloat64(readView), x + 1)
    strictEqual(readFloat64(readView), z + 1)
  })

  it('should writePosition', () => {
    const writeView = createViewCursor()
    const entity = createEntity()

    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z

    writePosition(writeView, entity)

    const readView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 1 * Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT)

    strictEqual(readUint8(readView), 0b111)
    strictEqual(readFloat64(readView), x)
    strictEqual(readFloat64(readView), y)
    strictEqual(readFloat64(readView), z)
  })

  it('should writeCompressedRotation', () => {
    const writeView = createViewCursor()
    const entity = createEntity()
    setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [x, y, z, w] = [a, b, c, d]
    TransformComponent.rotation.x[entity] = x
    TransformComponent.rotation.y[entity] = y
    TransformComponent.rotation.z[entity] = z
    TransformComponent.rotation.w[entity] = w

    writeCompressedRotation(TransformComponent.rotation)(writeView, entity)

    const readView = createViewCursor(writeView.buffer)
    readCompressedRotation(TransformComponent.rotation)(readView, entity)

    strictEqual(readView.cursor, Uint8Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT)

    // Round values to 3 decimal places and compare
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entity], 3), roundNumberToPlaces(x, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entity], 3), roundNumberToPlaces(y, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entity], 3), roundNumberToPlaces(z, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entity], 3), roundNumberToPlaces(w, 3))
  })

  it('should writeCompressedVector3', () => {
    const writeView = createViewCursor()
    const entity = createEntity()
    setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

    const [x, y, z] = [1.333, 2.333, 3.333]
    RigidBodyComponent.linearVelocity.x[entity] = x
    RigidBodyComponent.linearVelocity.y[entity] = y
    RigidBodyComponent.linearVelocity.z[entity] = z

    writeCompressedVector3(RigidBodyComponent.linearVelocity)(writeView, entity)

    const readView = createViewCursor(writeView.buffer)
    readCompressedVector3(RigidBodyComponent.linearVelocity)(readView, entity)

    strictEqual(readView.cursor, Uint8Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT)

    // Round values and compare
    strictEqual(roundNumberToPlaces(RigidBodyComponent.linearVelocity.x[entity], 1), roundNumberToPlaces(x, 1))
    strictEqual(roundNumberToPlaces(RigidBodyComponent.linearVelocity.y[entity], 1), roundNumberToPlaces(y, 1))
    strictEqual(roundNumberToPlaces(RigidBodyComponent.linearVelocity.z[entity], 1), roundNumberToPlaces(z, 1))
  })

  it('should writeTransform', () => {
    const writeView = createViewCursor()
    const entity = createEntity()

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [posX, posY, posZ] = [1.5, 2.5, 3.5]
    const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

    setTransformComponent(
      entity,
      new Vector3().set(posX, posY, posZ),
      new Quaternion().set(rotX, rotY, rotZ, rotW),
      new Vector3(1, 1, 1)
    )

    writeTransform(writeView, entity)

    const readView = createViewCursor(writeView.buffer)

    strictEqual(
      writeView.cursor,
      3 * Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT + 4 * Float64Array.BYTES_PER_ELEMENT
    )

    strictEqual(readUint8(readView), 0b11)

    strictEqual(readUint8(readView), 0b111)

    strictEqual(readFloat64(readView), posX)
    strictEqual(readFloat64(readView), posY)
    strictEqual(readFloat64(readView), posZ)

    readRotation(readView, entity)

    // Round values to 3 decimal places and compare
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entity], 3), roundNumberToPlaces(rotX, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entity], 3), roundNumberToPlaces(rotY, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entity], 3), roundNumberToPlaces(rotZ, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entity], 3), roundNumberToPlaces(rotW, 3))
  })

  // it('should writeXRHands', () => {
  //   const writeView = createViewCursor()
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
  //       proxifyVector3(XRHandsInputComponent[handedness][jointName].position, entity).set(posX, posY, posZ)
  //       proxifyQuaternion(XRHandsInputComponent[handedness][jointName].quaternion, entity).set(rotX, rotY, rotZ, rotW)
  //     })
  //   })

  //   // add component
  //   addComponent(entity, XRHandsInputComponent, { hands: hands })

  //   writeXRHands(writeView, entity)

  //   const readView = createViewCursor(writeView.buffer)

  //   // ChangeMask details
  //   // For each entity
  //   // 1 - changeMask (uint16) for writeXRHands
  //   // For each hand
  //   // 1 - changeMask (uint16) for each hand
  //   // 1 - changeMask (uint8) for each hand handedness
  //   // 6 - changeMask (uint16) for each hand bone
  //   // 2 - changeMask (uint8) for pos and rot of each joint
  //   const numOfHands = hands.length
  //   const numOfJoints = joints.length
  //   strictEqual(
  //     writeView.cursor,
  //     1 * Uint16Array.BYTES_PER_ELEMENT +
  //       (1 * Uint16Array.BYTES_PER_ELEMENT +
  //         1 * Uint8Array.BYTES_PER_ELEMENT +
  //         6 * Uint16Array.BYTES_PER_ELEMENT +
  //         (2 * Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT + 1 * Uint32Array.BYTES_PER_ELEMENT) *
  //           numOfJoints) *
  //         numOfHands
  //   )

  //   strictEqual(readUint16(readView), 0b11)

  //   hands.forEach((hand) => {
  //     const handedness = hand.userData.handedness
  //     const handednessBitValue = handedness === 'left' ? 0 : 1

  //     readUint16(readView)
  //     // strictEqual(readUint16(readView), 0b111111)
  //     strictEqual(readUint8(readView), handednessBitValue)

  //     XRHandBones.forEach((bone) => {
  //       readUint16(readView)
  //       // strictEqual(readUint16(readView), 0b11)

  //       bone.forEach((joint) => {
  //         strictEqual(readUint8(readView), 0b111)
  //         strictEqual(readFloat64(readView), posX)
  //         strictEqual(readFloat64(readView), posY)
  //         strictEqual(readFloat64(readView), posZ)

  //         readRotation(readView, entity)

  //         // Round values to 3 decimal places and compare
  //         strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entity], 3), roundNumberToPlaces(rotX, 3))
  //         strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entity], 3), roundNumberToPlaces(rotY, 3))
  //         strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entity], 3), roundNumberToPlaces(rotZ, 3))
  //         strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entity], 3), roundNumberToPlaces(rotW, 3))
  //       })
  //     })
  //   })
  // })

  it('should writeEntity with only TransformComponent', () => {
    const writeView = createViewCursor()
    const entity = createEntity()
    const networkId = 999 as NetworkId
    const userId = '0' as UserId
    const peerID = 'peer id' as PeerID
    const ownerIndex = 0

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [posX, posY, posZ] = [1.5, 2.5, 3.5]
    const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

    setTransformComponent(
      entity,
      new Vector3().set(posX, posY, posZ),
      new Quaternion().set(rotX, rotY, rotZ, rotW),
      new Vector3(1, 1, 1)
    )

    addComponent(entity, NetworkObjectComponent, {
      networkId,
      authorityPeerID: peerID,
      ownerId: userId
    })

    NetworkObjectComponent.networkId[entity] = networkId

    writeEntity(writeView, networkId, ownerIndex, entity, Object.values(getState(NetworkState).networkSchema))

    const readView = createViewCursor(writeView.buffer)

    strictEqual(
      writeView.cursor,
      2 * Uint32Array.BYTES_PER_ELEMENT +
        4 * Uint8Array.BYTES_PER_ELEMENT +
        3 * Float64Array.BYTES_PER_ELEMENT +
        4 * Float64Array.BYTES_PER_ELEMENT
    )

    // read networkId
    strictEqual(readUint32(readView), networkId)

    // read owner index
    strictEqual(readUint32(readView), ownerIndex)

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

    // read rotation values
    readRotation(readView, entity)

    // Round values to 3 decimal places and compare
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entity], 3), roundNumberToPlaces(rotX, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entity], 3), roundNumberToPlaces(rotY, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entity], 3), roundNumberToPlaces(rotZ, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entity], 3), roundNumberToPlaces(rotW, 3))
  })

  it('should writeEntities', () => {
    const writeView = createViewCursor()
    const peerID = 'peerID' as PeerID
    Engine.instance.peerID = peerID

    const n = 5
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [posX, posY, posZ] = [1.5, 2.5, 3.5]
    const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

    const network = Engine.instance.worldNetwork as Network

    entities.forEach((entity) => {
      const networkId = entity as unknown as NetworkId
      const userId = ('userId-' + entity) as unknown as UserId & PeerID
      const userIndex = entity
      NetworkObjectComponent.networkId[entity] = networkId

      setTransformComponent(
        entity,
        new Vector3().set(posX, posY, posZ),
        new Quaternion().set(rotX, rotY, rotZ, rotW),
        new Vector3(1, 1, 1)
      )

      addComponent(entity, NetworkObjectComponent, {
        networkId,
        authorityPeerID: userId,
        ownerId: userId
      })

      network.userIndexToUserID.set(userIndex, userId)
      network.userIDToUserIndex.set(userId, userIndex)
    })

    writeEntities(writeView, network, entities)
    const packet = sliceViewCursor(writeView)

    const expectedBytes =
      1 * Uint32Array.BYTES_PER_ELEMENT +
      n *
        (2 * Uint32Array.BYTES_PER_ELEMENT +
          4 * Uint8Array.BYTES_PER_ELEMENT +
          3 * Float64Array.BYTES_PER_ELEMENT +
          4 * Float64Array.BYTES_PER_ELEMENT)

    strictEqual(writeView.cursor, 0)
    strictEqual(packet.byteLength, expectedBytes)

    const readView = createViewCursor(writeView.buffer)

    const count = readUint32(readView)
    strictEqual(count, entities.length)

    for (let i = 0; i < count; i++) {
      // read networkId
      strictEqual(readUint32(readView), entities[i])

      // read owner index
      strictEqual(readUint32(readView), entities[i])

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

      // read rotation values
      readRotation(readView, entities[i])

      // Round values to 3 decimal places and compare
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entities[i]], 3), roundNumberToPlaces(rotX, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entities[i]], 3), roundNumberToPlaces(rotY, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entities[i]], 3), roundNumberToPlaces(rotZ, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entities[i]], 3), roundNumberToPlaces(rotW, 3))
    }
  })

  it('should createDataWriter', () => {
    const peerID = 'peerID' as PeerID
    Engine.instance.peerID = peerID

    const write = createDataWriter()

    const n = 50
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [posX, posY, posZ] = [1.5, 2.5, 3.5]
    const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

    const network = Engine.instance.worldNetwork as Network

    entities.forEach((entity) => {
      const networkId = entity as unknown as NetworkId
      const userId = ('userId-' + entity) as unknown as UserId & PeerID
      const userIndex = entity
      NetworkObjectComponent.networkId[entity] = networkId

      setTransformComponent(
        entity,
        new Vector3().set(posX, posY, posZ),
        new Quaternion().set(rotX, rotY, rotZ, rotW),
        new Vector3(1, 1, 1)
      )

      addComponent(entity, NetworkObjectComponent, {
        networkId,
        authorityPeerID: userId,
        ownerId: userId
      })

      network.userIndexToUserID.set(userIndex, userId)
      network.userIDToUserIndex.set(userId, userIndex)
    })

    const packet = write(network, Engine.instance.userId, Engine.instance.peerID, entities)

    const expectedBytes =
      3 * Uint32Array.BYTES_PER_ELEMENT +
      1 * Float64Array.BYTES_PER_ELEMENT +
      n *
        (2 * Uint32Array.BYTES_PER_ELEMENT +
          4 * Uint8Array.BYTES_PER_ELEMENT +
          3 * Float64Array.BYTES_PER_ELEMENT +
          4 * Float64Array.BYTES_PER_ELEMENT)

    strictEqual(packet.byteLength, expectedBytes)

    const readView = createViewCursor(packet)

    const userIndex = readUint32(readView)
    const peerIndex = readUint32(readView)
    const tick = readFloat64(readView)

    const count = readUint32(readView)
    strictEqual(count, entities.length)

    for (let i = 0; i < count; i++) {
      // read networkId
      strictEqual(readUint32(readView), entities[i])

      // read owner index
      strictEqual(readUint32(readView), entities[i])

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

      // read rotation values
      readRotation(readView, entities[i])

      // Round values to 3 decimal places and compare
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entities[i]], 3), roundNumberToPlaces(rotX, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entities[i]], 3), roundNumberToPlaces(rotY, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entities[i]], 3), roundNumberToPlaces(rotZ, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entities[i]], 3), roundNumberToPlaces(rotW, 3))
    }
  })
})
