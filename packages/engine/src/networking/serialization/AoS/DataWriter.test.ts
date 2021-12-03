import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import assert, { strictEqual } from 'assert'
import { Entity } from '../../../ecs/classes/Entity'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../../components/NetworkObjectComponent'
import { createDataWriter, writeEntities, writeEntity, writePosition, writeRotation, writeTransform, writeVector3 } from "./DataWriter"
import { createViewCursor, readFloat32, readUint32, readUint8, sliceViewCursor } from '../ViewCursor'
import { Vector3SoA } from '../Utils'

describe('AoS serialization', () => {

  it('should writeVector3', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    
    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z
    
    writeVector3(TransformComponent.position as unknown as Vector3SoA)(view, entity)

    const testView = createViewCursor(view.buffer)

    strictEqual(view.cursor, 
      (1 * Uint8Array.BYTES_PER_ELEMENT) + (3 * Float32Array.BYTES_PER_ELEMENT))

    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat32(testView), x)
    strictEqual(readFloat32(testView), y)
    strictEqual(readFloat32(testView), z)
  })
  
  it('should writePosition', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    
    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z
    
    writePosition(view, entity)

    const testView = createViewCursor(view.buffer)

    strictEqual(view.cursor, 
      (1 * Uint8Array.BYTES_PER_ELEMENT) + (3 * Float32Array.BYTES_PER_ELEMENT))

    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat32(testView), x)
    strictEqual(readFloat32(testView), y)
    strictEqual(readFloat32(testView), z)
  })
  
  it('should writeRotation', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    
    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.rotation.x[entity] = x
    TransformComponent.rotation.y[entity] = y
    TransformComponent.rotation.z[entity] = z
    
    writeRotation(view, entity)

    const testView = createViewCursor(view.buffer)

    strictEqual(view.cursor, 
      (1 * Uint8Array.BYTES_PER_ELEMENT) + 
      (3 * Float32Array.BYTES_PER_ELEMENT))

    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat32(testView), x)
    strictEqual(readFloat32(testView), y)
    strictEqual(readFloat32(testView), z)
  })
  
  it('should writeTransform', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    
    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z
    TransformComponent.rotation.x[entity] = x
    TransformComponent.rotation.y[entity] = y
    TransformComponent.rotation.z[entity] = z
    
    writeTransform(view, entity)

    const testView = createViewCursor(view.buffer)

    strictEqual(view.cursor, 
      (3 * Uint8Array.BYTES_PER_ELEMENT) + 
      (6 * Float32Array.BYTES_PER_ELEMENT))
    
    strictEqual(readUint8(testView), 0b11)

    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat32(testView), x)
    strictEqual(readFloat32(testView), y)
    strictEqual(readFloat32(testView), z)
  
    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat32(testView), x)
    strictEqual(readFloat32(testView), y)
    strictEqual(readFloat32(testView), z)
      
  })
  
  it('should writeEntity', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    
    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z
    TransformComponent.rotation.x[entity] = x
    TransformComponent.rotation.y[entity] = y
    TransformComponent.rotation.z[entity] = z
    NetworkObjectComponent.networkId[entity] = 999
    
    writeEntity(view, entity)

    const testView = createViewCursor(view.buffer)

    strictEqual(view.cursor, 
      (1 * Uint32Array.BYTES_PER_ELEMENT) + 
      (3 * Uint8Array.BYTES_PER_ELEMENT) + 
      (6 * Float32Array.BYTES_PER_ELEMENT))
    
    strictEqual(readUint32(testView), 999)

    strictEqual(readUint8(testView), 0b11)

    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat32(testView), x)
    strictEqual(readFloat32(testView), y)
    strictEqual(readFloat32(testView), z)
  
    strictEqual(readUint8(testView), 0b111)
    strictEqual(readFloat32(testView), x)
    strictEqual(readFloat32(testView), y)
    strictEqual(readFloat32(testView), z)
  })
  
  it('should writeEntities', () => {
    const view = createViewCursor()

    const n = 5
    const entities: Entity[] = Array(n).fill(0).map((_,i)=>i as Entity)

    const [x, y, z] = [1.5, 2.5, 3.5]

    entities.forEach(entity => {
      const netId = entity as unknown as NetworkId
      NetworkObjectComponent.networkId[entity] = netId
      TransformComponent.position.x[entity] = x
      TransformComponent.position.y[entity] = y
      TransformComponent.position.z[entity] = z
      TransformComponent.rotation.x[entity] = x
      TransformComponent.rotation.y[entity] = y
      TransformComponent.rotation.z[entity] = z
    })

    const packet = writeEntities(view, entities)
    const expectedBytes = (1 * Uint32Array.BYTES_PER_ELEMENT) +
      n * (
        (1 * Uint32Array.BYTES_PER_ELEMENT) +
        (3 * Uint8Array.BYTES_PER_ELEMENT) + 
        (6 * Float32Array.BYTES_PER_ELEMENT)
      )

    strictEqual(view.cursor, 0)
    strictEqual(packet.byteLength, expectedBytes)
    
    const testView = createViewCursor(view.buffer)

    const count = readUint32(testView)
    strictEqual(count, entities.length)

    for (let i = 0; i < count; i++) {

      strictEqual(readUint32(testView), i)

      strictEqual(readUint8(testView), 0b11)

      strictEqual(readUint8(testView), 0b111)
      strictEqual(readFloat32(testView), x)
      strictEqual(readFloat32(testView), y)
      strictEqual(readFloat32(testView), z)
    
      strictEqual(readUint8(testView), 0b111)
      strictEqual(readFloat32(testView), x)
      strictEqual(readFloat32(testView), y)
      strictEqual(readFloat32(testView), z)

    }

  })
  
  it('should createDataWriter', () => {
    const write = createDataWriter()

    const n = 50
    const entities: Entity[] = Array(n).fill(0).map((_,i)=>i as Entity)

    const [x, y, z] = [1.5, 2.5, 3.5]

    entities.forEach(entity => {
      const netId = entity as unknown as NetworkId
      NetworkObjectComponent.networkId[entity] = netId
      TransformComponent.position.x[entity] = x
      TransformComponent.position.y[entity] = y
      TransformComponent.position.z[entity] = z
      TransformComponent.rotation.x[entity] = x
      TransformComponent.rotation.y[entity] = y
      TransformComponent.rotation.z[entity] = z
    })

    const packet = write(entities)

    const expectedBytes = (1 * Uint32Array.BYTES_PER_ELEMENT) +
      n * (
        (1 * Uint32Array.BYTES_PER_ELEMENT) +
        (3 * Uint8Array.BYTES_PER_ELEMENT) + 
        (6 * Float32Array.BYTES_PER_ELEMENT)
      )

    strictEqual(packet.byteLength, expectedBytes)
    
    const testView = createViewCursor(packet)

    const count = readUint32(testView)
    strictEqual(count, entities.length)

    for (let i = 0; i < count; i++) {

      strictEqual(readUint32(testView), i)

      strictEqual(readUint8(testView), 0b11)

      strictEqual(readUint8(testView), 0b111)
      strictEqual(readFloat32(testView), x)
      strictEqual(readFloat32(testView), y)
      strictEqual(readFloat32(testView), z)
    
      strictEqual(readUint8(testView), 0b111)
      strictEqual(readFloat32(testView), x)
      strictEqual(readFloat32(testView), y)
      strictEqual(readFloat32(testView), z)

    }

  })

})