import { RethrownError } from '@xrengine/engine/src/scene/functions/errors'
import i18n from 'i18next'
import jwtDecode from 'jwt-decode'
import { AudioFileTypes, matchesFileTypes } from './assets/fileTypes'
import configs from './configs'
import PerformanceCheckDialog from './dialogs/PerformanceCheckDialog'
import { ProgressDialog } from './dialogs/ProgressDialog'
import PublishDialog from './dialogs/PublishDialog'
import PublishedSceneDialog from './dialogs/PublishedSceneDialog'

const resolveMediaCache = new Map()
export const serverURL = (configs as any).SERVER_URL

const APP_URL = (configs as any).APP_URL
const FEATHERS_STORE_KEY = (configs as any).FEATHERS_STORE_KEY

const nonCorsProxyDomains = (serverURL || '').split(',')
nonCorsProxyDomains.push(serverURL)

const maxUploadSize = 128
globalThis.filesToUpload = globalThis.filesToUpload ?? {}

/**
 * scaledThumbnailUrlFor function component for providing url for scaled thumbnail.
 *
 * @author Robert Long
 * @param  {any} url    [contains thumbnail url]
 * @param  {any} width
 * @param  {any} height
 * @return {any}        [returns url to get scaled image]
 */
export const scaledThumbnailUrlFor = (url, width, height) => {
  return `${serverURL}/thumbnail/${url}?w=${width}&h=${height}`
}

/**
 * CommonKnownContentTypes object containing common content types.
 *
 * @author Robert Long
 * @type {Object}
 */
export const CommonKnownContentTypes = {
  gltf: 'model/gltf',
  glb: 'model/gltf-binary',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg'
}

/**
 * guessContentType function to get contentType from url.
 *
 * @author Robert Long
 * @param  {any} url
 * @return {string}     [contentType]
 */
export function guessContentType(url): string {
  const extension = new URL(url).pathname.split('.').pop()
  return CommonKnownContentTypes[extension]
}

/**
 * getToken used to get the token of logined user.
 *
 * @author Robert Long
 * @return {string}        [returns token string]
 */
export const getToken = (): string => {
  const token = localStorage.getItem(FEATHERS_STORE_KEY)

  if (token == null || token.length === 0) {
    throw new Error(i18n.t('editor:errors.notAuthenticated'))
  }

  return token
}

/**
 * getAccountId used to get accountId using token.
 *
 * @return {string}    [returns accountId]
 */
export const getAccountId = (): string => {
  const token = getToken()
  return (jwtDecode(token) as any).sub
}

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
 * fetchContentType is used to get the header content type of response using url.
 *
 * @author Robert Long
 * @param  {[type]}  url [ url to make the request]
 * @return {Promise}               [wait for the response and return response]
 */
export const fetchContentType = async (url): Promise<any> => {
  const f = await fetchUrl(url, { method: 'HEAD' }).then((r) => r.headers.get('content-type'))
  console.log('Response: ' + Object.values(f))

  return f
}

/**
 *  getContentType is used to get content type url.
 *  we firstly call resolve url and get response.
 *  if result Contains meta property and if meta contains expected_content_type  then returns true.
 *  we get url url from response call guessContentType to check contentType.
 *  and if in both ways we unable to find contentType type then call a request for headers using fetchContentType.
 *
 *
 * @author Robert Long
 * @param  {any}  contentUrl
 * @return {Promise}     [returns the contentType]
 */
export const getContentType = async (url): Promise<any> => {
  return guessContentType(url) || (await fetchContentType(url))
}

/**
 * resolveMedia provides url absoluteUrl and contentType.
 *
 * @author Robert Long
 * @param  {any}  url
 * @param  {any}  index
 * @return {Promise}
 */
export const resolveMedia = async (url, index?): Promise<any> => {
  url = new URL(url, (window as any).location).href

  if (url.startsWith(serverURL)) {
    return { url: url }
  }

  // createing cacheKey for absoluteUrl
  const cacheKey = `${url}|${index}`
  // if cacheKey already exist in media cache then return the response from cache.
  if (resolveMediaCache.has(cacheKey)) return resolveMediaCache.get(cacheKey)

  const request = (async () => {
    let contentType

    // getting contentType, url using absoluteUrl.
    try {
      contentType = guessContentType(url) || (await fetchContentType(url))
    } catch (error) {
      throw new RethrownError(i18n.t('editor:errors.resolveURL', { url: url }), error)
    }

    return { url, contentType }
  })()
  // setting cache key for data containing url, contentType
  resolveMediaCache.set(cacheKey, request)

  return request
}

