import i18n from 'i18next'

import { accessAuthState } from '../user/services/AuthService'
import { serverHost } from './config'
import { RethrownError } from './errors'

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
  files: Blob | Array<Blob>,
  params: any = {},
  onUploadProgress?: (progress: number) => any
): Promise<any> => {
  const token = accessAuthState().authUser.accessToken.value

  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.timeout = 10 * 60 * 1000 // 10 minutes - need to support big files on slow connections

    request.upload.addEventListener('progress', (e) => {
      if (onUploadProgress) onUploadProgress(e.loaded / e.total)
    })

    request.upload.addEventListener('error', (error) => {
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
