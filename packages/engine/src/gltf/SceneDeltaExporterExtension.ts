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

import { hasComponent, iterateEntityNode, UUIDComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { cleanStorageProviderURLs } from '../assets/functions/parseSceneJSON'
import { SceneDeltaRegistry, SceneDeltaState } from '../scene/systems/SceneDeltaState'
import { GLTFSceneExportExtension } from './exportGLTFScene'

export const SCENE_DELTA_EXTENSION_NAME = 'IR_scene_delta'

export const SceneDeltaExporterExtension: () => GLTFSceneExportExtension = () => ({
  after: (rootEntity, gltf) => {
    const deltaState = getState(SceneDeltaState)
    let usedSceneDelta = false
    iterateEntityNode(rootEntity, (entity) => {
      if (entity === rootEntity) return
      if (!hasComponent(entity, UUIDComponent)) return
      const uuid = UUIDComponent.get(entity)
      if (!deltaState[uuid]) return
      const nodeDelta = SceneDeltaState.getDelta(entity)
      if (!nodeDelta) return
      gltf.extensions ??= {}
      const extensions: Record<string, any> = gltf.extensions
      extensions[SCENE_DELTA_EXTENSION_NAME] ??= {}
      const extension: SceneDeltaRegistry = extensions[SCENE_DELTA_EXTENSION_NAME]
      extension[uuid] ??= {}
      extension[uuid] = deltaState[uuid]
      usedSceneDelta = true
    })
    if (usedSceneDelta) {
      cleanStorageProviderURLs(gltf.extensions![SCENE_DELTA_EXTENSION_NAME])
      gltf.extensionsUsed ??= []
      gltf.extensionsUsed.push(SCENE_DELTA_EXTENSION_NAME)
    }
  }
})