/**
 * searchMedia function to search media on the basis of provided params.
 *
 * @author Robert Long
 * @param  {any}  source
 * @param  {any}  params
 * @param  {any}  cursor
 * @param  {any}  signal
 * @return {Promise}        [result , nextCursor, suggestions]
 */
export const searchMedia = async (source, params, cursor, signal): Promise<any> => {
  const url = new URL(`${serverURL}/media-search`)

  const headers: any = {
    'content-type': 'application/json'
  }

  const searchParams = url.searchParams

  searchParams.set('source', source)

  if (source === 'assets') {
    searchParams.set('user', getAccountId())
    const token = getToken()
    headers.authorization = `Bearer ${token}`
  }

  if (params.type) {
    searchParams.set('type', params.type)
  }

  if (params.query) {
    //checking BLOCK_SEARCH_TERMSsearchParams.set("q", params.query);
  }

  if (params.filter) {
    searchParams.set('filter', params.filter)
  }

  if (params.collection) {
    searchParams.set('collection', params.collection)
  }

  if (cursor) {
    searchParams.set('cursor', cursor)
  }

  console.log('Fetching...')
  const resp = await fetchUrl(url, { headers, signal })
  console.log('Response: ' + Object.values(resp))

  if (signal.aborted) {
    const error = new Error(i18n.t('editor:errors.mediaSearchAborted')) as any
    error['aborted'] = true
    throw error
  }

  const json = await resp.json()

  if (signal.aborted) {
    const error = new Error(i18n.t('editor:errors.mediaSearchAborted')) as any
    error['aborted'] = true
    throw error
  }

  const thumbnailedEntries =
    json &&
    json.entries &&
    json.entries.length > 0 &&
    json.entries.map((entry) => {
      if (entry.images && entry.images.preview && entry.images.preview.url) {
        entry.images.preview.url = scaledThumbnailUrlFor(entry.images.preview.url, 200, 200)
      }
      return entry
    })

  return {
    results: thumbnailedEntries ? thumbnailedEntries : [],
    suggestions: json.suggestions,
    nextCursor: json.meta?.next_cursor
  }
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

/**
 * getScene used to Calling api to get scene data using id.
 *
 * @author Robert Long
 */
export const getScene = async (sceneId): Promise<JSON> => {
  const headers = {
    'content-type': 'application/json'
  }

  const response = await fetchUrl(`${serverURL}/project/${sceneId}`, {
    headers
  })

  console.log('Response: ' + Object.values(response))

  const json = await response.json()

  return json.scenes[0]
}

/**
 * getSceneUrl used to create url for the scene.
 *
 * @author Robert Long
 * @param  {any} sceneId
 * @return {string}         [url]
 */
export const getSceneUrl = (sceneId): string => `${APP_URL}/scenes/${sceneId}`

/**
 * publishProject is used to publish project, firstly we save the project the publish.
 *
 * @author Robert Long
 * @param  {any}  project
 * @param  {any}  editor
 * @param  {any}  showDialog
 * @param  {any}  hideDialog
 * @return {Promise}            [returns published project data]
 */
export const publishProject = async (project, editor, showDialog, hideDialog?): Promise<any> => {
  let screenshotUrl
  try {
    const scene = editor.scene

    const abortController = new AbortController()
    const signal = abortController.signal

    // Save the scene if it has been modified.
    if (editor.sceneModified) {
      showDialog(ProgressDialog, {
        title: i18n.t('editor:saving'),
        message: i18n.t('editor:savingMsg'),
        cancelable: true,
        onCancel: () => {
          abortController.abort()
        }
      })
      // saving project.
      project = await saveProject(project.project_id, editor, signal, showDialog, hideDialog)

      if (signal.aborted) {
        const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
        error['aborted'] = true
        throw error
      }
    }

    showDialog(ProgressDialog, {
      title: i18n.t('editor:generateScreenshot'),
      message: i18n.t('editor:generateScreenshotMsg')
    })

    // Wait for 5ms so that the ProgressDialog shows up.
    await new Promise((resolve) => setTimeout(resolve, 5))

    // Take a screenshot of the scene from the current camera position to use as the thumbnail
    const screenshot = await editor.takeScreenshot()
    console.log('Screenshot is')
    console.log(screenshot)
    const { blob: screenshotBlob, cameraTransform: screenshotCameraTransform } = screenshot
    console.log('screenshotBlob is')
    console.log(screenshotBlob)

    screenshotUrl = URL.createObjectURL(screenshotBlob)

    console.log('Screenshot url is', screenshotUrl)

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    let { name } = scene.metadata

    name = (project.scene && project.scene.name) || name || editor.scene.name

    // Display the publish dialog and wait for the user to submit / cancel
    const publishParams: any = await new Promise((resolve) => {
      showDialog(PublishDialog, {
        screenshotUrl,
        initialSceneParams: {
          name
        },
        onCancel: () => resolve(null),
        onPublish: resolve
      })
    })

    // User clicked cancel
    if (!publishParams) {
      URL.revokeObjectURL(screenshotUrl)
      hideDialog()
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    // Update the scene with the metadata from the publishDialog
    scene.setMetadata({
      name: publishParams.name,
      previewCameraTransform: screenshotCameraTransform
    })

    showDialog(ProgressDialog, {
      title: i18n.t('editor:publishingScene'),
      message: i18n.t('editor:publishingSceneMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
      }
    })

    // Clone the existing scene, process it for exporting, and then export as a glb blob
    const { glbBlob, scores } = await editor.exportScene(abortController.signal, { scores: true })

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const performanceCheckResult = await new Promise((resolve) => {
      showDialog(PerformanceCheckDialog, {
        scores,
        onCancel: () => resolve(false),
        onConfirm: () => resolve(true)
      })
    })

    if (!performanceCheckResult) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    // Serialize Editor scene
    const serializedScene = await editor.scene.serialize(project.project_id)
    const sceneBlob = new Blob([JSON.stringify(serializedScene)], { type: 'application/json' })

    showDialog(ProgressDialog, {
      title: i18n.t('editor:publishingScene'),
      message: i18n.t('editor:publishingSceneMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
      }
    })

    const size = glbBlob.size / 1024 / 1024
    const maxSize = maxUploadSize
    if (size > maxSize) {
      throw new Error(i18n.t('editor:errors.sceneTooLarge', { size: size.toFixed(2), maxSize }))
    }

    showDialog(ProgressDialog, {
      title: i18n.t('editor:publishingScene'),
      message: i18n.t('editor:uploadingThumbnailMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
      }
    })

    // Upload the screenshot file
    const {
      file_id: screenshotId,
      meta: { access_token: screenshotToken }
    } = (await upload(screenshotBlob, undefined, abortController.signal)) as any

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const {
      file_id: glbId,
      meta: { access_token: glbToken }
    }: any = await upload(glbBlob, (uploadProgress) => {
      showDialog(
        ProgressDialog,
        {
          title: i18n.t('editor:publishingScene'),
          message: i18n.t('editor:uploadingSceneMsg', { percentage: Math.floor(uploadProgress * 100) }),
          onCancel: () => {
            abortController.abort()
          }
        },
        abortController.signal
      )
    })

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const {
      file_id: sceneFileId,
      meta: { access_token: sceneFileToken }
    } = (await upload(sceneBlob, undefined, abortController.signal)) as any

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const sceneParams = {
      screenshot_file_id: screenshotId,
      screenshot_file_token: screenshotToken,
      model_file_id: glbId,
      model_file_token: glbToken,
      scene_file_id: sceneFileId,
      scene_file_token: sceneFileToken,
      name: publishParams.name
    }

    const token = getToken()

    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    }
    const body = JSON.stringify({ scene: sceneParams })

    const resp = await fetchUrl(`${serverURL}/publish-project/${project.project_id}`, {
      method: 'POST',
      headers,
      body
    })

    console.log('Response: ' + Object.values(resp))

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    if (resp.status !== 200) {
      throw new Error(i18n.t('editor:errors.sceneCreationFail', { reason: await resp.text() }))
    }

    project = await resp.json()

    showDialog(PublishedSceneDialog, {
      sceneName: sceneParams.name,
      screenshotUrl,
      sceneUrl: getSceneUrl(project.scene.scene_id),
      onConfirm: () => {
        hideDialog()
      }
    })
  } finally {
    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl)
    }
  }

  return project
}

