import { Config } from '@xrengine/common/src/config'
import i18n from 'i18next'
import { getToken } from './getToken'
import { upload } from './upload'

const serverURL = Config.publicRuntimeConfig.apiServer

globalThis.ownedFileIds = globalThis.ownedFileIds ?? {}
globalThis.currentOwnedFileIds = {}

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
    const json = await globalThis.Editor.feathersClient.service('project').get(projectId)
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

  if (parentSceneId) {
    project['parent_scene_id'] = parentSceneId
  }
  Object.assign(globalThis.ownedFileIds, globalThis.currentOwnedFileIds)
  Object.assign(project.ownedFileIds, globalThis.ownedFileIds)
  globalThis.currentOwnedFileIds = {}

  let json = {}
  try {
    json = await globalThis.Editor.feathersClient.service('project').create({ project })
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
 * @param  {any}  editor
 * @param  {any}  signal
 * @param  {any}  showDialog [used to show the message dialog]
 * @param  {any}  hideDialog
 * @return {Promise}
 */
export const saveProject = async (projectId, editor, signal, showDialog, hideDialog): Promise<any> => {
  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  const thumbnailBlob = await editor.takeScreenshot(512, 320) // Fixed blob undefined

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

  const serializedScene = await editor.scene.serialize(projectId)
  const projectBlob = new Blob([JSON.stringify(serializedScene)], { type: 'application/json' })
  const {
    file_id: projectFileId,
    meta: { access_token: projectFileToken }
  } = (await upload(projectBlob, undefined, signal)) as any

  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  const project = {
    name: editor.scene.name,
    thumbnailOwnedFileId: {
      file_id: thumbnailFileId,
      file_token: thumbnailFileToken
    },
    ownedFileIds: {},
    project_file_id: projectFileId,
    project_file_token: projectFileToken
  }

  const sceneId = editor.scene.metadata && editor.scene.metadata.sceneId ? editor.scene.metadata.sceneId : null

  if (sceneId) {
    project['scene_id'] = sceneId
  }

  Object.assign(globalThis.ownedFileIds, globalThis.currentOwnedFileIds)
  Object.assign(project.ownedFileIds, globalThis.ownedFileIds)
  globalThis.currentOwnedFileIds = {}

  let json = {}
  try {
    json = await globalThis.Editor.feathersClient.service('project').patch(projectId, { project })
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }
  return json
}
