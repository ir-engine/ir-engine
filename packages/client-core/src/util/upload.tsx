/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import i18n from 'i18next'

import config from '@etherealengine/common/src/config'
import { getMutableState } from '@etherealengine/hyperflux'

import { AuthState } from '../user/services/AuthService'
import { RethrownError } from './errors'

export type CancelableUploadPromiseReturnType<T = any> = { cancel: () => void; promise: Promise<T | T[]> }
export type CancelableUploadPromiseArrayReturnType<T = any> = { cancel: () => void; promises: Array<Promise<T | T[]>> }

export const uploadToFeathersService = (
  service = 'upload-asset',
  files: Array<File>,
  params: any = {},
  onUploadProgress?: (progress: number) => any
): CancelableUploadPromiseReturnType => {
  const token = getMutableState(AuthState).authUser.accessToken.value
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

      request.open('post', `${config.client.serverUrl}/${service}`, true)
      request.setRequestHeader('Authorization', `Bearer ${token}`)
      request.send(formData)
    })
  }
}

/**
 * matchesFileTypes function used to match file type with existing file types.
 *
 * @param file      [object contains file data]
 * @param fileTypes [Array contains existing file types]
 */

export function matchesFileTypes(file: File, fileTypes: string[]) {
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
