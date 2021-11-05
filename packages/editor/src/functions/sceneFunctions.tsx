import i18n from 'i18next'
import { SceneDetailInterface } from '@xrengine/common/src/interfaces/SceneInterface'
import { SceneManager } from '../managers/SceneManager'
import { client } from '@xrengine/client-core/src/feathers'

/**
 * getScenes used to get list projects created by user.
 *
 * @return {Promise}
 */
export const getScenes = async (projectName: string): Promise<SceneDetailInterface[]> => {
  try {
    const { data } = await client.service('scenes').get({ projectName, metadataOnly: true })
    return data
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }
}

/**
 * Function to get project data.
 *
 * @param projectId
 * @returns
 */
export const getScene = async (
  projectName: string,
  sceneName: string,
  metadataOnly = true
): Promise<SceneDetailInterface> => {
  try {
    const { data } = await client.service('scene').get({ projectName, sceneName, metadataOnly })
    return data
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }
}

/**
 * deleteScene used to delete project using projectId.
 *
 * @author Robert Long
 * @param  {any}  sceneId
 * @return {Promise}
 */
export const deleteScene = async (projectName, sceneName): Promise<any> => {
  // try {
  //   await client.service('scene').remove({ projectName, sceneName })
  // } catch (error) {
  //   console.log('Error in Getting Project:' + error)
  //   throw new Error(error)
  // }
  // return true
}

/**
 * saveScene used to save changes in existing project.
 *
 * @author Robert Long
 * @author Abhishek Pathak
 * @param  {any}  sceneName
 * @param  {any}  signal
 * @return {Promise}
 */
export const saveScene = async (projectName: string, sceneName: string, thumbnailBlob: Blob, signal) => {
  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  const thumbnailBuffer = await thumbnailBlob.arrayBuffer()

  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  const sceneNode = SceneManager.instance.scene
  const sceneData = await sceneNode.serialize(sceneName)

  try {
    return (await client
      .service('scene')
      .update(projectName, { sceneName, sceneData, thumbnailBuffer })) as SceneDetailInterface
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }
}