/**
 * upload used to upload image as blob data.
 *
 * @author Robert Long
 * @param  {any}  blob
 * @param  {any}  onUploadProgress
 * @param  {any}  signal
 * @param  {any}  projectId
 * @param  {string}  fileIdentifier
 * @return {Promise}
 */
export const upload = async (blob, onUploadProgress, signal?, fileIdentifier?, projectId?): Promise<void> => {
  const token = getToken()

  return await new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    const onAbort = () => {
      request.abort()
      const error = new Error(i18n.t('editor:errors.uploadAborted'))
      error.name = 'AbortError'
      error['aborted'] = true
      reject(error)
    }

    if (signal) {
      signal.addEventListener('abort', onAbort)
    }
    console.log('Posting to: ', `${serverURL}/media`)

    request.open('post', `${serverURL}/media`, true)

    request.upload.addEventListener('progress', (e) => {
      if (onUploadProgress) {
        onUploadProgress(e.loaded / e.total)
      }
    })

    request.addEventListener('error', (error) => {
      if (signal) {
        signal.removeEventListener('abort', onAbort)
      }
      reject(new RethrownError(i18n.t('editor:errors.uploadFailed'), error))
    })

    request.addEventListener('load', () => {
      if (signal) {
        signal.removeEventListener('abort', onAbort)
      }

      if (request.status < 300) {
        const response = JSON.parse(request.responseText)
        resolve(response)
      } else {
        reject(new Error(i18n.t('editor:errors.uploadFailed', { reason: request.statusText })))
      }
    })

    const formData = new FormData()
    if (projectId) {
      formData.set('projectId', projectId)
    }
    if (fileIdentifier) {
      formData.set('fileIdentifier', fileIdentifier)
    }

    formData.set('media', blob)
    request.setRequestHeader('Authorization', `Bearer ${token}`)

    request.send(formData)
  })
}
/**
 * uploadAssets used to upload asset files.
 *
 * @author Robert Long
 * @param  {any} editor     [contains editor data]
 * @param  {any} files      [files for upload]
 * @param  {any} onProgress
 * @param  {any} signal
 * @return {any}            [uploaded file assets]
 */
