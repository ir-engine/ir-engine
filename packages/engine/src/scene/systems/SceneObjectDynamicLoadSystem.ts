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
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { getAncestorWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { Matrix4, Vector3 } from 'three'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'

const _cameraMat4 = new Matrix4()
const _sceneMat4 = new Matrix4()
const _cameraVec3 = new Vector3()
const _objVec3 = new Vector3()

let accumulator = 0

const distanceMultiplier = isMobile ? 0.5 : 1

const dynamicLoadQuery = defineQuery([SceneDynamicLoadTagComponent])

const execute = () => {
  accumulator += getState(ECSState).deltaSeconds

  if (accumulator < 1) {
    return
  }

  accumulator = 0

  const viewerEntity = getState(EngineState).viewerEntity
  const viewerTransform = getOptionalComponent(viewerEntity, TransformComponent)
  if (!viewerTransform) return
  const viewerWorldMatrix = viewerTransform.matrixWorld

  for (const entity of dynamicLoadQuery()) {
    const dynamicComponent = getComponent(entity, SceneDynamicLoadTagComponent)
    if (dynamicComponent.mode !== 'distance') continue

    const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
    _cameraMat4
      .copy(viewerWorldMatrix)
      .premultiply(_sceneMat4.copy(getComponent(sceneEntity, TransformComponent).matrixWorld).invert())

    _cameraVec3.set(_cameraMat4.elements[12], _cameraMat4.elements[13], _cameraMat4.elements[14])

    const objectPosition = TransformComponent.getScenePosition(entity, _objVec3)

    const distanceToAvatar = _cameraVec3.distanceToSquared(objectPosition)
    const loadDistance = dynamicComponent.distance * dynamicComponent.distance * distanceMultiplier

    getMutableComponent(entity, SceneDynamicLoadTagComponent).loaded.set(distanceToAvatar < loadDistance)
  }
}

export const SceneObjectDynamicLoadSystem = defineSystem({
  uuid: 'ee.engine.scene.SceneObjectDynamicLoadSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
