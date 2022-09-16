import { getState } from '@xrengine/hyperflux'

import { isMobile } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import {
  SCENE_COMPONENT_DYNAMIC_LOAD,
  SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES,
  SceneDynamicLoadTagComponent
} from '../components/SceneDynamicLoadTagComponent'
import { removeSceneEntity, updateSceneEntitesFromJSON } from '../systems/SceneLoadingSystem'

export default async function SceneObjectDynamicLoadSystem(world: World) {
  world.sceneComponentRegistry.set(SceneDynamicLoadTagComponent._name, SCENE_COMPONENT_DYNAMIC_LOAD)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_DYNAMIC_LOAD, {
    defaultData: SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES
  })

  if (Engine.instance.isEditor) return () => {}

  const sceneObjectQuery = defineQuery([Object3DComponent, SceneDynamicLoadTagComponent])

  let accumulator = 0

  const distanceMultiplier = isMobile ? 0.5 : 1

  return () => {
    accumulator += getState(EngineState).fixedDeltaSeconds.value

    if (accumulator > 0.1) {
      accumulator = 0

      const avatarPosition = getComponent(world.localClientEntity, TransformComponent)?.position
      if (!avatarPosition) return

      for (const entity of sceneObjectQuery()) {
        const position = getComponent(entity, TransformComponent).position
        const dynamicLoadComponent = getComponent(entity, SceneDynamicLoadTagComponent)
        const distanceToAvatar = position.distanceToSquared(avatarPosition)
        const loadDistance = dynamicLoadComponent.distance * distanceMultiplier
        const entityNode = world.entityTree.entityNodeMap.get(entity)!

        /** Load unloaded entities */
        if (distanceToAvatar < loadDistance) {
          updateSceneEntitesFromJSON(entityNode.uuid!, world)
        }

        /** Unloaded loaded entities */
        if (distanceToAvatar > loadDistance) {
          // unload all children
          const nodes = world.entityTree.uuidNodeMap
            .get(entityNode.uuid!)
            ?.children.map((entity) => world.entityTree.entityNodeMap.get(entity)!)!
          for (const node of nodes) removeSceneEntity(node, true, world)
        }
      }
    }
  }
}
