import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { strictEqual } from 'assert'
import { TypedArray } from 'bitecs'
import { Entity } from '../../../ecs/classes/Entity'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../../components/NetworkObjectComponent'
import { createDataWriter, writeProps } from "../SoA/DataWriter"
import { createViewCursor, readFloat32, readUint8, readUint32 } from '../ViewCursor'

describe('SoA DataWriter', () => {

  it('should writeProps', () => {
    const writeView = createViewCursor()

    const entities = Array(10).fill(0).map((_, i) => i as Entity)

    const propValues = [1.5, 2.5, 3.5]

    const [x, y, z] = propValues

    entities.forEach(entity => {
      const netId = entity as unknown as NetworkId
      NetworkObjectComponent.networkId[entity] = netId
      TransformComponent.position.x[entity] = x
      TransformComponent.position.y[entity] = y
      TransformComponent.position.z[entity] = z
    })

    const props = [
      TransformComponent.position.x as unknown as TypedArray,
      TransformComponent.position.y as unknown as TypedArray,
      TransformComponent.position.z as unknown as TypedArray,
    ]

    const packet = writeProps(writeView, props, entities)

    const readView = createViewCursor(packet)

    while (readView.cursor < packet.byteLength) {
      const pid = readUint8(readView)
      const value = propValues[pid]
      const count = readUint32(readView)
      for (let i = 0; i < count; i++) {
        strictEqual(readUint32(readView), i)
        strictEqual(readFloat32(readView), value)
      }
    }
  })

  it('should createDataWriter', () => {
    const props = [
      TransformComponent.position.x as unknown as TypedArray,
      TransformComponent.position.y as unknown as TypedArray,
      TransformComponent.position.z as unknown as TypedArray,
    ]

    const write = createDataWriter(props)

    const entities = Array(10).fill(0).map((_, i) => i as Entity)

    const propValues = [1.5, 2.5, 3.5]

    const [x, y, z] = propValues

    entities.forEach(entity => {
      const netId = entity as unknown as NetworkId
      NetworkObjectComponent.networkId[entity] = netId
      TransformComponent.position.x[entity] = x
      TransformComponent.position.y[entity] = y
      TransformComponent.position.z[entity] = z
    })

    const packet = write(entities)

    const readView = createViewCursor(packet)

    while (readView.cursor < readView.buffer.byteLength) {
      const pid = readUint8(readView)
      const value = propValues[pid]
      const count = readUint32(readView)
      for (let i = 0; i < count; i++) {
        strictEqual(readUint32(readView), i)
        strictEqual(readFloat32(readView), value)
      }
    }
  })

})