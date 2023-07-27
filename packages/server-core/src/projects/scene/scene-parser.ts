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

import config from '@etherealengine/common/src/config'
import { PortalDetail } from '@etherealengine/common/src/interfaces/PortalInterface'
import { SceneData, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'

import { getCachedURL } from '../../media/storageprovider/getCachedURL'

export const sceneRelativePathIdentifier = '__$project$__'
export const sceneCorsPathIdentifier = '__$cors-proxy$__'

export const parseSceneDataCacheURLs = (sceneData: SceneJson, cacheDomain: string) => {
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      sceneData[key] = parseSceneDataCacheURLs(val, cacheDomain)
    }
    if (typeof val === 'string') {
      if (val.includes(sceneRelativePathIdentifier)) {
        sceneData[key] = getCachedURL(val.replace(sceneRelativePathIdentifier, '/projects'), cacheDomain)
      } else if (val.startsWith(sceneCorsPathIdentifier)) {
        sceneData[key] = val.replace(sceneCorsPathIdentifier, config.client.cors.proxyUrl)
      }
    }
  }
  return sceneData
}

export const cleanSceneDataCacheURLs = (sceneData: SceneJson, cacheDomain: string) => {
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      sceneData[key] = cleanSceneDataCacheURLs(val, cacheDomain)
    }
    if (typeof val === 'string') {
      if (val.includes('https://' + cacheDomain + '/projects')) {
        sceneData[key] = val.replace('https://' + cacheDomain + '/projects', sceneRelativePathIdentifier)
      } else if (val.startsWith(config.client.cors.proxyUrl)) {
        sceneData[key] = val.replace(config.client.cors.proxyUrl, sceneCorsPathIdentifier)
      }
    }
  }
  return sceneData
}

export const parseScenePortals = (scene: SceneData) => {
  const portals: PortalDetail[] = []
  for (const [entityId, entity] of Object.entries(scene.scene?.entities!)) {
    for (const component of entity.components)
      if (component.name === 'portal') {
        portals.push({
          sceneName: scene.name,
          portalEntityId: entityId,
          portalEntityName: entity.name,
          previewImageURL: component.props.previewImageURL,
          spawnPosition: component.props.spawnPosition,
          spawnRotation: component.props.spawnRotation
        })
      }
  }
  return portals
}
