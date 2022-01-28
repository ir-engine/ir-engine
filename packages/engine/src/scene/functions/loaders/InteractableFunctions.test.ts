import assert from 'assert'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { deserializeInteractable } from './InteractableFunctions'
import { InteractableComponent } from '../../../interaction/components/InteractableComponent'

describe('InteractableFunctions', () => {
  it('deserializeInteractable', () => {
    const world = createWorld()
    Engine.currentWorld = world

    const entity = createEntity()

    const sceneComponentData = {
      interactable: true,
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
    assert(getComponent(entity, InteractableComponent).interactable)
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionType, 'interaction type')
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionText, 'interaction text')
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionName, 'interaction name')
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionDescription, 'interaction description')
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionImages, [])
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionVideos, [])
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionUrls, [])
    assert.deepEqual(getComponent(entity, InteractableComponent).interactionModels, [])
  })
})
