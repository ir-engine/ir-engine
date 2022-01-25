import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { strictEqual } from 'assert'
import { Entity } from '../../../ecs/classes/Entity'
import { TransformComponent, Vector3Schema } from '../../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../../components/NetworkObjectComponent'
import { createDataWriter, writeComponent, writeEntities, writeEntity, writePosition, writeRotation, writeTransform, writeVector3 } from "./DataWriter"
import { createViewCursor, readFloat32, readUint32, readUint8, sliceViewCursor } from '../ViewCursor'
import { Vector3SoA } from '../Utils'
import { createWorld } from '../../../ecs/classes/World'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { Quaternion, Vector3 } from 'three'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { Engine } from '../../../ecs/classes/Engine'
import { createQuaternionProxy, createVector3Proxy } from '../../../common/proxies/three'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

describe('AoS DataWriter', () => {

  before(() => {
    Engine.currentWorld = createWorld()
  })

  it('should writeComponent', () => {
    const writeView = createViewCursor()
    const entity = 1234 as Entity

    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z

    const writePosition = writeComponent(TransformComponent.position)
    
    writePosition(writeView, entity)

    const testView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 
      (1 * Uint8Array.BYTES_PER_ELEMENT) + 
      (3 * Float32Array.BYTES_PER_ELEMENT))

    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat32(testView), x)
    strictEqual(readFloat32(testView), y)
    strictEqual(readFloat32(testView), z)
    
    sliceViewCursor(writeView)

    TransformComponent.position.x[entity]++
    TransformComponent.position.z[entity]++

    writePosition(writeView, entity)

    const readView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 
      (1 * Uint8Array.BYTES_PER_ELEMENT) + 
      (2 * Float32Array.BYTES_PER_ELEMENT))

    strictEqual(readUint8(readView), 0b101)
    strictEqual(readFloat32(readView), x+1)
    strictEqual(readFloat32(readView), z+1)
  })

  it('should writeVector3', () => {
    const writeView = createViewCursor()
    const entity = 1234 as Entity
    
    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z
    
    writeVector3(TransformComponent.position)(writeView, entity)

    const testView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 
      (1 * Uint8Array.BYTES_PER_ELEMENT) + 
      (3 * Float32Array.BYTES_PER_ELEMENT))

    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat32(testView), x)
    strictEqual(readFloat32(testView), y)
    strictEqual(readFloat32(testView), z)
    
    sliceViewCursor(writeView)

    TransformComponent.position.x[entity]++
    TransformComponent.position.z[entity]++

    writeVector3(TransformComponent.position)(writeView, entity)

    const readView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 
      (1 * Uint8Array.BYTES_PER_ELEMENT) + 
      (2 * Float32Array.BYTES_PER_ELEMENT))

    strictEqual(readUint8(readView), 0b101)
    strictEqual(readFloat32(readView), x+1)
    strictEqual(readFloat32(readView), z+1)
  })
  
  it('should writePosition', () => {
    const writeView = createViewCursor()
    const entity = 1234 as Entity
    
    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z
    
    writePosition(writeView, entity)

    const readView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 
      (1 * Uint8Array.BYTES_PER_ELEMENT) + 
      (3 * Float32Array.BYTES_PER_ELEMENT))

    strictEqual(readUint8(readView), 0b111)
    strictEqual(readFloat32(readView), x)
    strictEqual(readFloat32(readView), y)
    strictEqual(readFloat32(readView), z)
  })
  
  it('should writeRotation', () => {
    const writeView = createViewCursor()
    const entity = 1234 as Entity
    
    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]
    TransformComponent.rotation.x[entity] = x
    TransformComponent.rotation.y[entity] = y
    TransformComponent.rotation.z[entity] = z
    TransformComponent.rotation.w[entity] = w
    
    writeRotation(writeView, entity)

    const readView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 
      (1 * Uint8Array.BYTES_PER_ELEMENT) + 
      (4 * Float32Array.BYTES_PER_ELEMENT))

    strictEqual(readUint8(readView), 0b1111)
    strictEqual(readFloat32(readView), x)
    strictEqual(readFloat32(readView), y)
    strictEqual(readFloat32(readView), z)
    strictEqual(readFloat32(readView), w)
  })
  
  it('should writeTransform', () => {
    const writeView = createViewCursor()
    const entity = createEntity()

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    addComponent(entity, TransformComponent, {
      position: createVector3Proxy(TransformComponent.position, entity).set(x,y,z),
      rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x,y,z,w),
      scale: new Vector3(1,1,1)
    })
    
    writeTransform(writeView, entity)

    const readView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 
      (3 * Uint8Array.BYTES_PER_ELEMENT) + 
      (7 * Float32Array.BYTES_PER_ELEMENT))
    
    strictEqual(readUint8(readView), 0b11)

    strictEqual(readUint8(readView), 0b111)

    strictEqual(readFloat32(readView), x)
    strictEqual(readFloat32(readView), y)
    strictEqual(readFloat32(readView), z)
  
    strictEqual(readUint8(readView), 0b1111)
    strictEqual(readFloat32(readView), x)
    strictEqual(readFloat32(readView), y)
    strictEqual(readFloat32(readView), z)
    strictEqual(readFloat32(readView), w)
      
  })
  
  it('should writeEntity with only TransformComponent', () => {
    const writeView = createViewCursor()
    const entity = createEntity()
    const networkId = 999 as NetworkId
    const userId = '0' as UserId
    const userIndex = 0
    
    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    addComponent(entity, TransformComponent, {
      position: createVector3Proxy(TransformComponent.position, entity).set(x,y,z),
      rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x,y,z,w),
      scale: new Vector3(1,1,1)
    })

    addComponent(entity, NetworkObjectComponent, {
      networkId,
      ownerId: userId,
      ownerIndex: userIndex,
      prefab: '',
      parameters: {}
    })
    
    NetworkObjectComponent.networkId[entity] = networkId
    
    writeEntity(writeView, userIndex, networkId, entity)

    const readView = createViewCursor(writeView.buffer)

    strictEqual(writeView.cursor, 
      (2 * Uint32Array.BYTES_PER_ELEMENT) + 
      (4 * Uint8Array.BYTES_PER_ELEMENT) + 
      (7 * Float32Array.BYTES_PER_ELEMENT))
    
    // read userIndex
    strictEqual(readUint32(readView), userIndex)

    // read networkId
    strictEqual(readUint32(readView), networkId)

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
  })
  
  it('should writeEntities', () => {
    const writeView = createViewCursor()

    const n = 5
    const entities: Entity[] = Array(n).fill(0).map(() => createEntity())

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    entities.forEach(entity => {
      const networkId = entity as unknown as NetworkId
      const userId = entity as unknown as UserId
      const userIndex = entity
      NetworkObjectComponent.networkId[entity] = networkId
      addComponent(entity, TransformComponent, {
        position: createVector3Proxy(TransformComponent.position, entity).set(x,y,z),
        rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x,y,z,w),
        scale: new Vector3(1,1,1)
      })
      addComponent(entity, NetworkObjectComponent, {
        networkId,
        ownerId: userId,
        ownerIndex: userIndex,
        prefab: '',
        parameters: {}
      })
    })

    writeEntities(writeView, entities)
    const packet = sliceViewCursor(writeView)
    
    const expectedBytes = (1 * Uint32Array.BYTES_PER_ELEMENT) +
      n * (
        (2 * Uint32Array.BYTES_PER_ELEMENT) +
        (4 * Uint8Array.BYTES_PER_ELEMENT) + 
        (7 * Float32Array.BYTES_PER_ELEMENT)
      )

    strictEqual(writeView.cursor, 0)
    strictEqual(packet.byteLength, expectedBytes)
    
    const readView = createViewCursor(writeView.buffer)

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

  })
  
  it('should createDataWriter', () => {
    const world = createWorld()

    const write = createDataWriter()

    const n = 50
    const entities: Entity[] = Array(n).fill(0).map(() => createEntity())

    const [x, y, z, w] = [1.5, 2.5, 3.5, 4.5]

    entities.forEach(entity => {
      const networkId = entity as unknown as NetworkId
      const userId = entity as unknown as UserId
      const userIndex = entity
      NetworkObjectComponent.networkId[entity] = networkId
      addComponent(entity, TransformComponent, {
        position: createVector3Proxy(TransformComponent.position, entity).set(x,y,z),
        rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(x,y,z,w),
        scale: new Vector3(1,1,1)
      })
      addComponent(entity, NetworkObjectComponent, {
        networkId,
        ownerId: userId,
        ownerIndex: userIndex,
        prefab: '',
        parameters: {}
      })
    })

    const packet = write(world, entities)

    const expectedBytes = (
      2 * Uint32Array.BYTES_PER_ELEMENT) +
      n * (
        (2 * Uint32Array.BYTES_PER_ELEMENT) +
        (4 * Uint8Array.BYTES_PER_ELEMENT) + 
        (7 * Float32Array.BYTES_PER_ELEMENT)
      )

    strictEqual(packet.byteLength, expectedBytes)
    
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

  })

})