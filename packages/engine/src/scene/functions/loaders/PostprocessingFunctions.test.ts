import assert from 'assert'
import proxyquire from 'proxyquire'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
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
    const node = createEntityNode(entity)
    const world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)
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
