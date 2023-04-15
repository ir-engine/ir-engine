import { useEffect } from 'react'

import { getState } from '@etherealengine/hyperflux'

import { isMobile } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { defineQuery, getComponent, getOptionalComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent, removeEntityNodeRecursively } from '../../ecs/functions/EntityTree'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { SCENE_COMPONENT_DYNAMIC_LOAD, SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
import { UUIDComponent } from '../components/UUIDComponent'
import { updateSceneEntitiesFromJSON } from '../systems/SceneLoadingSystem'

const sceneObjectQuery = defineQuery([TransformComponent, SceneDynamicLoadTagComponent])

let accumulator = 0

const distanceMultiplier = isMobile ? 0.5 : 1

const execute = () => {
  if (getState(EngineState).isEditor) return
  accumulator += Engine.instance.deltaSeconds

  if (accumulator > 0.1) {
    accumulator = 0

    const avatarPosition = getOptionalComponent(Engine.instance.localClientEntity, TransformComponent)?.position
    if (!avatarPosition) return

    for (const entity of sceneObjectQuery()) {
      const position = getComponent(entity, TransformComponent).position
      const dynamicLoadComponent = getComponent(entity, SceneDynamicLoadTagComponent)
      const distanceToAvatar = position.distanceToSquared(avatarPosition)
      const loadDistance = dynamicLoadComponent.distance * dynamicLoadComponent.distance * distanceMultiplier
      const entityUUID = getComponent(entity, UUIDComponent)

      /** Load unloaded entities */
      if (!dynamicLoadComponent.loaded && distanceToAvatar < loadDistance) {
        // check if entities already loaded
        updateSceneEntitiesFromJSON(entityUUID)
        dynamicLoadComponent.loaded = true
      }

      /** Unloaded loaded entities */
      if (dynamicLoadComponent.loaded && distanceToAvatar > loadDistance) {
        // unload all children
        const nodes = getComponent(entity, EntityTreeComponent).children
        for (const node of nodes) removeEntityNodeRecursively(node, true)
        dynamicLoadComponent.loaded = false
      }
    }
  }
}

const reactor = () => {
  useEffect(() => {
    Engine.instance.sceneComponentRegistry.set(SceneDynamicLoadTagComponent.name, SCENE_COMPONENT_DYNAMIC_LOAD)
    Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_DYNAMIC_LOAD, {})

    return () => {
      Engine.instance.sceneComponentRegistry.delete(SceneDynamicLoadTagComponent.name)
      Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_DYNAMIC_LOAD)
    }
  }, [])
  return null
}

export const SceneObjectDynamicLoadSystem = defineSystem({
  uuid: 'ee.engine.scene.SceneObjectDynamicLoadSystem',
  execute,
  reactor
})
