import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import assert, { strictEqual } from 'assert'
import { TypedArray } from 'bitecs'
import { Vector3 } from 'three'
import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { createWorld, CreateWorld, World } from '../../ecs/classes/World'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { Vector3SoA, Vector4SoA } from './Utils'
import { createViewCursor, readFloat32, readUint32, readUint8, sliceViewCursor, writeProp } from './ViewCursor'
import {
  checkBitflag,
  createDataReader,
  readComponent,
  readComponentProp,
  readEntities,
  readEntity,
  readPosition,
  readRotation,
  readTransform,
  readVector3,
  readVector4
} from './DataReader'
import {
  createDataWriter,
  writeEntities,
  writeEntity,
  writePosition,
  writeRotation,
  writeTransform,
  writeVector3,
  writeVector4
} from './DataWriter'

describe('AoS DataReader', () => {
  before(() => {
    Engine.currentWorld = createWorld()
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
    const entity = 1234 as Entity

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
    const entity = 1234 as Entity

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
    const entity = 1234 as Entity
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
    const entity = 1234 as Entity
    const rotation = TransformComponent.rotation
    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]
    rotation.x[entity] = x
    rotation.y[entity] = y
    rotation.z[entity] = z
    rotation.w[entity] = w

    const readRotation = readVector4(rotation)

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
    const entity = 1234 as Entity
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

  it('should readRotation', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    const rotation = TransformComponent.rotation
    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]
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

  it('should readTransform', () => {
    const view = createViewCursor()
    const entity = createEntity()

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    const transform = addComponent(entity, TransformComponent, {
      position: createVector3Proxy(TransformComponent.position, entity).set(x, y, z),
      rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x, y, z, w),
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

    strictEqual(TransformComponent.position.x[entity], x)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)
    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], y)
    strictEqual(TransformComponent.rotation.z[entity], z)
    strictEqual(TransformComponent.rotation.w[entity], w)

    transform.position.x = 0
    transform.rotation.z = 0

    view.cursor = 0

    writeTransform(view, entity)

    transform.position.x = x
    transform.rotation.z = z

    view.cursor = 0

    readTransform(view, entity)

    strictEqual(TransformComponent.position.x[entity], 0)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)
    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], y)
    strictEqual(TransformComponent.rotation.z[entity], 0)
    strictEqual(TransformComponent.rotation.w[entity], w)
  })

  it('should readEntity', () => {
    const view = createViewCursor()
    const entity = createEntity()
    const networkId = 5678 as NetworkId
    const userId = '0' as UserId
    const userIndex = 0

    NetworkObjectComponent.networkId[entity] = networkId

    Engine.currentWorld.networkIdMap = new Map<NetworkId, Entity>([[networkId, entity]])
    Engine.currentWorld.userIndexToUserId = new Map([[userIndex, userId]])
    Engine.currentWorld.userIdToUserIndex = new Map([[userId, userIndex]])

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    const transform = addComponent(entity, TransformComponent, {
      position: createVector3Proxy(TransformComponent.position, entity).set(x, y, z),
      rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x, y, z, w),
      scale: new Vector3(1, 1, 1)
    })

    addComponent(entity, NetworkObjectComponent, {
      networkId,
      ownerId: userId,
      ownerIndex: userIndex,
      prefab: '',
      parameters: {}
    })

    writeEntity(view, userIndex, networkId, entity)

    transform.position.x = 0
    transform.position.y = 0
    transform.position.z = 0
    transform.rotation.x = 0
    transform.rotation.y = 0
    transform.rotation.z = 0
    transform.rotation.w = 0

    view.cursor = 0

    readEntity(view, Engine.currentWorld)

    strictEqual(TransformComponent.position.x[entity], x)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)
    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], y)
    strictEqual(TransformComponent.rotation.z[entity], z)
    strictEqual(TransformComponent.rotation.w[entity], w)

    transform.position.x = 0
    transform.rotation.z = 0

    view.cursor = 0

    writeEntity(view, userIndex, networkId, entity)

    transform.position.x = x
    transform.rotation.z = z

    view.cursor = 0

    readEntity(view, Engine.currentWorld)

    strictEqual(TransformComponent.position.x[entity], 0)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)
    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], y)
    strictEqual(TransformComponent.rotation.z[entity], 0)
    strictEqual(TransformComponent.rotation.w[entity], w)
  })

  it('should readEntities', () => {
    const writeView = createViewCursor()

    Engine.currentWorld.networkIdMap = new Map()
    Engine.currentWorld.userIndexToUserId = new Map()
    Engine.currentWorld.userIdToUserIndex = new Map()

    const n = 50
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

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
        ownerIndex: userIndex,
        prefab: '',
        parameters: {}
      })
      Engine.currentWorld.networkIdMap.set(networkId, entity)
      Engine.currentWorld.userIndexToUserId.set(userIndex, userId)
      Engine.currentWorld.userIdToUserIndex.set(userId, userIndex)
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
    readEntities(readView, Engine.currentWorld, packet.byteLength)

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      strictEqual(TransformComponent.position.x[entity], x)
      strictEqual(TransformComponent.position.y[entity], y)
      strictEqual(TransformComponent.position.z[entity], z)
      strictEqual(TransformComponent.rotation.x[entity], x)
      strictEqual(TransformComponent.rotation.y[entity], y)
      strictEqual(TransformComponent.rotation.z[entity], z)
      strictEqual(TransformComponent.rotation.w[entity], w)
    }
  })

  it('should createDataReader', () => {
    const write = createDataWriter()

    Engine.currentWorld.networkIdMap = new Map<NetworkId, Entity>()
    Engine.currentWorld.userIndexToUserId = new Map()
    Engine.currentWorld.userIdToUserIndex = new Map()

    const n = 10
    const entities: Entity[] = Array(n)
      .fill(0)
      .map(() => createEntity())

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

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
        ownerIndex: userIndex,
        prefab: '',
        parameters: {}
      })
      Engine.currentWorld.networkIdMap.set(networkId, entity)
      Engine.currentWorld.userIndexToUserId.set(userIndex, userId)
      Engine.currentWorld.userIdToUserIndex.set(userId, userIndex)
    })

    const packet = write(Engine.currentWorld, entities)

    const readView = createViewCursor(packet)

    const tick = readUint32(readView)

    const count = readUint32(readView)
    strictEqual(count, entities.length)

    for (let i = 0; i < count; i++) {
      // read userIndex
      strictEqual(readUint32(readView), entities[i])

      // read networkId
      strictEqual(readUint32(readView), entities[i])

      // read writeEntity changeMask (only reading TransformComponent)
      strictEqual(readUint8(readView), 0b01)

      // read writeTransform changeMask
      strictEqual(readUint8(readView), 0b11)

      // read writePosition changeMask
      strictEqual(readUint8(readView), 0b111)

      // read position values
      strictEqual(readFloat32(readView), x)
      strictEqual(readFloat32(readView), y)
      strictEqual(readFloat32(readView), z)

      // read writeRotation changeMask
      strictEqual(readUint8(readView), 0b1111)

      // read rotation values
      strictEqual(readFloat32(readView), x)
      strictEqual(readFloat32(readView), y)
      strictEqual(readFloat32(readView), z)
      strictEqual(readFloat32(readView), w)
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

    read(Engine.currentWorld, packet)

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      strictEqual(TransformComponent.position.x[entity], x)
      strictEqual(TransformComponent.position.y[entity], y)
      strictEqual(TransformComponent.position.z[entity], z)
      strictEqual(TransformComponent.rotation.x[entity], x)
      strictEqual(TransformComponent.rotation.y[entity], y)
      strictEqual(TransformComponent.rotation.z[entity], z)
      strictEqual(TransformComponent.rotation.w[entity], w)
    }
  })

  it('should createDataReader and return empty packet if no changes were made', () => {
    const write = createDataWriter()

    Engine.currentWorld.networkIdMap = new Map<NetworkId, Entity>()
    Engine.currentWorld.userIndexToUserId = new Map()
    Engine.currentWorld.userIdToUserIndex = new Map()

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
        ownerIndex: userIndex,
        prefab: '',
        parameters: {}
      })
      Engine.currentWorld.networkIdMap.set(networkId, entity)
      Engine.currentWorld.userIndexToUserId.set(userIndex, userId)
      Engine.currentWorld.userIdToUserIndex.set(userId, userIndex)
    })

    const packet = write(Engine.currentWorld, entities)

    strictEqual(packet.byteLength, 0)

    const readView = createViewCursor(packet)

    assert.throws(() => {
      const tick = readUint32(readView)
    })
  })

  it('should createDataReader and detect changes', () => {
    const write = createDataWriter()

    Engine.currentWorld.networkIdMap = new Map<NetworkId, Entity>()
    Engine.currentWorld.userIndexToUserId = new Map()
    Engine.currentWorld.userIdToUserIndex = new Map()

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
        ownerIndex: userIndex,
        prefab: '',
        parameters: {}
      })
      Engine.currentWorld.networkIdMap.set(networkId, entity)
      Engine.currentWorld.userIndexToUserId.set(userIndex, userId)
      Engine.currentWorld.userIdToUserIndex.set(userId, userIndex)
    })

    let packet = write(Engine.currentWorld, entities)

    strictEqual(packet.byteLength, 0)

    let readView = createViewCursor(packet)

    assert.throws(() => {
      const tick = readUint32(readView)
    })

    const entity = entities[0]

    TransformComponent.position.x[entity] = 1
    TransformComponent.position.y[entity] = 1
    TransformComponent.position.z[entity] = 1

    packet = write(Engine.currentWorld, entities)

    strictEqual(packet.byteLength, 31)

    readView = createViewCursor(packet)

    const tick = readUint32(readView)

    const count = readUint32(readView)
    strictEqual(count, 1) // only one entity changed

    for (let i = 0; i < count; i++) {
      // read userIndex
      strictEqual(readUint32(readView), entities[i])

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
