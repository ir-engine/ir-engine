/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { PresentationSystemGroup } from '@ir-engine/ecs'
import { getComponent, getMutableComponent, getOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getState } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'

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

  const selfAvatar = AvatarComponent.getSelfAvatarEntity()
  const avatarPosition = getOptionalComponent(selfAvatar, TransformComponent)?.position
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
  insert: { after: PresentationSystemGroup },
  execute
})
