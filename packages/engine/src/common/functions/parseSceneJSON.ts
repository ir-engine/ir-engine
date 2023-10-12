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

import { config } from '@etherealengine/common/src/config'

export const sceneRelativePathIdentifier = '__$project$__'
export const sceneCorsPathIdentifier = '__$cors-proxy$__'
const storageProviderHost = config.client.fileServer ?? `https://localhost:8642`
const corsPath = config.client.cors.serverPort ? config.client.cors.proxyUrl : `https://localhost:3029`

export const parseStorageProviderURLs = (data: any) => {
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      data[key] = parseStorageProviderURLs(val)
    }
    if (typeof val === 'string') {
      if (val.includes(sceneRelativePathIdentifier)) {
        data[key] = `${storageProviderHost}/projects` + data[key].replace(sceneRelativePathIdentifier, '')
      }
      if (val.startsWith(sceneCorsPathIdentifier)) {
        data[key] = data[key].replace(sceneCorsPathIdentifier, corsPath)
      }
    }
  }
  return data
}

export const cleanStorageProviderURLs = (data: any) => {
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      data[key] = cleanStorageProviderURLs(val)
    }
    if (typeof val === 'string') {
      if (val.includes(storageProviderHost + '/projects')) {
        data[key] = val.replace(storageProviderHost + '/projects', sceneRelativePathIdentifier)
      } else if (val.startsWith(config.client.cors.proxyUrl)) {
        data[key] = val.replace(config.client.cors.proxyUrl, sceneCorsPathIdentifier)
      }
    }
  }
  return data
}
