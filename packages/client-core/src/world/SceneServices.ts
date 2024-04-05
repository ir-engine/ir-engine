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

import config from '@etherealengine/common/src/config'
import { SceneDataType, SceneID, scenePath } from '@etherealengine/common/src/schema.type.module'
import { parseStorageProviderURLs } from '@etherealengine/common/src/utils/parseSceneJSON'
import { Engine, getMutableComponent } from '@etherealengine/ecs'
import { GLTFState } from '@etherealengine/engine/src/scene/GLTFState'
import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { getModelSceneID } from '@etherealengine/engine/src/scene/functions/loaders/ModelFunctions'
import { SceneJsonType } from '@etherealengine/engine/src/scene/types/SceneTypes'
import { getMutableState } from '@etherealengine/hyperflux'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { LocationState } from '../social/services/LocationService'

const fileServer = config.client.fileServer

export const SceneServices = {
  setCurrentScene: (sceneID: SceneID) => {
    const isSceneJson = sceneID.endsWith('.scene.json')
    if (isSceneJson) {
      Engine.instance.api
        .service(scenePath)
        .get('' as SceneID, { query: { sceneKey: sceneID } })
        .then((sceneData: SceneDataType) => {
          const sceneRoot = SceneState.loadScene(sceneID, sceneData)
          if (sceneRoot) {
            getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([sceneRoot])
          }
        })

      return () => {
        SceneState.unloadScene(sceneID)
      }
    }

    const gltfEntity = GLTFState.load(sceneID)
    getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([gltfEntity])
    return () => {
      GLTFState.unload(sceneID, gltfEntity)
    }
  },

  loadSceneJsonOffline: async (projectName, sceneName) => {
    const sceneID = `projects/${projectName}/${sceneName}.scene.json` as SceneID
    const sceneData = (await (
      await fetch(`${fileServer}/projects/${projectName}/${sceneName}.scene.json`)
    ).json()) as SceneJsonType
    const sceneRoot = SceneState.loadScene(sceneID, {
      scene: parseStorageProviderURLs(sceneData),
      name: sceneName,
      scenePath: sceneID,
      thumbnailUrl: `${fileServer}/projects/${projectName}/${sceneName}.thumbnail.jpg`,
      project: projectName
    })
    if (sceneRoot) {
      getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([sceneRoot])

      LocationState.setLocationName(sceneID)
      getMutableState(LocationState).currentLocation.location.sceneId.set(sceneID)
    }
    return () => {
      SceneState.unloadScene(sceneID)
    }
  },

  loadSceneGLTFOffline: (file: string) => {
    const gltfEntity = GLTFState.load(config.client.fileServer + '/' + file)
    getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([gltfEntity])
    const sceneID = getModelSceneID(gltfEntity)
    LocationState.setLocationName(sceneID)
    getMutableState(LocationState).currentLocation.location.sceneId.set(sceneID)

    return () => {
      GLTFState.unload(config.client.fileServer + '/' + file, gltfEntity)
    }
  }
}
