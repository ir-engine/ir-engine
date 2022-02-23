import { ComponentJson } from '@xrengine/engine/src/common/types/SceneInterface'
import assert from 'assert'
import { MathUtils } from 'three'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { deserializeMetaData } from './MetaDataFunctions'

describe('MetadataFunctions', () => {
  describe('deserializeMetaData', () => {
    const world = createWorld()
    Engine.currentWorld = world

    const entity = createEntity()
    const testData = MathUtils.generateUUID()

    const sceneComponentData = {
      meta_data: testData
    }
    const sceneComponent: ComponentJson = {
      name: 'mtdata',
      props: sceneComponentData
    }

    deserializeMetaData(entity, sceneComponent)
    assert.equal(world.sceneMetadata, testData)
  })
})
