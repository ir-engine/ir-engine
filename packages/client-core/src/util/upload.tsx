import i18n from 'i18next'

import { serverHost } from '@xrengine/common/src/config'

import { accessAuthState } from '../user/services/AuthService'
import { RethrownError } from './errors'

export type CancelableUploadPromiseReturnType<T = any> = { cancel: () => void; promise: Promise<T[]> }
export type CancelableUploadPromiseArrayReturnType<T = any> = { cancel: () => void; promises: Array<Promise<T[]>> }

/**
 * upload used to upload image as blob data.
 *
 * @param  {any}  blobs
 * @param  {any}  onUploadProgress
 * @param  {any}  signal
 * @param  {any}  projectId
 * @param  {string}  fileIdentifier
 * @return {Promise}
 */

export const uploadToFeathersService = (
  service = 'upload-asset',
  files: Array<Blob>,
  params: any = {},
  onUploadProgress?: (progress: number) => any
): CancelableUploadPromiseReturnType => {
  const token = accessAuthState().authUser.accessToken.value
  const request = new XMLHttpRequest()
  request.timeout = 10 * 60 * 1000 // 10 minutes - need to support big files on slow connections
  let aborted = false

  return {
    cancel: () => {
      aborted = true
      request.abort()
    },
    promise: new Promise<string[]>((resolve, reject) => {
      request.upload.addEventListener('progress', (e) => {
        if (aborted) return
        if (onUploadProgress) onUploadProgress(e.loaded / e.total)
      })

      request.upload.addEventListener('error', (error) => {
        if (aborted) return
        reject(new RethrownError(i18n.t('editor:errors.uploadFailed'), error))
      })

      // request.upload.addEventListener('load', console.log)
      // request.upload.addEventListener('loadend', console.log)

      request.addEventListener('readystatechange', (e) => {
        if (request.readyState === XMLHttpRequest.DONE) {
          const status = request.status

          if (status === 0 || (status >= 200 && status < 400)) {
            resolve(JSON.parse(request.responseText))
          } else {
            if (aborted) return
            console.error('Oh no! There has been an error with the request!', request, e)
            reject()
          }
        }
      })

      const formData = new FormData()
      Object.entries(params).forEach(([key, val]: any) => {
        formData.set(key, typeof val === 'object' ? JSON.stringify(val) : val)
      })

      if (Array.isArray(files)) {
        files.forEach((file) => {
          formData.append('media[]', file)
        })
      } else {
        formData.set('media', files)
      }

      request.open('post', `${serverHost}/${service}`, true)
      request.setRequestHeader('Authorization', `Bearer ${token}`)
      request.send(formData)
    })
  }
}

/**
 * matchesFileTypes function used to match file type with existing file types.
 *
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
