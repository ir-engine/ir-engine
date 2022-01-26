import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { strictEqual } from 'assert'
import { TypedArray } from 'bitecs'
import { Entity } from '../../../ecs/classes/Entity'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../../components/NetworkObjectComponent'
import { Vector3SoA } from '../Utils'
import { createViewCursor, writeProp } from '../ViewCursor'
import {
  checkBitflag,
  readComponent,
  readComponentProp,
  readEntity,
  readPosition,
  readRotation,
  readTransform,
  readVector3
} from './DataReader'
import {
  createDataWriter,
  writeEntities,
  writeEntity,
  writePosition,
  writeRotation,
  writeTransform
} from './DataWriter'

describe('AoS DataReader', () => {
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

  it('should readPosition', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    const position = TransformComponent.position as unknown as Vector3SoA
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
    const rotation = TransformComponent.rotation as unknown as Vector3SoA
    const [x, y, z] = [1.5, 2.5, 3.5]
    rotation.x[entity] = x
    rotation.y[entity] = y
    rotation.z[entity] = z

    writeRotation(view, entity)

    rotation.x[entity] = 0
    rotation.y[entity] = 0
    rotation.z[entity] = 0

    view.cursor = 0

    readRotation(view, entity)

    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], y)
    strictEqual(TransformComponent.rotation.z[entity], z)

    rotation.y[entity] = 10.5

    view.cursor = 0

    writeRotation(view, entity)

    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], 10.5)
    strictEqual(TransformComponent.rotation.z[entity], z)
  })

  it('should readTransform', () => {
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

    TransformComponent.position.x[entity] = 0
    TransformComponent.position.y[entity] = 0
    TransformComponent.position.z[entity] = 0
    TransformComponent.rotation.x[entity] = 0
    TransformComponent.rotation.y[entity] = 0
    TransformComponent.rotation.z[entity] = 0

    view.cursor = 0

    readTransform(view, entity)

    strictEqual(TransformComponent.position.x[entity], x)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)
    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], y)
    strictEqual(TransformComponent.rotation.z[entity], z)

    TransformComponent.position.x[entity] = 0
    TransformComponent.rotation.z[entity] = 0

    view.cursor = 0

    writeTransform(view, entity)

    TransformComponent.position.x[entity] = x
    TransformComponent.rotation.z[entity] = z

    view.cursor = 0

    readTransform(view, entity)

    strictEqual(TransformComponent.position.x[entity], 0)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)
    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], y)
    strictEqual(TransformComponent.rotation.z[entity], 0)
  })

  it('should readEntity', () => {
    const view = createViewCursor()
    const entity = 1234 as Entity
    const netId = 5678 as NetworkId

    NetworkObjectComponent.networkId[entity] = netId

    const netIdMap = new Map<NetworkId, Entity>([[netId, entity]])

    const [x, y, z] = [1.5, 2.5, 3.5]
    TransformComponent.position.x[entity] = x
    TransformComponent.position.y[entity] = y
    TransformComponent.position.z[entity] = z
    TransformComponent.rotation.x[entity] = x
    TransformComponent.rotation.y[entity] = y
    TransformComponent.rotation.z[entity] = z

    writeEntity(view, entity)

    TransformComponent.position.x[entity] = 0
    TransformComponent.position.y[entity] = 0
    TransformComponent.position.z[entity] = 0
    TransformComponent.rotation.x[entity] = 0
    TransformComponent.rotation.y[entity] = 0
    TransformComponent.rotation.z[entity] = 0

    view.cursor = 0

    readEntity(view, netIdMap)

    strictEqual(TransformComponent.position.x[entity], x)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)
    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], y)
    strictEqual(TransformComponent.rotation.z[entity], z)

    TransformComponent.position.x[entity] = 0
    TransformComponent.rotation.z[entity] = 0

    view.cursor = 0

    writeEntity(view, entity)

    TransformComponent.position.x[entity] = x
    TransformComponent.rotation.z[entity] = z

    view.cursor = 0

    readEntity(view, netIdMap)

    strictEqual(TransformComponent.position.x[entity], 0)
    strictEqual(TransformComponent.position.y[entity], y)
    strictEqual(TransformComponent.position.z[entity], z)
    strictEqual(TransformComponent.rotation.x[entity], x)
    strictEqual(TransformComponent.rotation.y[entity], y)
    strictEqual(TransformComponent.rotation.z[entity], 0)
  })

  it('should readEntities', () => {
    const view = createViewCursor()

    const netIdMap = new Map<NetworkId, Entity>()

    const n = 5
    const entities: Entity[] = Array(n)
      .fill(0)
      .map((_, i) => i as Entity)

    const [x, y, z] = [1.5, 2.5, 3.5]

    entities.forEach((entity) => {
      const netId = entity as unknown as NetworkId
      NetworkObjectComponent.networkId[entity] = netId
      TransformComponent.position.x[entity] = x
      TransformComponent.position.y[entity] = y
      TransformComponent.position.z[entity] = z
      TransformComponent.rotation.x[entity] = x
      TransformComponent.rotation.y[entity] = y
      TransformComponent.rotation.z[entity] = z
      netIdMap.set(netId, entity)
    })

    writeEntities(view, entities)

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      strictEqual(TransformComponent.position.x[entity], x)
      strictEqual(TransformComponent.position.y[entity], y)
      strictEqual(TransformComponent.position.z[entity], z)
      strictEqual(TransformComponent.rotation.x[entity], x)
      strictEqual(TransformComponent.rotation.y[entity], y)
      strictEqual(TransformComponent.rotation.z[entity], z)
    }
  })

  it('should createDataReader', () => {
    const write = createDataWriter()

    const netIdMap = new Map<NetworkId, Entity>()

    const n = 50
    const entities: Entity[] = Array(n)
      .fill(0)
      .map((_, i) => i as Entity)

    const [x, y, z] = [1.5, 2.5, 3.5]

    entities.forEach((entity) => {
      const netId = entity as unknown as NetworkId
      NetworkObjectComponent.networkId[entity] = netId
      TransformComponent.position.x[entity] = x
      TransformComponent.position.y[entity] = y
      TransformComponent.position.z[entity] = z
      TransformComponent.rotation.x[entity] = x
      TransformComponent.rotation.y[entity] = y
      TransformComponent.rotation.z[entity] = z
      netIdMap.set(netId, entity)
    })

    write(entities)

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]

      strictEqual(TransformComponent.position.x[entity], x)
      strictEqual(TransformComponent.position.y[entity], y)
      strictEqual(TransformComponent.position.z[entity], z)
      strictEqual(TransformComponent.rotation.x[entity], x)
      strictEqual(TransformComponent.rotation.y[entity], y)
      strictEqual(TransformComponent.rotation.z[entity], z)
    }
  })
})