export const uploadAssets = async (editor, files, onProgress, signal): Promise<any> => {
  return await _uploadAssets(`${serverURL}/static-resource`, editor, files, onProgress, signal)
}

/**
 * _uploadAssets used as api handler for uploadAsset.
 *
 * @author Robert Long
 * @param  {any}  endpoint
 * @param  {any}  editor
 * @param  {any}  files
 * @param  {any}  onProgress
 * @param  {any}  signal
 * @return {Promise}            [assets file data]
 */
export const _uploadAssets = async (endpoint, editor, files, onProgress, signal): Promise<any> => {
  const assets = []

  for (const file of Array.from(files)) {
    if (signal.aborted) {
      break
    }

    const abortController = new AbortController()
    const onAbort = () => abortController.abort()
    signal.addEventListener('abort', onAbort)

    const asset = await _uploadAsset(
      endpoint,
      editor,
      file,
      (progress) => onProgress(assets.length + 1, files.length, progress),
      abortController.signal
    )

    assets.push(asset)
    signal.removeEventListener('abort', onAbort)

    if (signal.aborted) {
      break
    }
  }

  return assets
}

/**
 * uploadAsset used to upload single file as asset.
 *
 * @author Robert Long
 * @param {any} editor
 * @param {any} file
 * @param {any} onProgress
 * @param {any} signal
 */
export const uploadAsset = (editor, file, onProgress, signal): any => {
  return _uploadAsset(`${serverURL}/static-resource`, editor, file, onProgress, signal)
}

/**
 * uploadProjectAsset used to call _uploadAsset directly.
 *
 * @author Robert Long
 * @param {any} editor
 * @param {any} projectId
 * @param {any} file
 * @param {any} onProgress
 * @param {any} signal
 */
export const uploadProjectAsset = (editor, projectId, file, onProgress, signal): any => {
  return _uploadAsset(`${serverURL}/project/${projectId}/assets`, editor, file, onProgress, signal)
}

let lastUploadAssetRequest = 0
/**
 * _uploadAsset used as api handler for the uploadAsset.
 *
 * @author Robert Long
 * @param  {any}  endpoint
 * @param  {any}  editor
 * @param  {any}  file
 * @param  {any}  onProgress
 * @param  {any}  signal
 * @return {Promise}            [uploaded asset file data]
 */
