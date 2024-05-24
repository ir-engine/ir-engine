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

import { Entity } from '@etherealengine/ecs'
import { getMutableState, NO_PROXY } from '@etherealengine/hyperflux'
import {
  ResourceAssetType,
  ResourceManager,
  ResourceState,
  ResourceStatus,
  ResourceType
} from '@etherealengine/spatial/src/resources/ResourceState'

import { AssetLoader, LoadingArgs } from '../classes/AssetLoader'

export const loadResource = <T extends ResourceAssetType>(
  url: string,
  resourceType: ResourceType,
  entity: Entity,
  args: LoadingArgs,
  onLoad: (response: T) => void,
  onProgress: (request: ProgressEvent) => void,
  onError: (event: ErrorEvent | Error) => void,
  signal: AbortSignal,
  uuid?: string
) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  let callbacks = ResourceManager.resourceCallbacks[resourceType]
  if (!resources[url].value) {
    resources.merge({
      [url]: {
        id: url,
        status: ResourceStatus.Unloaded,
        type: resourceType,
        references: [entity],
        metadata: {},
        args: args,
        onLoads: {}
      }
    })
  } else {
    //No need for callbacks if the asset has already been loaded
    callbacks = ResourceManager.resourceCallbacks[ResourceType.Unknown]
    resources[url].references.merge([entity])
  }
  if (uuid) resources[url].onLoads.merge({ [uuid]: onLoad })

  const resource = resources[url]
  callbacks.onStart(resource)
  ResourceState.debugLog('ResourceManager:load Loading resource: ' + url + ' for entity: ' + entity)
  AssetLoader.load(
    url,
    args,
    (response: T) => {
      if (!resource || !resource.value) {
        console.warn('ResourceManager:load Resource removed before load finished: ' + url + ' for entity: ' + entity)
        return
      }
      resource.status.set(ResourceStatus.Loaded)
      resource.asset.set(response)
      callbacks.onLoad(response, resource, resourceState)
      ResourceState.debugLog('ResourceManager:load Loaded resource: ' + url + ' for entity: ' + entity)
      ResourceManager.checkBudgets()
      onLoad(response)
    },
    (request) => {
      callbacks.onProgress(request, resource)
      onProgress(request)
    },
    (error) => {
      console.warn(`ResourceManager:load error loading ${resourceType} at url ${url} for entity ${entity}`, error)
      if (resource && resource.value) {
        resource.status.set(ResourceStatus.Error)
        callbacks.onError(error, resource)
      }
      onError(error)
      ResourceManager.unload(url, entity, uuid)
    },
    signal
  )
}

export const updateResource = (id: string) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  const resource = resources[id]
  if (!resource.value) {
    console.warn('ResourceManager:update No resource found to update for id: ' + id)
    return
  }
  const onLoads = resource.onLoads.get(NO_PROXY)
  if (!onLoads) {
    console.warn('ResourceManager:update No callbacks found to update for id: ' + id)
    return
  }

  ResourceState.debugLog('ResourceManager:update Updating asset for id: ' + id)
  for (const [_, onLoad] of Object.entries(onLoads)) {
    AssetLoader.load(
      id,
      resource.args.value || {},
      (response: ResourceAssetType) => {
        resource.asset.set(response)
        onLoad(response)
      },
      (request) => {},
      (error) => {}
    )
  }
}
