/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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

    const dynamicComponent = entityJson.components.find((comp) => comp.name === SceneDynamicLoadTagComponent.jsonID)
      ?.props

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
