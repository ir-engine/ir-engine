import { getState } from '@etherealengine/hyperflux'

import { isMobile } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { defineQuery, getComponent, getOptionalComponent } from '../../ecs/functions/ComponentFunctions'
import { removeEntity } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent, serializeNodeToWorld, traverseEntityNode } from '../../ecs/functions/EntityTree'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
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
        for (const node of nodes)
          traverseEntityNode(node, (childEntity) => {
            serializeNodeToWorld(childEntity)
            removeEntity(childEntity)
          })
        dynamicLoadComponent.loaded = false
      }
    }
  }
}

export const SceneObjectDynamicLoadSystem = defineSystem({
  uuid: 'ee.engine.scene.SceneObjectDynamicLoadSystem',
  execute
})
