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
import { ResourceAssetType, ResourceState, ResourceType } from './ResourceState'

import { AudioLoader } from 'three'
// import { ResourceProgressComponent } from '../../gltf/ResourceProgressComponent'
import { AssetExt, FileToAssetExt } from './AssetType'
import { DomainConfigState } from './DomainConfigState'
import { FileLoader } from './loaders/base/FileLoader'
import { Loader } from './loaders/base/Loader'
import { KTX2LoaderState } from './loaders/ktx2/KTX2LoaderState'
import { TextureLoader } from './loaders/texture/TextureLoader'
import { TGALoader } from './loaders/tga/TGALoader'
import { ResourceCacheState, ResourceStatus } from './ResourceCacheState'
import { ResourceProgressComponent } from './ResourceProgressComponent'

interface Cloneable<T> {
  clone?: () => T
}

type PendingResponse = {
  onLoad: (response) => void
  entity: Entity
}

const pending: Record<string, Set<PendingResponse>> = {}

const isCloneable = (resourceType: ResourceType): boolean => {
  /** @todo Add cloning for GLTF data */
  return resourceType === ResourceType.Texture
}

const cloneAsset = <T>(asset: Cloneable<T> | undefined, onLoad: (T) => void): boolean => {
  if (asset && typeof asset.clone === 'function') {
    const clone = asset.clone()
    onLoad(clone)
    return true
  }

  return false
}

/**
 * Matches absolute URLs. For eg: `http://example.com`, `https://example.com`, `ftp://example.com`, `//example.com`, etc.
 * This Does NOT match relative URLs like `example.com`
 */
export const ABSOLUTE_URL_PROTOCOL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/

export const isAbsolutePath = (path) => {
  return ABSOLUTE_URL_PROTOCOL_REGEX.test(path)
}

export const getAbsolutePath = (url) => (isAbsolutePath(url) ? url : getState(DomainConfigState).publicDomain + url)

export const getLoader = (assetType: AssetExt): Loader => {
  switch (assetType) {
    case AssetExt.KTX2:
      return getState(KTX2LoaderState) as any as Loader
    case AssetExt.TGA:
      return new TGALoader()
    case AssetExt.PNG:
    case AssetExt.JPEG:
    case AssetExt.GIF:
    case AssetExt.WEBP:
      return new TextureLoader()
    case AssetExt.AAC:
    case AssetExt.MP3:
    case AssetExt.OGG:
    case AssetExt.M4A:
      return new AudioLoader() as any as Loader
    default:
      return new FileLoader()
  }
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
  const resourceCacheState = getMutableState(ResourceCacheState)
  if (!resourceCacheState[url].value) {
    resourceCacheState.merge({
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
    getMutableState(ResourceCacheState)[url].references.merge([entity])
    const resource = getState(ResourceCacheState)[url]
    const asset = resource.asset as Cloneable<T> | undefined
    if (
      (resource.status === ResourceStatus.Unloaded || resource.status === ResourceStatus.Loading) &&
      isCloneable(resourceType)
    ) {
      if (!pending[url]) pending[url] = new Set()
      pending[url].add({ onLoad, entity })
      return
    }
    // If asset already exists clone it to share GPU memory
    else if (cloneAsset(asset, onLoad)) {
      ResourceState.debugLog(`ResourceState:load cloning already loaded asset: ${url} for entity: ${entity}`)
      return
    }
  }

  if (entity) {
    ResourceProgressComponent.setResource(entity, url, 0, 0)
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          ResourceProgressComponent.removeResource(entity, url)
        },
        { once: true }
      )
    }
  }

  const resource = resourceCacheState[url]
  ResourceState.debugLog(`ResourceState:load Loading resource: ${url} for entity: ${entity}`)
  const absoluteURL = getAbsolutePath(url)

  if (!loader) {
    const assetExt = FileToAssetExt(url)!
    loader = getLoader(assetExt)
  }

  loader.load(
    absoluteURL,
    (response: T) => {
      if (!resource || !resource.value) {
        console.warn(`ResourceState:load Resource removed before load finished: ${url} for entity: ${entity}`)
        onError(new Error('Resource removed before load finished'))
        return
      }
      // only store cloneable assets
      if (isCloneable(resourceType)) {
        resource.asset.set(response)
      }
      resource.status.set(ResourceStatus.Loaded)
      ResourceState.debugLog(`ResourceState:load Loaded resource: ${url} for entity: ${entity}`)
      ResourceState.checkBudgets()
      if (entity) ResourceProgressComponent.setResource(entity, url, 100, 100)
      onLoad(response)

      if (pending[url]) {
        for (const pendingLoad of pending[url]) {
          const pendingOnLoad = pendingLoad.onLoad
          const entity = pendingLoad.entity
          if (!cloneAsset(response as Cloneable<T>, pendingOnLoad))
            console.warn(`ResourceState:load unable to clone asset for pending response: ${url}`)
          else {
            if (entity) ResourceProgressComponent.setResource(entity, url, 100, 100)
            ResourceState.debugLog(`ResourceState:load cloning pending asset: ${url}`)
          }
        }
        pending[url].clear()
      }
    },
    (request) => {
      if (entity) ResourceProgressComponent.setResource(entity, url, request.loaded, request.total)
      onProgress(request)
    },
    (error: ErrorEvent | Error) => {
      console.warn(`ResourceState:load error loading ${resourceType} at url ${url} for entity ${entity}`, error)
      if (resource && resource.value) {
        resource.status.set(ResourceStatus.Error)
      }
      if (entity) ResourceProgressComponent.removeResource(entity, url)
      onError(error)
    },
    signal
  )
}

export const unloadResource = (url: string, entity: Entity) => {
  const resourceCacheState = getMutableState(ResourceCacheState)
  const resource = resourceCacheState[url]
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
  const resourceCacheState = getState(ResourceCacheState)
  for (const [url, resource] of Object.entries(resourceCacheState)) {
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
