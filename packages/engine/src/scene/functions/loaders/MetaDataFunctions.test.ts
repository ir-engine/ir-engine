import assert from 'assert'
import { MathUtils } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { deserializeMetaData } from './MetaDataFunctions'

describe('MetadataFunctions', () => {
  describe('deserializeMetaData', () => {
    createEngine()
    const world = Engine.instance.currentWorld

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
