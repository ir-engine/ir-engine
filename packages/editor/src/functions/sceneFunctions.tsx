import i18n from 'i18next'

import { API } from '@xrengine/client-core/src/API'
import { SceneData } from '@xrengine/common/src/interfaces/SceneInterface'
import multiLogger from '@xrengine/common/src/logger'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'

const logger = multiLogger.child({ component: 'editor:sceneFunctions' })

/**
 * getScenes used to get list projects created by user.
 *
 * @return {Promise}
 */
export const getScenes = async (projectName: string): Promise<SceneData[]> => {
  try {
    const result = await API.instance.client.service('scene-data').get({ projectName, metadataOnly: true })
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
    const { data } = await API.instance.client.service('scene').get({ projectName, sceneName, metadataOnly })
    return data
  } catch (error) {
    logger.error(error, 'Error in getting project getScene()')
    throw error
  }
}

/**
 * deleteScene used to delete project using projectId.
 *
 * @param  {any}  sceneId
 * @return {Promise}
 */
export const deleteScene = async (projectName, sceneName): Promise<any> => {
  try {
    await API.instance.client.service('scene').remove({ projectName, sceneName })
  } catch (error) {
    logger.error(error, 'Error in deleting project')
    throw error
  }
  return true
}

export const renameScene = async (projectName: string, newSceneName: string, oldSceneName: string): Promise<any> => {
  try {
    await API.instance.client.service('scene').patch(null, { newSceneName, oldSceneName, projectName })
  } catch (error) {
    logger.error(error, 'Error in renaming project')
    throw error
  }
  return true
}

/**
 * saveScene used to save changes in existing project.
 *
 * @param  {any}  sceneName
 * @param  {any}  signal
 * @return {Promise}
 */
export const saveScene = async (
  projectName: string,
  sceneName: string,
  thumbnailBlob: Blob | null,
  signal: AbortSignal
) => {
  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const thumbnailBuffer = thumbnailBlob ? await thumbnailBlob.arrayBuffer() : undefined

  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const sceneData = serializeWorld()

  try {
    return await API.instance.client.service('scene').update(projectName, { sceneName, sceneData, thumbnailBuffer })
  } catch (error) {
    logger.error(error, 'Error in saving project')
    throw error
  }
}

export const createNewScene = async (projectName: string): Promise<{ projectName: string; sceneName: string }> => {
  try {
    return API.instance.client.service('scene').create({ projectName })
  } catch (error) {
    logger.error(error, 'Error in creating project')
    throw error
  }
}
