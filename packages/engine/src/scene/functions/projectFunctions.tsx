import { Config } from '@xrengine/common/src/config'
import i18n from 'i18next'
import { fetchUrl } from './fetchUrl'
import { getToken } from './getToken'
import { upload } from './upload'

export const serverURL = Config.publicRuntimeConfig.apiServer

globalThis.filesToUpload = globalThis.filesToUpload ?? {}

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

  const response = await fetchUrl(`${serverURL}/project`, { headers })

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
  const token = getToken()
  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`
  }

  const response = await fetchUrl(`${serverURL}/project/${projectId}`, {
    headers
  })
  const json = await response.json()
  console.log('Response: ' + Object.values(response))

  return json
}

/**
 * createProject used to create project.
 *
 * @author Robert Long
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

  const token = getToken()

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`
  }

  const project = {
    name: scene.name,
    filesToUpload: {
      thumbnailOwnedFileId: {
        file_id: thumbnailFileId,
        file_token: thumbnailFileToken
      }
    },
    project_file_id: projectFileId,
    project_file_token: projectFileToken
  }

  if (parentSceneId) {
    project['parent_scene_id'] = parentSceneId
  }

  Object.assign(project.filesToUpload, globalThis.filesToUpload)

  const body = JSON.stringify({ project })

  const projectEndpoint = `${serverURL}/project`

  const resp = await fetchUrl(projectEndpoint, { method: 'POST', headers, body, signal })
  console.log('Response: ' + Object.values(resp))

  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  if (resp.status !== 200) {
    throw new Error(i18n.t('editor:errors.projectCreationFail', { reason: await resp.text() }))
  }

  return await resp.json()
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

  const resp = await fetchUrl(projectEndpoint, { method: 'DELETE', headers })
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

  const token = getToken()

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`
  }

  const project = {
    name: editor.scene.name,
    filesToUpload: {
      thumbnailOwnedFileId: {
        file_id: thumbnailFileId,
        file_token: thumbnailFileToken
      }
    },
    project_file_id: projectFileId,
    project_file_token: projectFileToken
  }

  const sceneId = editor.scene.metadata && editor.scene.metadata.sceneId ? editor.scene.metadata.sceneId : null

  if (sceneId) {
    project['scene_id'] = sceneId
  }

  Object.assign(project.filesToUpload, globalThis.filesToUpload)

  const body = JSON.stringify({
    project
  })
  // console.log("EDITOR JSON IS");
  // console.log(project);

  const projectEndpoint = `${serverURL}/project/${projectId}`
  // Calling api to save project
  const resp = await fetchUrl(projectEndpoint, { method: 'PATCH', headers, body, signal })
  console.log('Response: ' + Object.values(resp))

  const json = await resp.json()

  if (signal.aborted) {
    throw new Error(i18n.t('editor:errors.saveProjectAborted'))
  }

  if (resp.status !== 200) {
    throw new Error(i18n.t('editor:errors.savingProjectFail', { reason: await resp.text() }))
  }

  return json
}
