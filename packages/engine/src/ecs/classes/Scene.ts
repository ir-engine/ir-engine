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

import { defineState, getMutableState, getState, none } from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { ComponentJson, EntityJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { SceneDataType, SceneID, scenePath } from '../../schemas/projects/scene.schema'
import { Component } from '../functions/ComponentFunctions'
import { Engine } from './Engine'
import { UndefinedEntity } from './Entity'

export interface StagedScene {
  data: SceneDataType
}

export const SceneState = defineState({
  name: 'SceneState',
  initial: () => ({
    scenes: {} as Record<SceneID, StagedScene>,
    /** @todo replace activeScene with proper multi-scene support */
    activeScene: null as null | SceneID,
    background: null as null | Color | Texture
  }),

  addEntitiesToScene: (sceneID: SceneID, entities: Record<EntityUUID, EntityJson>) => {
    const scene = getMutableState(SceneState).scenes[sceneID]
    for (const [uuid, data] of Object.entries(entities)) {
      scene.data.scene.entities[uuid].set(data)
    }
  },

  addComponentsToEntity: (entityUUID: EntityUUID, components: ComponentJson[]) => {
    const sceneState = getMutableState(SceneState)
    const sceneID = sceneState.scenes.keys.find((sceneID) => {
      return sceneState.scenes[sceneID].data.scene.entities[entityUUID]
    })
    if (!sceneID) throw new Error(`Entity ${entityUUID} does not exist in any scene`)
    const scene = getMutableState(SceneState).scenes[sceneID]
    const entity = scene.data.scene.entities[entityUUID]
    if (!entity) throw new Error(`Entity ${entityUUID} does not exist in scene ${sceneID}`)
    for (const component of components) {
      const index = entity.components.findIndex((c) => c.value.name === component.name)
      if (index === -1) entity.components[entity.components.length].set(component)
      else entity.components[index].set(component)
    }
  },

  entityHasComponent: <C extends Component>(entityUUID: EntityUUID, component: C) => {
    const sceneState = getState(SceneState)
    const entityJson = sceneState.scenes[sceneState.activeScene!].data.scene.entities[entityUUID]
    return entityJson.components.some((componentJson) => componentJson.name === component.jsonID)
  },

  loadScene: (sceneID: SceneID, data: SceneDataType) => {
    getMutableState(SceneState).scenes[sceneID].set({ data })
    getMutableState(SceneState).activeScene.set(sceneID)
  },

  unloadScene: (sceneID: SceneID) => {
    getMutableState(SceneState).scenes[sceneID].set(none)
    if (getState(SceneState).activeScene === sceneID) {
      getMutableState(SceneState).activeScene.set(null)
    }
  },

  getRootEntity: (sceneID?: SceneID) => {
    const activeScene = getState(SceneState).activeScene
    if (!sceneID && !activeScene) return UndefinedEntity
    const scene = getState(SceneState).scenes[sceneID ?? activeScene!]
    return UUIDComponent.entitiesByUUID[scene.data.scene.root]
  }
})

export const SceneServices = {
  setCurrentScene: async (projectName: string, sceneName: string) => {
    const sceneData = await Engine.instance.api
      .service(scenePath)
      .get(null, { query: { project: projectName, name: sceneName } })
    /**@todo replace projectName/sceneName with sceneID once #9119 */
    SceneState.loadScene(`${projectName}/${sceneName}` as SceneID, sceneData)
  }
}
