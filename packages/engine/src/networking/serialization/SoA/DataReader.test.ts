import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { strictEqual } from 'assert'
import { TypedArray } from 'bitecs'
import { Entity } from '../../../ecs/classes/Entity'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../../components/NetworkObjectComponent'
import { createDataWriter, writeProps } from "./DataWriter"
import { createViewCursor, } from '../ViewCursor'
import { createDataReader, readProps } from './DataReader'

describe('SoA DataReader', () => {

  it('should readProps', () => {
    const writeView = createViewCursor()

    const entities = Array(5).fill(0).map((_, i) => i as Entity)

    const netIdMap = new Map<NetworkId, Entity>()

    const propValues = [1.5, 2.5, 3.5]

    const [x, y, z] = propValues

    entities.forEach(entity => {
      const netId = entity as unknown as NetworkId
      NetworkObjectComponent.networkId[entity] = netId
      netIdMap.set(netId, entity)
      TransformComponent.position.x[entity] = x
      TransformComponent.position.y[entity] = y
      TransformComponent.position.z[entity] = z
      TransformComponent.rotation.x[entity] = x
      TransformComponent.rotation.y[entity] = y
      TransformComponent.rotation.z[entity] = z
    })

    const props = [
      TransformComponent.position.x as unknown as TypedArray,
      TransformComponent.position.y as unknown as TypedArray,
      TransformComponent.position.z as unknown as TypedArray,
      TransformComponent.rotation.x as unknown as TypedArray,
      TransformComponent.rotation.y as unknown as TypedArray,
      TransformComponent.rotation.z as unknown as TypedArray,
    ]

    const packet = writeProps(writeView, props, entities)

    entities.forEach(entity => {
      TransformComponent.position.x[entity] = 0
      TransformComponent.position.y[entity] = 0
      TransformComponent.position.z[entity] = 0
      TransformComponent.rotation.x[entity] = 0
      TransformComponent.rotation.y[entity] = 0
      TransformComponent.rotation.z[entity] = 0
    })

    const readView = createViewCursor(packet)

    readProps(readView, props, netIdMap)

    entities.forEach(entity => {
      strictEqual(TransformComponent.position.x[entity], x)
      strictEqual(TransformComponent.position.y[entity], y)
      strictEqual(TransformComponent.position.z[entity], z)
      strictEqual(TransformComponent.rotation.x[entity], x)
      strictEqual(TransformComponent.rotation.y[entity], y)
      strictEqual(TransformComponent.rotation.z[entity], z)
    })

  })

  it('should createDataReader', () => {

    const props = [
      TransformComponent.position.x as unknown as TypedArray,
      TransformComponent.position.y as unknown as TypedArray,
      TransformComponent.position.z as unknown as TypedArray,
      TransformComponent.rotation.x as unknown as TypedArray,
      TransformComponent.rotation.y as unknown as TypedArray,
      TransformComponent.rotation.z as unknown as TypedArray,
    ]

    const read = createDataReader(props)
    const write = createDataWriter(props)

    const entities = Array(100).fill(0).map((_, i) => i as Entity)

    const netIdMap = new Map<NetworkId, Entity>()

    const propValues = [1.5, 2.5, 3.5]

    const [x, y, z] = propValues

    entities.forEach(entity => {
      const netId = entity as unknown as NetworkId
      NetworkObjectComponent.networkId[entity] = netId
      netIdMap.set(netId, entity)
      TransformComponent.position.x[entity] = x
      TransformComponent.position.y[entity] = y
      TransformComponent.position.z[entity] = z
      TransformComponent.rotation.x[entity] = x
      TransformComponent.rotation.y[entity] = y
      TransformComponent.rotation.z[entity] = z
    })

    const packet = write(entities)

    entities.forEach(entity => {
      TransformComponent.position.x[entity] = 0
      TransformComponent.position.y[entity] = 0
      TransformComponent.position.z[entity] = 0
      TransformComponent.rotation.x[entity] = 0
      TransformComponent.rotation.y[entity] = 0
      TransformComponent.rotation.z[entity] = 0
    })

    read(packet, netIdMap)

    entities.forEach(entity => {
      strictEqual(TransformComponent.position.x[entity], x)
      strictEqual(TransformComponent.position.y[entity], y)
      strictEqual(TransformComponent.position.z[entity], z)
      strictEqual(TransformComponent.rotation.x[entity], x)
      strictEqual(TransformComponent.rotation.y[entity], y)
      strictEqual(TransformComponent.rotation.z[entity], z)
    })
  })

})