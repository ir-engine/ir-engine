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

import i18n from 'i18next'

import { API } from '@etherealengine/client-core/src/API'
import { RouterState } from '@etherealengine/client-core/src/common/services/RouterService'
import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import multiLogger from '@etherealengine/engine/src/common/functions/logger'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { getComponent, hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { iterateEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { GLTFLoadedComponent } from '@etherealengine/engine/src/scene/components/GLTFLoadedComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { sceneDataPath } from '@etherealengine/engine/src/schemas/projects/scene-data.schema'
import { sceneUploadPath } from '@etherealengine/engine/src/schemas/projects/scene-upload.schema'
import { SceneID, scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { getState } from '@etherealengine/hyperflux'
import { EditorState } from '../services/EditorServices'

const logger = multiLogger.child({ component: 'editor:sceneFunctions' })

/**
 * getScenes used to get list projects created by user.
 *
 * @return {Promise}
 */
export const getScenes = async (projectName: string): Promise<SceneData[]> => {
  try {
    const result = await API.instance.client
      .service(sceneDataPath)
      .get(null, { query: { projectName, metadataOnly: true } })
    return result?.data
  } catch (error) {
    logger.error(error, 'Error in getting project getScenes()')
    throw error
  }
}

/**
 * Function to get project data.
 *
 * @param projectId
 * @returns
 */
export const getScene = async (projectName: string, sceneName: string, metadataOnly = true): Promise<SceneData> => {
  try {
    return await API.instance.client
      .service(scenePath)
      .get(null, { query: { project: projectName, name: sceneName, metadataOnly: metadataOnly } })
  } catch (error) {
    logger.error(error, 'Error in getting project getScene()')
    throw error
  }
}

/**
 * deleteScene used to delete project using projectId.
 *
 * @param  {SceneID}  sceneId
 * @return {Promise}
 */
export const deleteScene = async (projectName, sceneName): Promise<any> => {
  try {
    await API.instance.client.service(scenePath).remove(null, { query: { project: projectName, name: sceneName } })
  } catch (error) {
    logger.error(error, 'Error in deleting project')
    throw error
  }
  return true
}

export const renameScene = async (projectName: string, newSceneName: string, oldSceneName: string): Promise<any> => {
  try {
    await API.instance.client.service(scenePath).patch(null, { newSceneName, oldSceneName, project: projectName })
  } catch (error) {
    logger.error(error, 'Error in renaming project')
    throw error
  }
  return true
}

/**
 * saveScene used to save changes in existing project.
 *
 * @param {string} projectName
 * @param  {any}  sceneName
 * @param {File | null} thumbnailFile
 * @param  {any}  signal
 * @return {Promise}
 */
export const saveScene = async (
  projectName: string,
  sceneName: string,
  thumbnailFile: File | null,
  signal: AbortSignal
) => {
  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const sceneData = getState(SceneState).scenes[getState(SceneState).activeScene!].snapshots.at(-1)?.data

  try {
    if (!sceneData) throw new Error(i18n.t('editor:errors.sceneDataNotFound'))
    //remove gltf data from scene data
    for (const entityUUID of Object.keys(sceneData.entities)) {
      if (!sceneData.entities[entityUUID]) continue //entity has already been removed from save data
      const entity = UUIDComponent.entitiesByUUID[entityUUID as EntityUUID]
      if (hasComponent(entity, GLTFLoadedComponent)) {
        //delete anything that is a child of any GLTF-loaded entity
        iterateEntityNode(entity, (entity) => {
          if (!hasComponent(entity, UUIDComponent)) return
          delete sceneData.entities[getComponent(entity, UUIDComponent)]
        })
      }
    }
    return await uploadToFeathersService(sceneUploadPath, thumbnailFile ? [thumbnailFile] : [], {
      project: projectName,
      name: sceneName,
      sceneData
    }).promise
  } catch (error) {
    logger.error(error, 'Error in saving project')
    throw error
  }
}

export const reRouteToLoadScene = async (newSceneName: string) => {
  const { projectName, sceneName } = getState(EditorState)
  if (sceneName === newSceneName) return
  if (!projectName || !newSceneName) return
  RouterState.navigate(`/studio/${projectName}/${newSceneName}`)
}

export const onNewScene = async () => {
  const { projectName } = getState(EditorState)
  if (!projectName) return

  try {
    const sceneData = await createNewScene(projectName)
    if (!sceneData) return

    reRouteToLoadScene(sceneData.name)
  } catch (error) {
    logger.error(error)
  }
}

export const createNewScene = async (projectName: string) => {
  try {
    return API.instance.client.service(scenePath).create({ project: projectName })
  } catch (error) {
    logger.error(error, 'Error in creating project')
    throw error
  }
}
