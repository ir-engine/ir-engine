import assert from 'assert'
import { MathUtils } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { deserializeMetaData } from './MetaDataFunctions'

describe('MetadataFunctions', () => {
  describe('deserializeMetaData', () => {
    const world = createEngine().currentWorld

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
