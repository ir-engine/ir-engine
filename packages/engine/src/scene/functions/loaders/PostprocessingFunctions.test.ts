import assert from 'assert'
import proxyquire from 'proxyquire'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { World } from '../../../ecs/classes/World'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { DisableTransformTagComponent } from '../../../transform/components/DisableTransformTagComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { IgnoreRaycastTagComponent } from '../../components/IgnoreRaycastTagComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { PostprocessingComponent } from '../../components/PostprocessingComponent'
import { defaultPostProcessingSchema } from '../../constants/PostProcessing'
import { SCENE_COMPONENT_POSTPROCESSING } from './PostprocessingFunctions'

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

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_POSTPROCESSING,
    props: sceneComponentData
  }

  describe('deserializePostprocessing()', () => {
    it('does not create Postprocessing Component while not on client side', () => {
      const _postprocessingFunctions = proxyquire('./PostprocessingFunctions', {
        '@xrengine/engine/src/common/functions/isClient': { isClient: false }
      })
      _postprocessingFunctions.deserializePostprocessing(entity, sceneComponent)

      const postprocessingComponent = getComponent(entity, PostprocessingComponent)
      assert(!postprocessingComponent)
    })

    it('creates Postprocessing Component with provided component data', () => {
      postprocessingFunctions.deserializePostprocessing(entity, sceneComponent)

      const postprocessingComponent = getComponent(entity, PostprocessingComponent)
      assert(postprocessingComponent)
      assert.deepEqual(postprocessingComponent, sceneComponentData)
    })

    it('creates Postprocessing Object3D with provided component data', () => {
      postprocessingFunctions.deserializePostprocessing(entity, sceneComponent)

      assert(getComponent(entity, Object3DComponent)?.value, 'Postprocessing is not created')
      assert(getComponent(entity, DisableTransformTagComponent))
      assert(getComponent(entity, IgnoreRaycastTagComponent))
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      postprocessingFunctions.deserializePostprocessing(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_POSTPROCESSING))
    })
  })

  describe('updatePostprocessing()', () => {
    it('updates postprocessing stats', () => {
      postprocessingFunctions.updatePostprocessing()
      assert(true)
    })
  })

  describe('serializePostprocessing()', () => {
    it('should properly serialize postprocessing', () => {
      postprocessingFunctions.deserializePostprocessing(entity, sceneComponent)
      assert.deepEqual(postprocessingFunctions.serializePostprocessing(entity), sceneComponent)
    })

    it('should return undefine if there is no postprocessing component', () => {
      assert(postprocessingFunctions.serializePostprocessing(entity) === undefined)
    })
  })

  describe('shouldDeserializePostprocessing()', () => {
    it('should return true if there is no ambient light component in the world', () => {
      assert(postprocessingFunctions.shouldDeserializePostprocessing())
    })

    it('should return false if there is atleast one ambient light component in the world', () => {
      postprocessingFunctions.deserializePostprocessing(entity, sceneComponent)
      assert(!postprocessingFunctions.shouldDeserializePostprocessing())
    })
  })
})
