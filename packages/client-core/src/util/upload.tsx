import { RethrownError } from './errors'
import i18n from 'i18next'
import { getToken } from './getToken'
import { client } from '../feathers'

const serverURL = `https://${globalThis.process.env['VITE_SERVER_HOST']}`

/**
 * upload used to upload image as blob data.
 *
 * @param  {any}  blob
 * @param  {any}  onUploadProgress
 * @param  {any}  signal
 * @param  {any}  projectId
 * @param  {string}  fileIdentifier
 * @return {Promise}
 */

export const upload = (
  blob: Blob,
  onUploadProgress?: (progress: number) => any,
  signal?,
  params: any = {}
): Promise<any> => {
  const token = getToken()

  return new Promise((resolve, reject) => {
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
    console.log('Posting to: ', `${serverURL}/upload-asset`)

    request.open('post', `${serverURL}/upload-asset`, true)

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
    Object.entries(params).forEach(([key, val]: any) => {
      formData.set(key, val)
    })

    formData.set('media', blob)
    request.setRequestHeader('Authorization', `Bearer ${token}`)

    request.send(formData)
  })
}

export const uploadStaticResource = (
  files: Blob[],
  onUploadProgress?: (progress: number) => any,
  signal?,
  params: any = {}
): Promise<any> => {
  const token = getToken()

  return new Promise((resolve, reject) => {
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
    console.log('Posting to: ', `${serverURL}/upload-asset`)

    request.open('post', `${serverURL}/upload-asset`, true)

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
    Object.entries(params).forEach(([key, val]: any) => {
      formData.set(key, typeof val === 'string' ? val : JSON.stringify(val))
    })

    files.forEach((file) => {
      formData.append('media', file)
    })

    request.setRequestHeader('Authorization', `Bearer ${token}`)
    request.timeout = 120000 // 2 minute timeout

    request.send(formData)
  })
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

export function uploadBlob(blob: Blob, params: any = {}) {
  client.service('upload').create('')
}
