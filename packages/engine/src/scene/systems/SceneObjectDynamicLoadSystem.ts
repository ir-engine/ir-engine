import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { EntityJson, SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { getState } from '@etherealengine/hyperflux'

import { isMobile } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { SceneState } from '../../ecs/classes/Scene'
import { getComponent, getOptionalComponent } from '../../ecs/functions/ComponentFunctions'
import { removeEntityNodeRecursively } from '../../ecs/functions/EntityTree'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
import { UUIDComponent } from '../components/UUIDComponent'
import { updateSceneEntitiesFromJSON, updateSceneEntity } from '../systems/SceneLoadingSystem'

let accumulator = 0

const distanceMultiplier = isMobile ? 0.5 : 1

const execute = () => {
  const engineState = getState(EngineState)
  if (engineState.isEditor) return

  accumulator += engineState.deltaSeconds

  if (accumulator < 0.1) {
    return
  }

  accumulator = 0

  const avatarPosition = getOptionalComponent(Engine.instance.localClientEntity, TransformComponent)?.position
  if (!avatarPosition) return

  const sceneData = getState(SceneState).sceneData as SceneData
  const dynamicEntities = Object.entries(sceneData.scene.entities).filter(([uuid, entityJson]) =>
    entityJson.components.find((comp) => comp.name === SceneDynamicLoadTagComponent.jsonID)
  )

  const loadedDynamicEntities = dynamicEntities.filter(([uuid, entityJson]) => UUIDComponent.entitiesByUUID[uuid])
  const unloadedDynamicEntities = dynamicEntities.filter(([uuid, entityJson]) => !UUIDComponent.entitiesByUUID[uuid])

  for (const [uuid, entityJson] of unloadedDynamicEntities as [EntityUUID, EntityJson][]) {
    // todo - figure out how to include parent transforms in this calculation
    const transformComponent = entityJson.components.find((comp) => comp.name === TransformComponent.jsonID)!.props

    const dynamicComponent = entityJson.components.find(
      (comp) => comp.name === SceneDynamicLoadTagComponent.jsonID
    )?.props

    const distanceToAvatar = avatarPosition.distanceToSquared(transformComponent.position)
    const loadDistance = dynamicComponent.distance * dynamicComponent.distance * distanceMultiplier

    /** Load unloaded entities */
    if (distanceToAvatar < loadDistance) {
      updateSceneEntity(uuid, entityJson)
      updateSceneEntitiesFromJSON(uuid)
    }
  }

  for (const [uuid, entityJson] of loadedDynamicEntities) {
    const entity = UUIDComponent.entitiesByUUID[uuid]

    const transformComponent = getComponent(entity, TransformComponent)

    const dynamicComponent = getComponent(entity, SceneDynamicLoadTagComponent)
    const distanceToAvatar = avatarPosition.distanceToSquared(transformComponent.position)
    const loadDistance = dynamicComponent.distance * dynamicComponent.distance * distanceMultiplier

    /** Unload loaded entities */
    if (distanceToAvatar > loadDistance) {
      removeEntityNodeRecursively(entity)
    }
  }
}

export const SceneObjectDynamicLoadSystem = defineSystem({
  uuid: 'ee.engine.scene.SceneObjectDynamicLoadSystem',
  execute
})
