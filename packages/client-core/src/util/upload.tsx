import { RethrownError } from './errors'
import i18n from 'i18next'
import { AudioFileTypes, CustomScriptFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { getToken } from './getToken'
import { Config } from '@xrengine/common/src/config'

const serverURL = Config.publicRuntimeConfig.apiServer

let lastUploadAssetRequest = 0

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
  const assets: any[] = []

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
 * matchesFileTypes function used to match file type with existing file types.
 *
 * @author Robert Long
 * @param  {Object} file      [object contains file data]
 * @param  {array} fileTypes [Array contains existing file types]
 * @return {boolean}           [true if file type found in existing fileTypes]
 */

export function matchesFileTypes(file, fileTypes) {
  for (const pattern of fileTypes) {
    if (pattern.startsWith('.')) {
      if (file.name.toLowerCase().endsWith(pattern)) {
        return true
      }
    } else if (file.type.startsWith(pattern)) {
      return true
    }
  }
  return false
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

  if (!matchesFileTypes(file, [...AudioFileTypes, ...CustomScriptFileTypes])) {
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
