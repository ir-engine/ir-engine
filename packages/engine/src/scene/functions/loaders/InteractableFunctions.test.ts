import assert from 'assert'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { InteractableComponent } from '../../../interaction/components/InteractableComponent'
import { deserializeInteractable } from './InteractableFunctions'

describe('InteractableFunctions', () => {
  it('deserializeInteractable', () => {
    const world = createWorld()
    Engine.currentWorld = world

    const entity = createEntity()

    const sceneComponentData = {
      interactionType: 'interaction type',
      interactionText: 'interaction text',
      interactionName: 'interaction name',
      interactionDescription: 'interaction description',
      interactionImages: [],
      interactionVideos: [],
      interactionUrls: [],
      interactionModels: []
    }
    const sceneComponent: ComponentJson = {
      name: 'interact',
      props: sceneComponentData
    }

    deserializeInteractable(entity, sceneComponent)

    assert(hasComponent(entity, InteractableComponent))
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionType.value, 'interaction type')
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionText.value, 'interaction text')
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionName.value, 'interaction name')
    assert.deepEqual(
      getComponent(entity, InteractableComponent).interactionDescription.value,
      'interaction description'
    )
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionImages.value, [])
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionVideos.value, [])
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionUrls.value, [])
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionModels.value, [])
  })
})
