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

import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, NO_PROXY } from '@ir-engine/hyperflux'
import {
  ResourceAssetType,
  ResourceManager,
  ResourceState,
  ResourceStatus,
  ResourceType
} from '@ir-engine/spatial/src/resources/ResourceState'

import { AssetLoader } from '../classes/AssetLoader'
import { GLTF } from '../loaders/gltf/GLTFLoader'

// This is most likely a temporary function that will be removed
export const setGLTFResource = (url: string, entity: Entity, status: ResourceStatus) => {
  const resourceType = ResourceType.GLTF
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[url].value) {
    resources.merge({
      [url]: {
        id: url,
        status: ResourceStatus.Unloaded,
        type: resourceType,
        asset: {} as GLTF,
        references: [entity],
        metadata: {},
        onLoads: {}
      }
    })
  } else {
    resources[url].references.merge([entity])
  }

  const callbacks = ResourceManager.resourceCallbacks[resourceType]
  const resource = resources[url]
  resource.status.set(status)

  switch (resource.status.value) {
    case ResourceStatus.Loading:
      callbacks.onStart(resource)
      break
    case ResourceStatus.Loaded:
      callbacks.onLoad({} as GLTF, resource, resourceState)
      break
    default:
      console.error('resourceLoaderFunctions:setGLTFResource: Invalid resource status')
      break
  }
}

interface Cloneable<T> {
  clone?: () => T
}

const pending: Record<string, Set<(response) => void>> = {}

const isCloneable = (resourceType: ResourceType): boolean => {
  /** @todo Add cloning for GLTF data */
  return resourceType === ResourceType.Texture
}

const cloneAsset = <T>(asset: Cloneable<T> | undefined, onLoad: (T) => void): boolean => {
  if (asset && typeof asset.clone === 'function') {
    onLoad(asset.clone())
    return true
  }

  return false
}

export const loadResource = <T extends ResourceAssetType>(
  url: string,
  resourceType: ResourceType,
  entity: Entity,
  onLoad: (response: T) => void,
  onProgress: (request: ProgressEvent) => void,
  onError: (event: ErrorEvent | Error) => void,
  signal: AbortSignal,
  loader?: AssetLoader,
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
        onLoads: {}
      }
    })
    if (uuid) resources[url].onLoads.merge({ [uuid]: onLoad })
  } else {
    //No need for callbacks if the asset has already been loaded
    callbacks = ResourceManager.resourceCallbacks[ResourceType.Unknown]
    resources[url].references.merge([entity])
    if (uuid) resources[url].onLoads.merge({ [uuid]: onLoad })

    const resource = getState(ResourceState).resources[url]
    const asset = resource.asset as Cloneable<T> | undefined
    if (
      (resource.status === ResourceStatus.Unloaded || resource.status === ResourceStatus.Loading) &&
      isCloneable(resourceType)
    ) {
      if (!pending[url]) pending[url] = new Set()
      pending[url].add(onLoad)
      return
    }
    // If asset already exists clone it to share GPU memory
    else if (cloneAsset(asset, onLoad)) {
      ResourceState.debugLog(`ResourceManager:load cloning already loaded asset: ${url} for entity: ${entity}`)
      return
    }
  }

  const resource = resources[url]
  callbacks.onStart(resource)
  ResourceState.debugLog(`ResourceManager:load Loading resource: ${url} for entity: ${entity}`)
  AssetLoader.loadAsset<T>(
    url,
    (response: T) => {
      if (!resource || !resource.value) {
        console.warn(`ResourceManager:load Resource removed before load finished: ${url} for entity: ${entity}`)
        return
      }
      resource.asset.set(response)
      resource.status.set(ResourceStatus.Loaded)
      callbacks.onLoad(response, resource, resourceState)
      ResourceState.debugLog(`ResourceManager:load Loaded resource: ${url} for entity: ${entity}`)
      ResourceManager.checkBudgets()
      onLoad(response)

      if (pending[url]) {
        for (const pendingLoad of pending[url]) {
          if (!cloneAsset(response as Cloneable<T>, pendingLoad))
            console.warn(`ResourceManager:load unable to clone asset for pending response: ${url}`)
          else ResourceState.debugLog(`ResourceManager:load cloning pending asset: ${url}`)
        }
        pending[url].clear()
      }
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
    signal,
    loader
  )
}

/**
 *
 * Updates a model's resource without the url changing
 * Removes the model from the resource state and reloads
 *
 * @param url the url of the asset to update
 * @returns
 */
export const updateModelResource = (url: string) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  const resource = resources[url]
  if (!resource.value) {
    console.warn('resourceLoaderFunctions:updateResource No resource found to update for url: ' + url)
    return
  }
  const onLoads = resource.onLoads.get(NO_PROXY)
  if (!onLoads) {
    console.warn('resourceLoaderFunctions:updateResource No callbacks found to update for url: ' + url)
    return
  }

  const onLoadArr = Object.values(onLoads)
  const entities = resource.references.get(NO_PROXY) as Entity[]
  if (onLoadArr.length !== entities.length) {
    console.warn(
      'resourceLoaderFunctions:updateResource There should be one loaded callback for every reference, url: ' + url
    )
    return
  }

  ResourceState.debugLog('resourceLoaderFunctions:updateResource Updating asset for url: ' + url)
  const resourceType = resource.type.value
  ResourceManager.__unsafeRemoveResource(url)
  for (let i = 0; i < onLoadArr.length; i++) {
    const onLoad = onLoadArr[i]
    loadResource(
      url,
      resourceType,
      entities[i],
      (response: ResourceAssetType) => {
        onLoad(response)
      },
      () => {},
      (error) => {
        console.error('resourceLoaderFunctions:updateResource error updating resource for url: ' + url, error)
      },
      new AbortController().signal
    )
  }
}
