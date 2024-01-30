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

import { getState } from '@etherealengine/hyperflux'

import { getComponent, getMutableComponent, getOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { isMobile } from '@etherealengine/spatial/src/common/functions/isMobile'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
import { SceneLoadingSystem } from './SceneLoadingSystem'

let accumulator = 0

const distanceMultiplier = isMobile ? 0.5 : 1

const dynamicLoadQuery = defineQuery([SceneDynamicLoadTagComponent])

const execute = () => {
  const engineState = getState(EngineState)
  if (engineState.isEditor) return

  accumulator += getState(ECSState).deltaSeconds

  if (accumulator < 1) {
    return
  }

  accumulator = 0

  const avatarPosition = getOptionalComponent(Engine.instance.localClientEntity, TransformComponent)?.position
  if (!avatarPosition) return

  for (const entity of dynamicLoadQuery()) {
    const dynamicComponent = getComponent(entity, SceneDynamicLoadTagComponent)
    if (dynamicComponent.mode !== 'distance') continue

    const transformComponent = getComponent(entity, TransformComponent)

    const distanceToAvatar = avatarPosition.distanceToSquared(transformComponent.position)
    const loadDistance = dynamicComponent.distance * dynamicComponent.distance * distanceMultiplier

    getMutableComponent(entity, SceneDynamicLoadTagComponent).loaded.set(distanceToAvatar < loadDistance)
  }
}

export const SceneObjectDynamicLoadSystem = defineSystem({
  uuid: 'ee.engine.scene.SceneObjectDynamicLoadSystem',
  insert: { with: SceneLoadingSystem },
  execute
})
