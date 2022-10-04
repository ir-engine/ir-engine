import { getState } from '@xrengine/hyperflux'

import { isMobile } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { removeEntityNode, removeEntityNodeRecursively } from '../../ecs/functions/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import {
  SCENE_COMPONENT_DYNAMIC_LOAD,
  SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES,
  SceneDynamicLoadTagComponent
} from '../components/SceneDynamicLoadTagComponent'
import { updateSceneEntitiesFromJSON } from '../systems/SceneLoadingSystem'

export default async function SceneObjectDynamicLoadSystem(world: World) {
  world.sceneComponentRegistry.set(SceneDynamicLoadTagComponent.name, SCENE_COMPONENT_DYNAMIC_LOAD)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_DYNAMIC_LOAD, {
    defaultData: SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES
  })

  if (Engine.instance.isEditor)
    return {
      execute: () => {},
      cleanup: async () => {
        world.sceneComponentRegistry.delete(SceneDynamicLoadTagComponent.name)
        world.sceneLoadingRegistry.delete(SCENE_COMPONENT_DYNAMIC_LOAD)
      }
    }

  const sceneObjectQuery = defineQuery([TransformComponent, SceneDynamicLoadTagComponent])

  let accumulator = 0

  const distanceMultiplier = isMobile ? 0.5 : 1

  const execute = () => {
    accumulator += getState(EngineState).fixedDeltaSeconds.value

    if (accumulator > 0.1) {
      accumulator = 0

      const avatarPosition = getComponent(world.localClientEntity, TransformComponent)?.position
      if (!avatarPosition) return

      for (const entity of sceneObjectQuery()) {
        const position = getComponent(entity, TransformComponent).position
        const dynamicLoadComponent = getComponent(entity, SceneDynamicLoadTagComponent)
        const distanceToAvatar = position.distanceToSquared(avatarPosition)
        const loadDistance = dynamicLoadComponent.distance * dynamicLoadComponent.distance * distanceMultiplier
        const entityNode = world.entityTree.entityNodeMap.get(entity)!

        /** Load unloaded entities */
        if (!dynamicLoadComponent.loaded && distanceToAvatar < loadDistance) {
          // check if entities already loaded
          updateSceneEntitiesFromJSON(entityNode.uuid!, world)
          dynamicLoadComponent.loaded = true
        }

        /** Unloaded loaded entities */
        if (dynamicLoadComponent.loaded && distanceToAvatar > loadDistance) {
          // unload all children
          const nodes = world.entityTree.uuidNodeMap
            .get(entityNode.uuid!)
            ?.children.map((entity) => world.entityTree.entityNodeMap.get(entity)!)!
          for (const node of nodes) removeEntityNodeRecursively(node, true, world.entityTree)
          dynamicLoadComponent.loaded = false
        }
      }
    }
  }

  const cleanup = async () => {
    world.sceneComponentRegistry.delete(SceneDynamicLoadTagComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_DYNAMIC_LOAD)
    removeQuery(world, sceneObjectQuery)
  }

  return { execute, cleanup }
}
