import i18n from 'i18next'

import { accessAuthState } from '../user/services/AuthService'
import { RethrownError } from './errors'

const serverURL =
  process.env.APP_ENV === 'development'
    ? `https://${(globalThis as any).process.env['VITE_SERVER_HOST']}:${
        (globalThis as any).process.env['VITE_SERVER_PORT']
      }`
    : `https://${(globalThis as any).process.env['VITE_SERVER_HOST']}`

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
  blobs: Blob | Array<Blob>,
  service = 'media',
  onUploadProgress?: (progress: number) => any,
  params: any = {}
): Promise<any> => {
  const token = accessAuthState().authUser.accessToken.value
  return new Promise<any>((resolve, reject) => {
    const request = new XMLHttpRequest()
    console.log('Posting to: ', `${serverURL}/${service}`)
    request.open('post', `${serverURL}/${service}`, true)
    request.upload.addEventListener('progress', (e) => {
      if (onUploadProgress) {
        onUploadProgress(e.loaded / e.total)
      }
    })

    request.upload.addEventListener('error', (error) => {
      reject(new RethrownError(i18n.t('editor:errors.uploadFailed'), error))
    })

    request.upload.addEventListener('load', (e) => {
      console.log('load')
    })

    request.upload.addEventListener('loadend', (e) => {
      console.log('loadend')
    })

    request.addEventListener('readystatechange', (e) => {
      console.log('readystatechange', e, request.readyState)
      if (request.readyState === XMLHttpRequest.DONE) {
        const status = request.status
        if (status === 0 || (status >= 200 && status < 400)) {
          console.log('The request has been completed successfully', request.responseText)
          resolve(request.responseText)
        } else {
          console.log('Oh no! There has been an error with the request!')
        }
      }
    })

    const formData = new FormData()
    Object.entries(params).forEach(([key, val]: any) => {
      formData.set(key, typeof val === 'object' ? JSON.stringify(val) : val)
    })

    if (Array.isArray(blobs)) {
      blobs.forEach((blob) => {
        formData.append('media[]', blob)
      })
    } else {
      formData.set('media', blobs)
    }
    request.setRequestHeader('Authorization', `Bearer ${token}`)

    request.send(formData)
    console.log('after send', request)
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
