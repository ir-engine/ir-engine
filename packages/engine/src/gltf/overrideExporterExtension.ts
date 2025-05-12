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
import { AuthoringState } from '../authoring/AuthoringState'
import { GLTFSceneExportExtension } from './exportGLTFScene'

export const OVERRIDE_EXTENSION_NAME = 'IR_override'

export const overrideExporterExtension: () => GLTFSceneExportExtension = () => ({
  after: (rootEntity, gltf) => {
    const overrideState = getState(AuthoringState)
    let usedSceneDelta = false
    const rootUUID = UUIDComponent.get(rootEntity)
    iterateEntityNode(rootEntity, (entity) => {
      if (entity === rootEntity) return
      if (!hasComponent(entity, UUIDComponent)) return
      const uuid = UUIDComponent.getAsSourceID(entity)
      if (!overrideState.sources[uuid]) return
      const nodeDelta = AuthoringState.getAllCommands(uuid)
      if (!nodeDelta.length) return
      gltf.extensions ??= {}
      const extensions: Record<string, any> = gltf.extensions
      extensions[OVERRIDE_EXTENSION_NAME] ??= {}
      const extension = extensions[OVERRIDE_EXTENSION_NAME]
      const relativeUUID = uuid.replace(rootUUID, '')
      extension[relativeUUID] ??= {}
      extension[relativeUUID] = nodeDelta
      usedSceneDelta = true
    })
    if (usedSceneDelta) {
      cleanStorageProviderURLs(gltf.extensions![OVERRIDE_EXTENSION_NAME])
      gltf.extensionsUsed ??= []
      gltf.extensionsUsed.push(OVERRIDE_EXTENSION_NAME)
    }
  }
})
