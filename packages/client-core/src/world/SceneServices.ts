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
import { Engine, UUIDComponent, getComponent, getMutableComponent } from '@etherealengine/ecs'
import { GLTFSourceState } from '@etherealengine/engine/src/gltf/GLTFState'
import { getMutableState } from '@etherealengine/hyperflux'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { LocationSceneState, LocationState } from '../social/services/LocationService'

const fileServer = config.client.fileServer

export const SceneServices = {
  setCurrentScene: (sceneURL: string, overrideLocation = false) => {
    const source = fileServer + '/' + sceneURL
    const gltfEntity = GLTFSourceState.load(source)
    getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([gltfEntity])
    getMutableState(LocationSceneState)[sceneURL].set(gltfEntity)

    if (overrideLocation) {
      const sourceID = `${getComponent(gltfEntity, UUIDComponent)}-${source}`
      LocationState.setLocationName(sourceID)
      getMutableState(LocationState).currentLocation.location.sceneId.set(sourceID)
    }

    return () => {
      GLTFSourceState.unload(gltfEntity)
      getMutableState(LocationSceneState)[sceneURL].set(gltfEntity)
    }
  }
}
