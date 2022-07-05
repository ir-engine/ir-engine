import assert, { strictEqual } from 'assert'
import { TypedArray } from 'bitecs'
import { Group, Quaternion, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { roundNumberToPlaces } from '../../common/functions/roundVector'
import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRHandsInputComponent } from '../../xr/components/XRHandsInputComponent'
import { XRHandBones } from '../../xr/types/XRHandBones'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import {
  checkBitflag,
  createDataReader,
  readComponent,
  readComponentProp,
  readCompressedVector3,
  readEntities,
  readEntity,
  readPosition,
  readRotation,
  readTransform,
  readVector3,
  readVector4,
  readXRHands
} from './DataReader'
import {
  createDataWriter,
  writeCompressedVector3,
  writeEntities,
  writeEntity,
  writePosition,
  writeRotation,
  writeTransform,
  writeVector3,
  writeVector4,
  writeXRHands
} from './DataWriter'
import { Vector3SoA, Vector4SoA } from './Utils'
import { createViewCursor, readFloat32, readUint8, readUint32, sliceViewCursor, writeProp } from './ViewCursor'

describe('DataReader', () => {
  beforeEach(() => {
    createEngine()
    createMockNetwork()
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

  it('should readComponent', () => {
    const view = createViewCursor()
    const entity = 42 as Entity

    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z

    writePosition(view, entity)

    TransformComponent.position.x[entity] = 0
    TransformComponent.position.y[entity] = 0
    TransformComponent.position.z[entity] = 0

    view.cursor = 0

    const readPosition = readComponent(TransformComponent.position)

    readPosition(view, entity)

    strictEqual(TransformComponent.position.x[entity], x)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)

    TransformComponent.position.x[entity] = 10.5
    TransformComponent.position.z[entity] = 11.5

    const rewind = view.cursor

    writePosition(view, entity)

    TransformComponent.position.x[entity] = 5.5
    TransformComponent.position.z[entity] = 6.5

    view.cursor = rewind

    readPosition(view, entity)

    strictEqual(TransformComponent.position.x[entity], 10.5)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], 11.5)
  })

  it('should readComponentProp', () => {
    const view = createViewCursor()
    const entity = 42 as Entity

    const prop = TransformComponent.position.x as unknown as TypedArray

    prop[entity] = 1.5

    writeProp(view, prop, entity)

    prop[entity] = 0

    view.cursor = 0

    readComponentProp(view, prop, entity)

    strictEqual(prop[entity], 1.5)
  })

  it('should readVector3', () => {
    const view = createViewCursor()
    const entity = 42 as Entity
    const position = TransformComponent.position as unknown as Vector3SoA
    const [x, y, z] = [1.5, 2.5, 3.5]
    position.x[entity] = x
    position.y[entity] = y
    position.z[entity] = z

    const readPosition = readVector3(position)

    writePosition(view, entity)

    position.x[entity] = 0
    position.y[entity] = 0
    position.z[entity] = 0

    view.cursor = 0

    readPosition(view, entity)

    strictEqual(TransformComponent.position.x[entity], x)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)

    position.y[entity] = 10.5

    view.cursor = 0

    writePosition(view, entity)

    strictEqual(TransformComponent.position.x[entity], x)
    strictEqual(TransformComponent.position.y[entity], 10.5)
    strictEqual(TransformComponent.position.z[entity], z)
  })

  it('should readVector4', () => {
    const view = createViewCursor()
    const entity = 42 as Entity
    const rotation = TransformComponent.rotation
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

    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], y)
    strictEqual(TransformComponent.rotation.z[entity], z)
    strictEqual(TransformComponent.rotation.w[entity], w)

    rotation.y[entity] = 10.5
    rotation.w[entity] = 11.5

    view.cursor = 0

    writeRotation(view, entity)

    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], 10.5)
    strictEqual(TransformComponent.rotation.z[entity], z)
    strictEqual(TransformComponent.rotation.w[entity], 11.5)
  })

  it('should readPosition', () => {
    const view = createViewCursor()
    const entity = 42 as Entity
    const position = TransformComponent.position
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

    strictEqual(TransformComponent.position.x[entity], x)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)

    position.y[entity] = 10.5

    view.cursor = 0

    writePosition(view, entity)

    strictEqual(TransformComponent.position.x[entity], x)
    strictEqual(TransformComponent.position.y[entity], 10.5)
    strictEqual(TransformComponent.position.z[entity], z)
  })

  it('should readCompressedRotation', () => {
    const view = createViewCursor()
    const entity = 42 as Entity
    const rotation = TransformComponent.rotation

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

    strictEqual(view.cursor, Uint8Array.BYTES_PER_ELEMENT + Float32Array.BYTES_PER_ELEMENT)

    // Round values to 3 decimal places and compare
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entity], 3), roundNumberToPlaces(x, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entity], 3), roundNumberToPlaces(y, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entity], 3), roundNumberToPlaces(z, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entity], 3), roundNumberToPlaces(w, 3))
  })

  it('should readCompressedVector3', () => {
    const view = createViewCursor()
    const entity = 42 as Entity
    const rotation = TransformComponent.rotation

    const [x, y, z] = [1.333, 2.333, 3.333]
    VelocityComponent.linear.x[entity] = x
    VelocityComponent.linear.y[entity] = y
    VelocityComponent.linear.z[entity] = z

    writeCompressedVector3(VelocityComponent.linear)(view, entity)

    VelocityComponent.linear.x[entity] = 0
    VelocityComponent.linear.y[entity] = 0
    VelocityComponent.linear.z[entity] = 0

    view.cursor = 0

    readCompressedVector3(VelocityComponent.linear)(view, entity)

    strictEqual(view.cursor, Uint8Array.BYTES_PER_ELEMENT + Float32Array.BYTES_PER_ELEMENT)

    // Round values to 3 decimal places and compare
    strictEqual(roundNumberToPlaces(VelocityComponent.linear.x[entity], 1), roundNumberToPlaces(x, 1))
    strictEqual(roundNumberToPlaces(VelocityComponent.linear.y[entity], 1), roundNumberToPlaces(y, 1))
    strictEqual(roundNumberToPlaces(VelocityComponent.linear.z[entity], 1), roundNumberToPlaces(z, 1))
  })

  it('should readTransform', () => {
    const view = createViewCursor()
    const entity = createEntity()

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [posX, posY, posZ] = [1.5, 2.5, 3.5]
    const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

    const transform = addComponent(entity, TransformComponent, {
      position: createVector3Proxy(TransformComponent.position, entity).set(posX, posY, posZ),
      rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(rotX, rotY, rotZ, rotW),
      scale: new Vector3(1, 1, 1)
    })

    writeTransform(view, entity)

    transform.position.x = 0
    transform.position.y = 0
    transform.position.z = 0
    transform.rotation.x = 0
    transform.rotation.y = 0
    transform.rotation.z = 0
    transform.rotation.w = 0

    view.cursor = 0

    readTransform(view, entity)

    strictEqual(TransformComponent.position.x[entity], posX)
    strictEqual(TransformComponent.position.y[entity], posY)
    strictEqual(TransformComponent.position.z[entity], posZ)
    // Round values to 3 decimal places and compare
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entity], 3), roundNumberToPlaces(rotX, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entity], 3), roundNumberToPlaces(rotY, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entity], 3), roundNumberToPlaces(rotZ, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entity], 3), roundNumberToPlaces(rotW, 3))

    transform.position.x = 0

    view.cursor = 0

    writeTransform(view, entity)

    transform.position.x = posX

    view.cursor = 0

    readTransform(view, entity)

    strictEqual(TransformComponent.position.x[entity], 0)
    strictEqual(TransformComponent.position.y[entity], posY)
    strictEqual(TransformComponent.position.z[entity], posZ)
  })

  it('should readXRHands', () => {
    const view = createViewCursor()
    const entity = createEntity()

    let joints = []
    XRHandBones.forEach((bone) => {
      joints = joints.concat(bone as any)
    })

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [posX, posY, posZ] = [1.5, 2.5, 3.5]
    const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

    const hands = [new Group(), new Group()]
    hands[0].userData.handedness = 'left'
    hands[1].userData.handedness = 'right'

    hands.forEach((hand) => {
      // setup mock hand state
      const handedness = hand.userData.handedness
      const dummyXRHandMeshModel = new Group() as any
      dummyXRHandMeshModel.handedness = handedness
      hand.userData.mesh = dummyXRHandMeshModel

      // proxify and copy values
      joints.forEach((jointName) => {
        createVector3Proxy(TransformComponent.position, entity).set(posX, posY, posZ),
          createQuaternionProxy(TransformComponent.rotation, entity).set(rotX, rotY, rotZ, rotW)
      })
    })

    // add component
    const xrHandsInput = addComponent(entity, XRHandsInputComponent, { hands: hands })

    writeXRHands(view, entity)

    // reset joint pos and rot to zero
    hands.forEach((hand) => {
      const handedness = hand.userData.handedness

      joints.forEach((jointName) => {
        XRHandsInputComponent[handedness][jointName].position.x[entity] = 0
        XRHandsInputComponent[handedness][jointName].position.y[entity] = 0
        XRHandsInputComponent[handedness][jointName].position.z[entity] = 0

        XRHandsInputComponent[handedness][jointName].quaternion.x[entity] = 0
        XRHandsInputComponent[handedness][jointName].quaternion.y[entity] = 0
        XRHandsInputComponent[handedness][jointName].quaternion.z[entity] = 0
        XRHandsInputComponent[handedness][jointName].quaternion.w[entity] = 0
      })
    })

    view.cursor = 0

    readXRHands(view, entity)

    hands.forEach((hand) => {
      const handedness = hand.userData.handedness

      joints.forEach((jointName) => {
        strictEqual(TransformComponent.position.x[entity], posX)
        strictEqual(TransformComponent.position.y[entity], posY)
        strictEqual(TransformComponent.position.z[entity], posZ)
        // Round values to 3 decimal places and compare
        strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entity], 3), roundNumberToPlaces(rotX, 3))
        strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entity], 3), roundNumberToPlaces(rotY, 3))
        strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entity], 3), roundNumberToPlaces(rotZ, 3))
        strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entity], 3), roundNumberToPlaces(rotW, 3))
      })
    })
  })

  it('should readEntity', () => {
    const view = createViewCursor()
    const entity = createEntity()
    const networkId = 5678 as NetworkId
    const userId = '0' as UserId
    const userIndex = 0

    NetworkObjectComponent.networkId[entity] = networkId

    const network = Engine.instance.currentWorld.worldNetwork
    network.userIndexToUserId = new Map([[userIndex, userId]])
    network.userIdToUserIndex = new Map([[userId, userIndex]])

    // construct values for a valid quaternion
    const [a, b, c] = [0.167, 0.167, 0.167]
    let d = Math.sqrt(1 - (a * a + b * b + c * c))

    const [posX, posY, posZ] = [1.5, 2.5, 3.5]
    const [rotX, rotY, rotZ, rotW] = [a, b, c, d]

    const transform = addComponent(entity, TransformComponent, {
      position: createVector3Proxy(TransformComponent.position, entity).set(posX, posY, posZ),
      rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(rotX, rotY, rotZ, rotW),
      scale: new Vector3(1, 1, 1)
    })

    addComponent(entity, NetworkObjectComponent, {
      networkId,
      ownerId: userId,
      prefab: '',
      parameters: {}
    })

    writeEntity(view, networkId, entity)

    transform.position.x = 0
    transform.position.y = 0
    transform.position.z = 0
    transform.rotation.x = 0
    transform.rotation.y = 0
    transform.rotation.z = 0
    transform.rotation.w = 0

    view.cursor = 0

    readEntity(view, Engine.instance.currentWorld, userId)

    strictEqual(TransformComponent.position.x[entity], posX)
    strictEqual(TransformComponent.position.y[entity], posY)
    strictEqual(TransformComponent.position.z[entity], posZ)
    // Round values to 3 decimal places and compare
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entity], 3), roundNumberToPlaces(rotX, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entity], 3), roundNumberToPlaces(rotY, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entity], 3), roundNumberToPlaces(rotZ, 3))
    strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entity], 3), roundNumberToPlaces(rotW, 3))

    transform.position.x = 0

    view.cursor = 0

    writeEntity(view, networkId, entity)

    transform.position.x = posX

    view.cursor = 0

    readEntity(view, Engine.instance.currentWorld, userId)

    strictEqual(TransformComponent.position.x[entity], 0)
    strictEqual(TransformComponent.position.y[entity], posY)
    strictEqual(TransformComponent.position.z[entity], posZ)
  })

  it('should not readEntity if reading back own data', () => {
    const view = createViewCursor()
    const entity = createEntity()
    const networkId = 5678 as NetworkId
    const userId = 'user Id' as UserId
    Engine.instance.userId = userId
    const userIndex = 0

    NetworkObjectComponent.networkId[entity] = networkId

    const network = Engine.instance.currentWorld.worldNetwork
    network.userIndexToUserId = new Map([[userIndex, userId]])
    network.userIdToUserIndex = new Map([[userId, userIndex]])

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    const transform = addComponent(entity, TransformComponent, {
      position: createVector3Proxy(TransformComponent.position, entity).set(x, y, z),
      rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x, y, z, w),
      scale: new Vector3(1, 1, 1)
    })

    addComponent(entity, NetworkObjectComponent, {
      networkId,
      ownerId: userId,
      prefab: '',
      parameters: {}
    })

    addComponent(entity, NetworkObjectOwnedTag, {})

    writeEntity(view, networkId, entity)

    view.cursor = 0

    // reset data on transform component
    transform.position.set(0, 0, 0)
    transform.rotation.set(0, 0, 0, 0)

    // read entity will populate data stored in 'view'
    readEntity(view, Engine.instance.currentWorld, userId)

    // should no repopulate as we own this entity
    strictEqual(TransformComponent.position.x[entity], 0)
    strictEqual(TransformComponent.position.y[entity], 0)
    strictEqual(TransformComponent.position.z[entity], 0)
    strictEqual(TransformComponent.rotation.x[entity], 0)
    strictEqual(TransformComponent.rotation.y[entity], 0)
    strictEqual(TransformComponent.rotation.z[entity], 0)
    strictEqual(TransformComponent.rotation.w[entity], 0)

    // should update the view cursor accordingly
    strictEqual(view.cursor, 24)
  })

  it('should not readEntity if entity is undefined', () => {
    // this test does not configure the entity in the network objects nor give it the network components
    // it should not read from network but update the cursor

    const view = createViewCursor()
    const entity = createEntity()
    const networkId = 5678 as NetworkId
    const userId = 'user Id' as UserId
    Engine.instance.userId = userId
    const userIndex = 0

    const network = Engine.instance.currentWorld.worldNetwork
    network.userIndexToUserId = new Map([[userIndex, userId]])
    network.userIdToUserIndex = new Map([[userId, userIndex]])

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    const transform = addComponent(entity, TransformComponent, {
      position: createVector3Proxy(TransformComponent.position, entity).set(x, y, z),
      rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x, y, z, w),
      scale: new Vector3(1, 1, 1)
    })

    writeEntity(view, networkId, entity)

    view.cursor = 0

    // reset data on transform component
    transform.position.set(0, 0, 0)
    transform.rotation.set(0, 0, 0, 0)

    // read entity will populate data stored in 'view'
    readEntity(view, Engine.instance.currentWorld, userId)

    // should no repopulate as entity is not listed in network entities
    strictEqual(TransformComponent.position.x[entity], 0)
    strictEqual(TransformComponent.position.y[entity], 0)
    strictEqual(TransformComponent.position.z[entity], 0)
    strictEqual(TransformComponent.rotation.x[entity], 0)
    strictEqual(TransformComponent.rotation.y[entity], 0)
    strictEqual(TransformComponent.rotation.z[entity], 0)
    strictEqual(TransformComponent.rotation.w[entity], 0)

    // should update the view cursor accordingly
    strictEqual(view.cursor, 24)
  })

  it('should readEntities', () => {
    const writeView = createViewCursor()

    const network = Engine.instance.currentWorld.worldNetwork
    network.userIndexToUserId = new Map()
    network.userIdToUserIndex = new Map()

    const userId = 'userId' as UserId
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
      const userIndex = entity
      addComponent(entity, TransformComponent, {
        position: createVector3Proxy(TransformComponent.position, entity).set(posX, posY, posZ),
        rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(rotX, rotY, rotZ, rotW),
        scale: new Vector3(1, 1, 1)
      })
      addComponent(entity, NetworkObjectComponent, {
        networkId,
        ownerId: userId,
        prefab: '',
        parameters: {}
      })
      network.userIndexToUserId.set(userIndex, userId)
      network.userIdToUserIndex.set(userId, userIndex)
    })

    writeEntities(writeView, entities)

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      TransformComponent.position.x[entity] = 0
      TransformComponent.position.y[entity] = 0
      TransformComponent.position.z[entity] = 0
      TransformComponent.rotation.x[entity] = 0
      TransformComponent.rotation.y[entity] = 0
      TransformComponent.rotation.z[entity] = 0
      TransformComponent.rotation.w[entity] = 0
    }

    const packet = sliceViewCursor(writeView)

    const readView = createViewCursor(packet)
    readEntities(readView, Engine.instance.currentWorld, packet.byteLength, userId)

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      strictEqual(TransformComponent.position.x[entity], posX)
      strictEqual(TransformComponent.position.y[entity], posY)
      strictEqual(TransformComponent.position.z[entity], posZ)
      // Round values to 3 decimal places and compare
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entity], 3), roundNumberToPlaces(rotX, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entity], 3), roundNumberToPlaces(rotY, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entity], 3), roundNumberToPlaces(rotZ, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entity], 3), roundNumberToPlaces(rotW, 3))
    }
  })

  it('should createDataReader', () => {
    const write = createDataWriter()
    const network = Engine.instance.currentWorld.worldNetwork

    network.userIndexToUserId = new Map()
    network.userIdToUserIndex = new Map()

    Engine.instance.userId = 'userId' as UserId
    const userId = Engine.instance.userId
    const userIndex = 0
    network.userIndexToUserId.set(userIndex, userId)
    network.userIdToUserIndex.set(userId, userIndex)

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
      addComponent(entity, TransformComponent, {
        position: createVector3Proxy(TransformComponent.position, entity).set(posX, posY, posZ),
        rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(rotX, rotY, rotZ, rotW),
        scale: new Vector3(1, 1, 1)
      })
      addComponent(entity, NetworkObjectComponent, {
        networkId,
        ownerId: userId,
        prefab: '',
        parameters: {}
      })
    })

    const packet = write(Engine.instance.currentWorld, network, entities)

    const readView = createViewCursor(packet)

    const _tick = readUint32(readView)
    const _userIndex = readUint32(readView)

    const count = readUint32(readView)
    strictEqual(count, entities.length)

    for (let i = 0; i < count; i++) {
      // read networkId
      strictEqual(readUint32(readView), entities[i])

      // read writeEntity changeMask (only reading TransformComponent)
      strictEqual(readUint8(readView), 0b01)

      // read writeTransform changeMask
      strictEqual(readUint8(readView), 0b11)

      // read writePosition changeMask
      strictEqual(readUint8(readView), 0b111)

      // read position values
      strictEqual(readFloat32(readView), posX)
      strictEqual(readFloat32(readView), posY)
      strictEqual(readFloat32(readView), posZ)

      // read writeRotation changeMask
      strictEqual(readUint8(readView), 0b1111)

      // read rotation values
      readFloat32(readView)
    }

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      TransformComponent.position.x[entity] = 0
      TransformComponent.position.y[entity] = 0
      TransformComponent.position.z[entity] = 0
      TransformComponent.rotation.x[entity] = 0
      TransformComponent.rotation.y[entity] = 0
      TransformComponent.rotation.z[entity] = 0
      TransformComponent.rotation.w[entity] = 0
    }

    const read = createDataReader()

    read(Engine.instance.currentWorld, network, packet)

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      strictEqual(TransformComponent.position.x[entity], posX)
      strictEqual(TransformComponent.position.y[entity], posY)
      strictEqual(TransformComponent.position.z[entity], posZ)
      // Round values to 3 decimal places and compare
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.x[entity], 3), roundNumberToPlaces(rotX, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.y[entity], 3), roundNumberToPlaces(rotY, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.z[entity], 3), roundNumberToPlaces(rotZ, 3))
      strictEqual(roundNumberToPlaces(TransformComponent.rotation.w[entity], 3), roundNumberToPlaces(rotW, 3))
    }
  })

  it('should createDataReader and return empty packet if no changes were made on a fixedTick not divisible by 60', () => {
    const write = createDataWriter()

    const network = Engine.instance.currentWorld.worldNetwork
    network.userIndexToUserId = new Map()
    network.userIdToUserIndex = new Map()
    Engine.instance.currentWorld.fixedTick = 1

    const n = 10
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    const [x, y, z, w] = [0, 0, 0, 0]

    entities.forEach((entity) => {
      const networkId = entity as unknown as NetworkId
      const userId = entity as unknown as UserId
      const userIndex = entity
      addComponent(entity, TransformComponent, {
        position: createVector3Proxy(TransformComponent.position, entity).set(x, y, z),
        rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x, y, z, w),
        scale: new Vector3(1, 1, 1)
      })
      addComponent(entity, NetworkObjectComponent, {
        networkId,
        ownerId: userId,
        prefab: '',
        parameters: {}
      })
      network.userIndexToUserId.set(userIndex, userId)
      network.userIdToUserIndex.set(userId, userIndex)
    })

    const packet = write(Engine.instance.currentWorld, network, entities)

    strictEqual(packet.byteLength, 0)

    const readView = createViewCursor(packet)

    assert.throws(() => {
      const tick = readUint32(readView)
    })
  })

  it('should createDataReader and return populated packet if no changes were made but on a fixedTick divisible by 60', () => {
    const write = createDataWriter()
    const network = Engine.instance.currentWorld.worldNetwork

    network.userIndexToUserId = new Map()
    network.userIdToUserIndex = new Map()
    Engine.instance.currentWorld.fixedTick = 60

    const n = 10
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    const [x, y, z, w] = [0, 0, 0, 0]

    entities.forEach((entity) => {
      const networkId = entity as unknown as NetworkId
      const userId = entity as unknown as UserId
      const userIndex = entity
      addComponent(entity, TransformComponent, {
        position: createVector3Proxy(TransformComponent.position, entity).set(x, y, z),
        rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x, y, z, w),
        scale: new Vector3(1, 1, 1)
      })
      addComponent(entity, NetworkObjectComponent, {
        networkId,
        ownerId: userId,
        prefab: '',
        parameters: {}
      })
      network.userIndexToUserId.set(userIndex, userId)
      network.userIdToUserIndex.set(userId, userIndex)
    })

    const packet = write(Engine.instance.currentWorld, network, entities)

    strictEqual(packet.byteLength, 252)
  })

  it('should createDataReader and detect changes', () => {
    const write = createDataWriter()

    const network = Engine.instance.currentWorld.worldNetwork
    network.userIndexToUserId = new Map()
    network.userIdToUserIndex = new Map()
    Engine.instance.currentWorld.fixedTick = 1

    const n = 10
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    const [x, y, z, w] = [0, 0, 0, 0]

    entities.forEach((entity) => {
      const networkId = entity as unknown as NetworkId
      const userId = entity as unknown as UserId
      const userIndex = entity
      addComponent(entity, TransformComponent, {
        position: createVector3Proxy(TransformComponent.position, entity).set(x, y, z),
        rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x, y, z, w),
        scale: new Vector3(1, 1, 1)
      })
      addComponent(entity, NetworkObjectComponent, {
        networkId,
        ownerId: userId,
        prefab: '',
        parameters: {}
      })
      network.userIndexToUserId.set(userIndex, userId)
      network.userIdToUserIndex.set(userId, userIndex)
    })

    let packet = write(Engine.instance.currentWorld, network, entities)

    strictEqual(packet.byteLength, 0)

    let readView = createViewCursor(packet)

    assert.throws(() => {
      const tick = readUint32(readView)
    })

    const entity = entities[0]

    TransformComponent.position.x[entity] = 1
    TransformComponent.position.y[entity] = 1
    TransformComponent.position.z[entity] = 1

    packet = write(Engine.instance.currentWorld, network, entities)

    strictEqual(packet.byteLength, 31)

    readView = createViewCursor(packet)

    const _tick = readUint32(readView)
    const _userIndex = readUint32(readView)

    const count = readUint32(readView)
    strictEqual(count, 1) // only one entity changed

    for (let i = 0; i < count; i++) {
      // read networkId
      strictEqual(readUint32(readView), entities[i])

      // read writeEntity changeMask (only reading TransformComponent)
      strictEqual(readUint8(readView), 0b01)

      // read writeTransform changeMask
      strictEqual(readUint8(readView), 0b01) // only position changed

      // read writePosition changeMask
      strictEqual(readUint8(readView), 0b111)

      // read position values
      strictEqual(readFloat32(readView), 1)
      strictEqual(readFloat32(readView), 1)
      strictEqual(readFloat32(readView), 1)

      // ensure rotation wasn't written and we reached the end of the packet
      assert.throws(() => {
        readUint8(readView)
      })
    }
  })
})
