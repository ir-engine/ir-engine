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

import { SceneData, SceneMetadata } from '@etherealengine/common/src/interfaces/SceneInterface'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

export const SCENE_PAGE_LIMIT = 100

export const AdminSceneState = defineState({
  name: 'AdminSceneState',
  initial: () => ({
    scenes: [] as Array<SceneMetadata>,
    skip: 0,
    limit: SCENE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now(),
    singleScene: { scene: {} } as SceneData
  })
})

export const AdminSceneService = {
  fetchAdminScenes: async () => {
    const scenes = await Engine.instance.api.service('scene').find()
    getMutableState(AdminSceneState).merge({
      scenes: scenes.data,
      retrieving: false,
      fetched: true,
      updateNeeded: false,
      lastFetched: Date.now()
    })
  },
  fetchAdminScene: async (projectName: string, sceneName: string) => {
    const scene = await Engine.instance.api.service('scene').get({ projectName, sceneName, metadataOnly: false })
    getMutableState(AdminSceneState).merge({
      singleScene: scene.data,
      retrieving: false,
      fetched: true,
      updateNeeded: false,
      lastFetched: Date.now()
    })
  }
}