export const _uploadAsset = async (endpoint, editor, file, onProgress, signal): Promise<any> => {
  let thumbnailFileId = null
  let thumbnailAccessToken = null

  if (!matchesFileTypes(file, AudioFileTypes)) {
    const thumbnailBlob = await editor.generateFileThumbnail(file)

    const response = (await upload(thumbnailBlob, undefined, signal)) as any

    thumbnailFileId = response.file_id
    thumbnailAccessToken = response.meta.access_token
  }

  const {
    file_id: assetFileId,
    meta: { access_token: assetAccessToken, expected_content_type: expectedContentType },
    origin: origin
  } = (await upload(file, onProgress, signal)) as any

  const delta = Date.now() - lastUploadAssetRequest

  if (delta < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - delta))
  }

  const token = getToken()

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`
  }

  const body = JSON.stringify({
    asset: {
      name: file.name,
      file_id: assetFileId,
      access_token: assetAccessToken,
      thumbnail_file_id: thumbnailFileId,
      thumbnail_access_token: thumbnailAccessToken
    }
  })

  lastUploadAssetRequest = Date.now()

  return {
    id: assetFileId,
    name: file.name,
    url: origin,
    type: 'application/octet-stream',
    images: {
      preview: { url: file.thumbnail_url }
    }
  }
}

/**
 * deleteAsset used to delete existing asset using assetId.
 *
 * @author Robert Long
 * @param  {any}  assetId
 * @return {Promise}               [true if deleted successfully else throw error]
 */
export const deleteAsset = async (assetId, projectid?, fileidentifier?): Promise<any> => {
  const token = getToken()

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
    assetId: assetId
  }
  if (projectid) headers['projectid'] = projectid

  if (fileidentifier) headers['fileidentifier'] = fileidentifier

  const assetEndpoint = `${serverURL}/static-resource/${assetId}`

  const resp = await fetchUrl(assetEndpoint, { method: 'DELETE', headers })
  console.log('Response: ' + Object.values(resp))

  if (resp.status === 401) {
    throw new Error(i18n.t('editor:errors.notAuthenticated'))
  }

  if (resp.status !== 200) {
    throw new Error(i18n.t('editor:errors.assetDeletionFail', { reason: await resp.text() }))
  }

  return true
}

/**
 * deleteProjectAsset used to delete asset for specific project.
 *
 * @author Robert Long
 * @param  {any}  projectId
 * @param  {any}  assetId
 * @return {Promise}               [true if deleted successfully else throw error]
 */
export const deleteProjectAsset = async (projectId, assetId): Promise<any> => {
  const token = getToken()

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`
  }

  const projectAssetEndpoint = `${serverURL}/project/${projectId}/assets/${assetId}`

  const resp = await fetchUrl(projectAssetEndpoint, { method: 'DELETE', headers })
  console.log('Response: ' + Object.values(resp))

  if (resp.status === 401) {
    throw new Error(i18n.t('editor:errors.notAuthenticated'))
  }

  if (resp.status !== 200) {
    throw new Error(i18n.t('editor:errors.projectAssetDeletionFail', { reason: await resp.text() }))
  }

  return true
}

/**
 * fetchUrl used as common api handler.
 *
 * @author Robert Long
 * @param  {any}  url
 * @param  {any}  options [contains request options]
 * @return {Promise}         [response from api]
 */
export const fetchUrl = async (url, options: any = {}): Promise<any> => {
  const token = getToken()
  if (options.headers == null) {
    options.headers = {}
  }
  options.headers.authorization = `Bearer ${token}`
  console.log(url)
  console.log(options)
  const res = await fetch(url, options).catch((error) => {
    console.log(error)
    if (error.message === 'Failed to fetch') {
      error.message += ' (' + i18n.t('editor:errors.CORS') + ')'
    }
    throw new RethrownError(i18n.t('editor:errors.urlFetchError', { url }), error)
  })
  if (res.ok) {
    return res
  }

  const err = new Error(
    i18n.t('editor:errors.networkError', {
      status: res.status || i18n.t('editor:errors.unknownStatus'),
      text: res.statusText || i18n.t('editor:errors.unknownError') + ' - ' + i18n.t('editor:errors.CORS')
    })
  )
  err['response'] = res
  throw err
}
