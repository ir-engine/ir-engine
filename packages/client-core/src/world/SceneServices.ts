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
import { parseStorageProviderURLs } from '@etherealengine/common/src/utils/parseSceneJSON'
import { Engine, getMutableComponent } from '@etherealengine/ecs'
import { GLTFState } from '@etherealengine/engine/src/scene/GLTFState'
import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { getModelSceneID } from '@etherealengine/engine/src/scene/functions/loaders/ModelFunctions'
import { getMutableState } from '@etherealengine/hyperflux'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { LocationState } from '../social/services/LocationService'

const fileServer = config.client.fileServer

export const SceneServices = {
  /** @todo this can be simplified once .scene.json support is dropped */
  setCurrentScene: (sceneURL: string, overrideLocation = false) => {
    const isGLTF = sceneURL.endsWith('.gltf')
    if (isGLTF) {
      const gltfEntity = GLTFState.load(fileServer + '/' + sceneURL)
      getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([gltfEntity])

      if (overrideLocation) {
        const sceneID = getModelSceneID(gltfEntity)
        LocationState.setLocationName(sceneID)
        getMutableState(LocationState).currentLocation.location.sceneId.set(sceneID)
      }

      return () => {
        GLTFState.unload(fileServer + '/' + sceneURL, gltfEntity)
      }
    }

    let unmounted = false

    const sceneID = sceneURL.endsWith('.scene.json') ? sceneURL : sceneURL + '.scene.json'

    fetch(`${fileServer}/${sceneID}`).then(async (data) => {
      if (unmounted) return
      const sceneJSON = await data.json()
      if (unmounted) return
      const sceneRoot = SceneState.loadScene(sceneID, {
        scene: parseStorageProviderURLs(sceneJSON),
        name: sceneID.split('/')[2],
        thumbnailUrl: `${fileServer}/${sceneID.replace('.scene.json', '.thumbnail.jpg')}`,
        project: sceneID.split('/')[1]
      })
      if (sceneRoot) {
        getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([sceneRoot])

        if (overrideLocation) {
          LocationState.setLocationName(sceneID)
          getMutableState(LocationState).currentLocation.location.sceneId.set(sceneID)
        }
      }
    })

    return () => {
      unmounted = true
      SceneState.unloadScene(sceneID)
    }
  }
}
