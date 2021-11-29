import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import assert, { strictEqual } from 'assert'
import { TypedArray } from 'bitecs'
import { Entity } from '../../ecs/classes/Entity'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { createDataWriter, createDataWriterAoS, writeEntities, writeEntity, writeEntityId, writeFloat32, writeNetworkId, writePosition, writeRotation, writeTransform, writeUint32 } from "./DataWriter"
import { createViewCursor } from './ViewCursor'

describe('serialization functions', () => {

  it('should writeUint32', () => {
    const view = createViewCursor()
    const val = 1234
    writeUint32(view, val)
    strictEqual(view.cursor, Uint32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getUint32(0), val)
  })
  
  it('should writeFloat32', () => {
    const view = createViewCursor()
    const val = 1.5
    writeFloat32(view, val)
    strictEqual(view.cursor, Float32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getFloat32(0), val)
  })
  
  it('should writeEntityId', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    writeEntityId(view, entity)
    strictEqual(view.cursor, Uint32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getUint32(0), entity)
  })

  it('should writeNetworkId', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    const netId = 5678 as NetworkId
    NetworkObjectComponent.networkId[entity] = netId
    writeNetworkId(view, entity)
    strictEqual(view.cursor, Uint32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getUint32(0), netId)
  })
  
  it('should writePosition', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z
    writePosition(view, entity)
    strictEqual(view.cursor, 3 * Float32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getFloat32(4*0), x)
    strictEqual(view.getFloat32(4*1), y)
    strictEqual(view.getFloat32(4*2), z)
  })
  
  it('should writeRotation', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.rotation.x[entity] = x
    TransformComponent.rotation.y[entity] = y
    TransformComponent.rotation.z[entity] = z
    writeRotation(view, entity)
    strictEqual(view.cursor, 3 * Float32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getFloat32(4*0), x)
    strictEqual(view.getFloat32(4*1), y)
    strictEqual(view.getFloat32(4*2), z)
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
    strictEqual(view.cursor, 6 * Float32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getFloat32(4*0), x)
    strictEqual(view.getFloat32(4*1), y)
    strictEqual(view.getFloat32(4*2), z)
    strictEqual(view.getFloat32(4*3), x)
    strictEqual(view.getFloat32(4*4), y)
    strictEqual(view.getFloat32(4*5), z)
  })
  
  it('should writeEntity', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    const netId = 5678 as NetworkId
    NetworkObjectComponent.networkId[entity] = netId
    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z
    TransformComponent.rotation.x[entity] = x
    TransformComponent.rotation.y[entity] = y
    TransformComponent.rotation.z[entity] = z
    writeEntity(view, entity)
    strictEqual(view.cursor, 7 * Float32Array.BYTES_PER_ELEMENT)
    strictEqual(view.getUint32(4*0), netId)
    strictEqual(view.getFloat32(4*1), x)
    strictEqual(view.getFloat32(4*2), y)
    strictEqual(view.getFloat32(4*3), z)
    strictEqual(view.getFloat32(4*4), x)
    strictEqual(view.getFloat32(4*5), y)
    strictEqual(view.getFloat32(4*6), z)
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
    strictEqual(packet.byteLength, 36 * Float32Array.BYTES_PER_ELEMENT)
    
    const reader = new DataView(packet)

    let cursor = 0
    
    const count = reader.getUint32(cursor)
    strictEqual(count, entities.length)
    cursor += 4
    
    for (let i = 0; i < count; i++) {

      const netId = reader.getUint32(cursor)
      strictEqual(netId, i)
      cursor += 4

      const px = reader.getFloat32(cursor)
      cursor += 4
      strictEqual(px, x)

      const py = reader.getFloat32(cursor)
      cursor += 4
      strictEqual(py, y)

      const pz = reader.getFloat32(cursor)
      cursor += 4
      strictEqual(pz, z)

      const rx = reader.getFloat32(cursor)
      cursor += 4
      strictEqual(rx, x)

      const ry = reader.getFloat32(cursor)
      cursor += 4
      strictEqual(ry, y)

      const rz = reader.getFloat32(cursor)
      cursor += 4
      strictEqual(rz, z)

    }

  })
  
  it('should createDataWriterAoS', () => {
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
    
    // const write = createDataWriter([
    //   NetworkObjectComponent.networkId as unknown as TypedArray,
    //   TransformComponent.position.x as unknown as TypedArray,
    //   TransformComponent.position.y as unknown as TypedArray,
    //   TransformComponent.position.z as unknown as TypedArray,
    //   TransformComponent.rotation.x as unknown as TypedArray,
    //   TransformComponent.rotation.y as unknown as TypedArray,
    //   TransformComponent.rotation.z as unknown as TypedArray,
    // ])
    
    const write = createDataWriterAoS()

    const packet = write(entities)
    strictEqual(packet.byteLength, 1404)
    
    const reader = new DataView(packet)

    let cursor = 0
    
    const count = reader.getUint32(cursor)
    strictEqual(count, entities.length)
    cursor += 4
    
    for (let i = 0; i < count; i++) {

      const netId = reader.getUint32(cursor)
      strictEqual(netId, i)
      cursor += 4

      const px = reader.getFloat32(cursor)
      strictEqual(px, x)
      cursor += 4

      const py = reader.getFloat32(cursor)
      strictEqual(py, y)
      cursor += 4

      const pz = reader.getFloat32(cursor)
      strictEqual(pz, z)
      cursor += 4

      const rx = reader.getFloat32(cursor)
      strictEqual(rx, x)
      cursor += 4

      const ry = reader.getFloat32(cursor)
      strictEqual(ry, y)
      cursor += 4

      const rz = reader.getFloat32(cursor)
      strictEqual(rz, z)
      cursor += 4

    }

    assert.throws(() => {
      reader.getFloat32(cursor)
    })

  })

})