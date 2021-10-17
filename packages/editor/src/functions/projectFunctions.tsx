import i18n from 'i18next'
import { Config } from '@xrengine/common/src/config'
import { SceneInterface } from '@xrengine/common/src/interfaces/SceneInterface'
import { getToken } from './getToken'
import { upload } from '@xrengine/client-core/src/util/upload'
import { ProjectManager } from '../managers/ProjectManager'
import { SceneManager } from '../managers/SceneManager'

const serverURL = Config.publicRuntimeConfig.apiServer

/**
 * getProjects used to get list projects created by user.
 *
 * @return {Promise}
 */
export const getProjects = async (): Promise<any> => {
  const token = getToken()

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`
  }

  const response = await fetch(`${serverURL}/project`, { headers })

  const json = await response.json().catch((err) => {
    console.log('Error fetching JSON')
    console.log(err)
  })

  if (!Array.isArray(json.projects) || json.projects == null) {
    throw new Error(
      i18n.t('editor:errors.fetchingProjectError', { error: json.error || i18n.t('editor:errors.unknownError') })
    )
  }

  return json.projects
}

/**
 * Function to get project data.
 *
 * @param projectId
 * @returns
 */
export const getProject = async (projectId): Promise<JSON> => {
  try {
    const json = await ProjectManager.instance.feathersClient.service('scene').get(projectId)
    return json
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }
}

/**
 * createProject used to create project.
 *
 * @author Robert Long
 * @author Abhishek Pathak
 * @param  {any}  scene         [contains the data related to scene]
 * @param  {any}  parentSceneId
 * @param  {any}  thumbnailBlob [thumbnail data]
 * @param  {any}  signal        [used to check if signal is not aborted]
 * @param  {any}  showDialog    [shows the message dialog]
 * @param  {any}  hideDialog
 * @return {Promise}               [response as json]
 */
export const createProject = async (
  scene,
  parentSceneId,
  thumbnailBlob,
  signal,
  showDialog,
  hideDialog
): Promise<any> => {
  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  // uploading thumbnail providing file_id and meta
  const {
    file_id: thumbnailFileId,
    meta: { access_token: thumbnailFileToken }
  } = (await upload(thumbnailBlob, undefined, signal, 'thumbnailOwnedFileId')) as any

  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  const serializedScene = await scene.serialize()
  const projectBlob = new Blob([JSON.stringify(serializedScene)], { type: 'application/json' })
  const {
    file_id: projectFileId,
    meta: { access_token: projectFileToken }
  } = (await upload(projectBlob, undefined, signal)) as any

  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  const sceneData = {
    name: scene.name,
    thumbnailOwnedFileId: {
      file_id: thumbnailFileId,
      file_token: thumbnailFileToken
    },
    ownedFileIds: {},
    scene_file_id: projectFileId,
    scene_file_token: projectFileToken
  }

  if (parentSceneId) {
    sceneData['parent_scene_id'] = parentSceneId
  }
  ProjectManager.instance.ownedFileIds = Object.assign(
    {},
    ProjectManager.instance.ownedFileIds,
    ProjectManager.instance.currentOwnedFileIds
  )
  sceneData.ownedFileIds = Object.assign({}, sceneData.ownedFileIds, ProjectManager.instance.ownedFileIds)
  ProjectManager.instance.currentOwnedFileIds = {}

  let json: any = {}
  try {
    json = (await ProjectManager.instance.feathersClient
      .service('scene')
      .create({ scene: sceneData })) as SceneInterface
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }

  return json
}

/**
 * deleteProject used to delete project using projectId.
 *
 * @author Robert Long
 * @param  {any}  projectId
 * @return {Promise}
 */
export const deleteProject = async (projectId): Promise<any> => {
  const token = getToken()

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`
  }

  const projectEndpoint = `${serverURL}/project/${projectId}`

  const resp = await fetch(projectEndpoint, { method: 'DELETE', headers })
  console.log('Response: ' + Object.values(resp))

  if (resp.status === 401) {
    throw new Error(i18n.t('editor:errors.notAuthenticated'))
  }

  if (resp.status !== 200) {
    throw new Error(i18n.t('editor:errors.projectDeletionFail', { reason: await resp.text() }))
  }

  return true
}

/**
 * saveProject used to save changes in existing project.
 *
 * @author Robert Long
 * @author Abhishek Pathak
 * @param  {any}  projectId
 * @param  {any}  signal
 * @return {Promise}
 */
export const saveProject = async (projectId, signal): Promise<any> => {
  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  const thumbnailBlob = await SceneManager.instance.takeScreenshot(512, 320) // Fixed blob undefined

  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  const {
    file_id: thumbnailFileId,
    meta: { access_token: thumbnailFileToken }
  } = (await upload(thumbnailBlob, undefined, signal, 'thumbnailOwnedFileId', projectId)) as any

  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  const scene = SceneManager.instance.scene
  const serializedScene = await scene.serialize(projectId)
  const projectBlob = new Blob([JSON.stringify(serializedScene)], { type: 'application/json' })
  const {
    file_id: projectFileId,
    meta: { access_token: projectFileToken }
  } = (await upload(projectBlob, undefined, signal)) as any

  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  const project = {
    name: scene.name,
    thumbnailOwnedFileId: {
      file_id: thumbnailFileId,
      file_token: thumbnailFileToken
    },
    ownedFileIds: {},
    project_file_id: projectFileId,
    project_file_token: projectFileToken
  }

  const sceneId = scene.metadata && scene.metadata.sceneId ? scene.metadata.sceneId : null

  if (sceneId) {
    project['scene_id'] = sceneId
  }

  ProjectManager.instance.ownedFileIds = Object.assign(
    {},
    ProjectManager.instance.ownedFileIds,
    ProjectManager.instance.currentOwnedFileIds
  )
  project.ownedFileIds = Object.assign({}, project.ownedFileIds, ProjectManager.instance.ownedFileIds)
  ProjectManager.instance.currentOwnedFileIds = {}

  let json = {}
  try {
    json = await ProjectManager.instance.feathersClient.service('scene').patch(projectId, { project })
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }
  return json
}
