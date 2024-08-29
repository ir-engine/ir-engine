/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getState } from '@ir-engine/hyperflux'
import { AssetLoaderState } from '../state/AssetLoaderState'

export const sceneRelativePathIdentifier = '__$project$__'
export const sceneCorsPathIdentifier = '__$cors-proxy$__'

export const parseStorageProviderURLs = (
  data: any,
  domains: { publicDomain: string; cloudDomain: string; proxyDomain: string } = getState(AssetLoaderState)
) => {
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      data[key] = parseStorageProviderURLs(val, domains)
    }
    if (typeof val === 'string') {
      if (val.includes(sceneRelativePathIdentifier)) {
        data[key] = `${domains.cloudDomain}/projects` + data[key].replace(sceneRelativePathIdentifier, '')
      }
      if (val.startsWith(sceneCorsPathIdentifier)) {
        data[key] = data[key].replace(sceneCorsPathIdentifier, domains.proxyDomain)
      }
    }
  }
  return data
}

export const cleanStorageProviderURLs = (
  data: any,
  domains: { publicDomain: string; cloudDomain: string; proxyDomain: string } = getState(AssetLoaderState)
) => {
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      data[key] = cleanStorageProviderURLs(val)
    }
    if (typeof val === 'string') {
      if (val.includes(domains.cloudDomain + '/projects')) {
        data[key] = val.replace(domains.cloudDomain + '/projects', sceneRelativePathIdentifier)
      } else if (val.startsWith(domains.proxyDomain)) {
        data[key] = val.replace(domains.proxyDomain, sceneCorsPathIdentifier)
      }
    }
  }
  return data
}
