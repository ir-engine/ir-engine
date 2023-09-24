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

import { Color, Texture } from 'three'

import config from '@etherealengine/common/src/config'
import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { parseStorageProviderURLs } from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { Engine } from './Engine'
import { UndefinedEntity } from './Entity'

export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    sceneData: null as SceneData | null,
    sceneEntity: UndefinedEntity,
    /** @todo support multiple scenes */
    // sceneEntities: {} as Record<string /* SceneID */, EntityUUID>,
    background: null as null | Color | Texture
  })
})

export const SceneServices = {
  setCurrentScene: async (projectName: string, sceneName: string) => {
    //If there's an API connection, fetch the scene information from the API. If not, e.g. a client-only build, use
    //a templated URL of where the scene is expected to be, and replace the __$project$__ template with the file
    //server URL
    if (Engine.instance.api) {
      const sceneData = await Engine.instance.api
        .service('scene')
        .get({ projectName, sceneName, metadataOnly: null }, {})
      getMutableState(SceneState).sceneData.set(sceneData.data)
    } else {
      let sceneData = await (
        await fetch(`${config.client.fileServer}/projects/${projectName}/${sceneName}.scene.json`)
      ).json()
      sceneData = parseStorageProviderURLs(sceneData)
      getMutableState(SceneState).sceneData.set({
        name: sceneName,
        project: projectName,
        scene: sceneData,
        thumbnailUrl: `${config.client.fileServer}/projects/${projectName}/${sceneName}.thumbnail.ktx2`
      })
    }
  }
}
// export const

// export const getActiveSceneEntity = () => {
//   const state = getState(SceneState)
//   return UUIDComponent.entitiesByUUID[state.sceneEntities[state.sceneEntity]]
// }
