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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { ResourceAssetType, ResourceState, ResourceType } from '@ir-engine/spatial/src/resources/ResourceState'

import { AssetLoader } from '../classes/AssetLoader'
import { Loader } from '../loaders/base/Loader'
import { AssetCacheState, ResourceStatus } from '../state/AssetCacheState'

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
  loader?: Loader
) => {
  const assetCacheState = getMutableState(AssetCacheState)
  if (!assetCacheState[url].value) {
    assetCacheState.merge({
      [url]: {
        id: url,
        status: ResourceStatus.Unloaded,
        type: resourceType,
        references: [entity],
        asset: null,
        metadata: {}
      }
    })
  } else {
    getMutableState(AssetCacheState)[url].references.merge([entity])
    const resource = getState(AssetCacheState)[url]
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
      ResourceState.debugLog(`ResourceState:load cloning already loaded asset: ${url} for entity: ${entity}`)
      return
    }
  }

  const resource = assetCacheState[url]
  ResourceState.debugLog(`ResourceState:load Loading resource: ${url} for entity: ${entity}`)
  AssetLoader.loadAsset<T>(
    url,
    (response: T) => {
      if (!resource || !resource.value) {
        console.warn(`ResourceState:load Resource removed before load finished: ${url} for entity: ${entity}`)
        return
      }
      resource.asset.set(response)
      resource.status.set(ResourceStatus.Loaded)
      ResourceState.debugLog(`ResourceState:load Loaded resource: ${url} for entity: ${entity}`)
      ResourceState.checkBudgets()
      onLoad(response)

      if (pending[url]) {
        for (const pendingLoad of pending[url]) {
          if (!cloneAsset(response as Cloneable<T>, pendingLoad))
            console.warn(`ResourceState:load unable to clone asset for pending response: ${url}`)
          else ResourceState.debugLog(`ResourceState:load cloning pending asset: ${url}`)
        }
        pending[url].clear()
      }
    },
    (request) => {
      onProgress(request)
    },
    (error) => {
      console.warn(`ResourceState:load error loading ${resourceType} at url ${url} for entity ${entity}`, error)
      if (resource && resource.value) {
        resource.status.set(ResourceStatus.Error)
      }
      onError(error)
    },
    signal,
    loader
  )
}

export const unloadResource = (url: string, entity: Entity) => {
  const assetCacheState = getMutableState(AssetCacheState)
  const resource = assetCacheState[url]
  if (!resource.value) {
    console.warn(`ResourceState:unload No resource found to unload for url: ${url}`)
    return
  }

  ResourceState.debugLog(`ResourceState:unload Unloading resource: ${url} for entity: ${entity}`)
  const references = resource.references.value
  if (references.length === 1 && references[0] === entity) {
    resource.set(none)
    ResourceState.debugLog(`ResourceState:unload Unloaded resource: ${url} for entity: ${entity}`)
  } else {
    resource.references.set(references.filter((e) => e !== entity))
    ResourceState.debugLog(`ResourceState:unload Unloaded reference for resource: ${url} for entity: ${entity}`)
  }
}

export const unloadResourcesForEntity = (entity: Entity) => {
  const assetCacheState = getState(AssetCacheState)
  for (const [url, resource] of Object.entries(assetCacheState)) {
    if (resource.references.includes(entity)) {
      unloadResource(url, entity)
    }
  }
}

/**
 *
 * Updates a resource without the url changing
 * Removes the model from the resource state and reloads
 *
 * @param url the url of the asset to update
 * @returns
 */
const reloadResource = (url: string) => {
  /** @todo rewrite this with new resource state */
  // const resourceState = getMutableState(ResourceState)
  // const resources = resourceState.nested('resources')
  // const resource = resources[url]
  // if (!resource.value) {
  //   console.warn('resourceLoaderFunctions:reloadResource No resource found to update for url: ' + url)
  //   return
  // }
  // const onLoads = resource.onLoads.get(NO_PROXY)
  // if (!onLoads) {
  //   ResourceState.debugLog('resourceLoaderFunctions:reloadResource No callbacks found to update for url: ' + url)
  //   return
  // }
  // ResourceState.debugLog('resourceLoaderFunctions:reloadResource Updating asset for url: ' + url)
  // const resourceType = resource.type.value
  // ResourceState.__unsafeRemoveResource(url)
  // for (const [uuid, loadObj] of Object.entries(onLoads)) {
  //   loadResource(
  //     url,
  //     resourceType,
  //     loadObj.entity,
  //     loadObj.onLoad,
  //     () => {},
  //     (error) => {
  //       console.error('resourceLoaderFunctions:reloadResource error updating resource for url: ' + url, error)
  //     },
  //     new AbortController().signal,
  //     undefined,
  //     uuid
  //   )
  // }
}

export const ResourceLoaderManager = { reloadResource }
