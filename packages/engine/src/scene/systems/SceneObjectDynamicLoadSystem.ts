import { dispatchAction, getState } from '@xrengine/hyperflux'

import { isMobile } from '../../common/functions/isMobile'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { removeEntity } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
import { createSceneEntity } from '../functions/SceneLoading'

export default async function SceneObjectDynamicLoadSystem(world: World) {
  const sceneObjectQuery = defineQuery([Object3DComponent, SceneDynamicLoadTagComponent])

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
          const entity = createSceneEntity(world, uuid, data.json)
          world.sceneDynamicallyLoadedEntities.set(entity, {
            json: data.json,
            distance: data.distance,
            uuid,
            position: data.position
          })
          world.sceneDynamicallyUnloadedEntities.delete(uuid)

          Promise.allSettled(world.sceneLoadingPendingAssets).then(() => {
            dispatchAction(EngineActions.sceneObjectUpdate({ entities: [entity] }))
          })
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

          removeEntity(entity)
        }
      }
    }
  }
}
