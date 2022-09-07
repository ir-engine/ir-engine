import { defineAction, dispatchAction, getState } from '@xrengine/hyperflux'

import { isMobile } from '../../common/functions/isMobile'
import { matches } from '../../common/functions/MatchesUtils'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeAllComponents } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import {
  createEntityNode,
  iterateEntityNode,
  removeEntityNodeFromParent
} from '../../ecs/functions/EntityTreeFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import {
  SCENE_COMPONENT_DYNAMIC_LOAD,
  SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES,
  SceneDynamicLoadTagComponent
} from '../components/SceneDynamicLoadTagComponent'
import { serializeEntity } from '../functions/serializeWorld'
import { createSceneEntity, loadSceneEntity } from '../systems/SceneLoadingSystem'

export class SceneDynamicLoadAction {
  static load = defineAction({
    type: 'xre.engine.DYNAMIC_LOAD_OBJECT',
    uuid: matches.string
  })
  static unload = defineAction({
    type: 'xre.engine.DYNAMIC_UNLOAD_OBJECT',
    uuid: matches.string
  })
}

export default async function SceneObjectDynamicLoadSystem(world: World) {
  const sceneObjectQuery = defineQuery([Object3DComponent, SceneDynamicLoadTagComponent])
  const uuidMap = world.entityTree.uuidNodeMap
  const nodeMap = world.entityTree.entityNodeMap
  world.sceneComponentRegistry.set(SceneDynamicLoadTagComponent._name, SCENE_COMPONENT_DYNAMIC_LOAD)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_DYNAMIC_LOAD, {
    defaultData: SCENE_COMPONENT_DYNAMIC_LOAD_DEFAULT_VALUES
  })

  let accumulator = 0

  const distanceMultiplier = isMobile ? 0.5 : 1

  return () => {
    accumulator += getState(EngineState).fixedDeltaSeconds.value

    if (accumulator > 0.1) {
      accumulator = 0

      const avatarPosition = getComponent(world.localClientEntity, TransformComponent)?.position
      if (!avatarPosition) return

      /** Load unloaded entities */

      for (const [uuid, data] of world.sceneDynamicallyUnloadedEntities) {
        if (data.position.distanceToSquared(avatarPosition) < data.distance * distanceMultiplier) {
          const entity = createSceneEntity(uuid, data.json, world)!
          world.sceneDynamicallyLoadedEntities.set(entity, {
            json: data.json,
            distance: data.distance,
            uuid,
            position: data.position
          })
          world.sceneDynamicallyUnloadedEntities.delete(uuid)
          dispatchAction(SceneDynamicLoadAction.load({ uuid }))
        }
      }

      /** Unloaded loaded entities */

      for (const entity of sceneObjectQuery()) {
        const position = getComponent(entity, TransformComponent).position
        const data = world.sceneDynamicallyLoadedEntities.get(entity)!
        if (position.distanceToSquared(avatarPosition) > data.distance * distanceMultiplier) {
          world.sceneDynamicallyLoadedEntities.delete(entity)
          world.sceneDynamicallyUnloadedEntities.set(data.uuid, {
            json: data.json,
            distance: data.distance,
            position: data.position
          })

          const targetNode = nodeMap.get(entity)
          if (targetNode) {
            iterateEntityNode(targetNode, (node) => {
              if (node !== targetNode) {
                const data = { name: node.uuid, components: serializeEntity(node.entity) }
                if (node.parentEntity) {
                  const parentNode = nodeMap.get(node.parentEntity!)!
                  data['parent'] = parentNode.uuid
                }
                matchActionOnce(
                  SceneDynamicLoadAction.load.matches.validate((action) => action.uuid === targetNode.uuid, ''),
                  () => {
                    createSceneEntity(node.uuid, data)
                  }
                )
              }
              node.children.filter((entity) => !nodeMap.has(entity)).map((entity) => removeEntity(entity))
              removeEntity(node.entity)
            })
            iterateEntityNode(targetNode, (node) => removeEntityNodeFromParent(node))
          }
          const uuid = data.uuid
          dispatchAction(SceneDynamicLoadAction.unload({ uuid }))
        }
      }
    }
  }
}
