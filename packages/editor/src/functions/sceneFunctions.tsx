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

import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import multiLogger from '@etherealengine/engine/src/common/functions/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { SceneDataType, sceneDataPath } from '@etherealengine/engine/src/schemas/projects/scene-data.schema'
import { sceneUploadPath } from '@etherealengine/engine/src/schemas/projects/scene-upload.schema'
import { SceneID, scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { getState } from '@etherealengine/hyperflux'
import { SceneParams } from '@etherealengine/server-core/src/projects/scene/scene.class'

const logger = multiLogger.child({ component: 'editor:sceneFunctions' })

/**
 * getScenes used to get list projects created by user.
 *
 * @return {Promise}
 */
export const getScenes = async (projectName: string): Promise<SceneDataType[]> => {
  try {
    const params = { query: { metadataOnly: true, paginate: false, projectName: projectName } } as SceneParams
    const result = (await Engine.instance.api.service(sceneDataPath).find(params)) as SceneDataType[]
    return result
  } catch (error) {
    logger.error(error, 'Error in getting project getScenes()')
    throw error
  }
}

/**
 * Function to get scene data.
 *
 * @param projectId
 * @returns
 */
export const getScene = async (sceneId: string, metadataOnly = true): Promise<SceneDataType> => {
  try {
    return await Engine.instance.api
      .service(sceneDataPath)
      .get(sceneId as SceneID, { query: { metadataOnly: metadataOnly } })
  } catch (error) {
    logger.error(error, 'Error in getting project getScene()')
    throw error
  }
}

/**
 * deleteScene used to delete scene using projectId.
 *
 * @param  {SceneID}  sceneId
 * @return {Promise}
 */
export const deleteScene = async (sceneId: SceneID, projectName?: string): Promise<any> => {
  try {
    await Engine.instance.api.service(scenePath).remove(sceneId, { query: { projectName } })
  } catch (error) {
    logger.error(error, 'Error in deleting scene')
    throw error
  }
  return true
}

export const renameScene = async (
  sceneId: SceneID,
  newSceneName: string,
  oldSceneName: string,
  projectName: string
): Promise<any> => {
  try {
    await Engine.instance.api.service(sceneDataPath).patch(sceneId, { newSceneName, oldSceneName, projectName })
  } catch (error) {
    logger.error(error, 'Error in renaming scene')
    throw error
  }
  return true
}

/**
 * saveScene used to save changes in existing scene.
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

  const sceneData = getState(SceneState).scenes[getState(SceneState).activeScene!].snapshots.at(-1)?.data.scene

  try {
    return await uploadToFeathersService(sceneUploadPath, thumbnailFile ? [thumbnailFile] : [], {
      projectName,
      name: sceneName,
      sceneData
    }).promise
  } catch (error) {
    logger.error(error, 'Error in saving scene')
    throw error
  }
}

export const createNewScene = async (projectName: string) => {
  try {
    return Engine.instance.api.service(sceneDataPath).create({ projectName })
  } catch (error) {
    logger.error(error, 'Error in creating scene')
    throw error
  }
}
