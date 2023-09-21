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

import { Color, FileLoader, MathUtils, Texture } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { defineState, getMutableState, none } from '@etherealengine/hyperflux'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { NameComponent } from '../../scene/components/NameComponent'
import { SceneTagComponent } from '../../scene/components/SceneTagComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { setComponent } from '../functions/ComponentFunctions'
import { createEntity } from '../functions/EntityFunctions'
import { EntityTreeComponent } from '../functions/EntityTree'
import { Engine } from './Engine'

export interface StagedScene {
  data?: SceneJson
  load: boolean
  loadProgress: {
    textures: number
    geometries: number
    rigidbodies: number
  }
}

export const SceneState = defineState({
  name: 'SceneState',

  initial: () => {
    const sceneEntity = createEntity()
    setComponent(sceneEntity, NameComponent, 'scenes')
    setComponent(sceneEntity, VisibleComponent, true)
    setComponent(sceneEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(sceneEntity, SceneTagComponent, true)
    setComponent(sceneEntity, TransformComponent)
    setComponent(sceneEntity, EntityTreeComponent, { parentEntity: null })

    return {
      sceneEntity,
      scenes: {} as Record<string, StagedScene>,
      background: null as null | Color | Texture
    }
  },

  fetchScene: (url: string) => {
    const scene = getMutableState(SceneState).scenes[url]
    if (!scene.value) {
      scene.set({
        data: undefined,
        loadProgress: {
          textures: 0,
          geometries: 0,
          rigidbodies: 0
        },
        load: false
      })

      const resolvedURL = AssetLoader.getAbsolutePath(url)
      const fileLoader = new FileLoader()
      fileLoader.load(resolvedURL, (data) => {})
      Engine.instance.api
        .service('scene')
        .get({ url, metadataOnly: null }, {})
        .then((sceneData) => {
          if (scene.value) scene.data.set(sceneData.data.scene)
        })
    }
    return scene
  },

  loadScene: (url: string) => {},

  unloadScene: (url: string) => {},

  // @todo: deprecate the below methods; all scenes should be addressible by a url

  fetchProjectScene: (projectName: string, sceneName: string) => {
    const scene = getMutableState(SceneState).scenes[projectName + '/' + sceneName]
    if (!scene.value) {
      scene.set({
        data: undefined,
        loadProgress: {
          textures: 0,
          geometries: 0,
          rigidbodies: 0
        },
        load: false
      })
      Engine.instance.api
        .service('scene')
        .get({ projectName, sceneName, metadataOnly: null }, {})
        .then((sceneData) => {
          if (scene.value) scene.data.set(sceneData.data.scene)
        })
    }
    return scene
  },

  loadProjectScene: (projectName: string, sceneName: string) => {
    SceneState.fetchProjectScene(projectName, sceneName).load.set(true)
  },

  unloadProjectScene: (projectName: string, sceneName: string) => {
    getMutableState(SceneState).scenes[projectName + '/' + sceneName].set(none)
  }
})

export const SceneServices = {
  /** @deprecated */
  setCurrentScene: async (projectName: string, sceneName: string) => {
    SceneState.loadScene(projectName, sceneName)
    // const sceneData = await Engine.instance.api.service('scene').get({ projectName, sceneName, metadataOnly: null }, {})
    // getMutableState(SceneState).sceneData.set(sceneData.data)
  }
}
