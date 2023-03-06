import { isMobile } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, getOptionalComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent, removeEntityNodeRecursively } from '../../ecs/functions/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import {
  SCENE_COMPONENT_DYNAMIC_LOAD,
  SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES,
  SceneDynamicLoadTagComponent
} from '../components/SceneDynamicLoadTagComponent'
import { UUIDComponent } from '../components/UUIDComponent'
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
    accumulator += world.deltaSeconds

    if (accumulator > 0.1) {
      accumulator = 0

      const avatarPosition = getOptionalComponent(world.localClientEntity, TransformComponent)?.position
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
          updateSceneEntitiesFromJSON(entityUUID, world)
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

  const cleanup = async () => {
    world.sceneComponentRegistry.delete(SceneDynamicLoadTagComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_DYNAMIC_LOAD)
    removeQuery(world, sceneObjectQuery)
  }

  return { execute, cleanup }
}
