import assert from 'assert'
import proxyquire from 'proxyquire'

import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { IgnoreRaycastTagComponent } from '../../components/IgnoreRaycastTagComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PostprocessingComponent } from '../../components/PostprocessingComponent'
import { defaultPostProcessingSchema } from '../../constants/PostProcessing'

describe('PostprocessingFunctions', () => {
  let entity: Entity
  let postprocessingFunctions = proxyquire('./PostprocessingFunctions', {
    '@xrengine/engine/src/common/functions/isClient': { isClient: true },
    '../../../renderer/functions/configureEffectComposer': { configureEffectComposer: () => {} }
  })

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    options: defaultPostProcessingSchema
  }

  describe('deserializePostprocessing()', () => {
    it('creates Postprocessing Component with provided component data', () => {
      postprocessingFunctions.deserializePostprocessing(entity, sceneComponentData)

      const postprocessingComponent = getComponent(entity, PostprocessingComponent)
      assert(postprocessingComponent)
      assert.deepEqual(postprocessingComponent, sceneComponentData)
    })

    it('creates Postprocessing Object3D with provided component data', () => {
      postprocessingFunctions.deserializePostprocessing(entity, sceneComponentData)

      assert(getComponent(entity, Object3DComponent)?.value, 'Postprocessing is not created')
      assert(getComponent(entity, IgnoreRaycastTagComponent))
    })
  })

  describe('serializePostprocessing()', () => {
    it('should properly serialize postprocessing', () => {
      postprocessingFunctions.deserializePostprocessing(entity, sceneComponentData)
      assert.deepEqual(postprocessingFunctions.serializePostprocessing(entity), sceneComponentData)
    })
  })

  describe('shouldDeserializePostprocessing()', () => {
    it('should return true if there is no ambient light component in the world', () => {
      assert(postprocessingFunctions.shouldDeserializePostprocessing())
    })

    it('should return false if there is atleast one ambient light component in the world', () => {
      postprocessingFunctions.deserializePostprocessing(entity, sceneComponentData)
      assert(!postprocessingFunctions.shouldDeserializePostprocessing())
    })
  })
})
