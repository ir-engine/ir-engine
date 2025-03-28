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

import { useEffect } from 'react'
import { AudioLoader, Texture } from 'three'

import {
  createEntity,
  Entity,
  entityExists,
  generateEntityUUID,
  removeEntity,
  setComponent,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { NO_PROXY, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import {
  Resource,
  ResourceAssetType,
  ResourceState,
  ResourceType
} from '@ir-engine/spatial/src/resources/ResourceState'

import { EntityTreeComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { ResourcePendingComponent } from '../../gltf/ResourcePendingComponent'
import { FileLoader } from '../loaders/base/FileLoader'
import { Loader } from '../loaders/base/Loader'
import { parseStorageProviderURLs } from './parseSceneJSON'
import { loadResource } from './resourceLoaderFunctions'

const defaultLoaders = {
  fileLoader: new FileLoader(),
  audioLoader: new AudioLoader()
}

function useLoader<T extends ResourceAssetType>(
  url: string,
  resourceType: ResourceType,
  entity: Entity = UndefinedEntity,
  //Called when the asset url is changed, mostly useful for editor functions when changing an asset
  loader?: Loader,
  onUnload: (url: string) => void = (url: string) => {}
): [T | null, ErrorEvent | Error | null, ProgressEvent<EventTarget> | null, () => void] {
  const value = useHookstate<T | null>(null)
  const error = useHookstate<ErrorEvent | Error | null>(null)
  const progress = useHookstate<ProgressEvent<EventTarget> | null>(null)
  const entityResource = useHookstate<Resource[] | null>(null)
  url = parseStorageProviderURLs(url)

  const unload = () => {
    if (url && entityResource.value) {
      for (const resource of entityResource.value) {
        if (resource.id === url) {
          ResourceState.removeEntityResource(resource as Resource)
        }
      }
    }
  }

  useEffect(() => {
    return unload
  }, [])

  useImmediateEffect(() => {
    const _url = url
    if (!_url) return
    let completed = false

    if (entity) {
      ResourcePendingComponent.setResource(entity, _url, 0, 0)
    }

    const controller = new AbortController()
    loadResource<T>(
      _url,
      resourceType,
      entity,
      (response) => {
        completed = true
        value.set(response)
        entityResource.set(ResourceState.addEntityResource(entity, response))
        if (entity) {
          ResourcePendingComponent.removeResource(entity, _url)
        }
      },
      (request) => {
        progress.set(request)
        if (entity) {
          ResourcePendingComponent.setResource(entity, _url, request.loaded, request.total)
        }
      },
      (err) => {
        // Effect was unmounted, can't set error state safely
        if (controller.signal.aborted) return
        completed = true
        error.set(err)
        if (entity) {
          ResourcePendingComponent.removeResource(entity, _url)
        }
      },
      controller.signal,
      loader
    )

    return () => {
      if (!completed)
        controller.abort(
          `resourceHooks:useLoader Component loading ${resourceType} at url ${url} for entity ${entity} was unmounted`
        )

      if (entity && entityExists(entity)) ResourcePendingComponent.removeResource(entity, _url)
      // ResourceState.unload(_url, entity, uuid.value)
      value.set(null)
      progress.set(null)
      error.set(null)
      onUnload(_url)
    }
  }, [url])

  return [value.get(NO_PROXY) as T | null, error.get(NO_PROXY), progress.get(NO_PROXY), unload]
}

async function getLoader<T extends ResourceAssetType>(
  url: string,
  resourceType: ResourceType,
  entity: Entity = UndefinedEntity,
  loader?: Loader
): Promise<[T | null, () => void, ErrorEvent | Error | null]> {
  return new Promise((resolve) => {
    const controller = new AbortController()
    loadResource<T>(
      url,
      resourceType,
      entity,
      (response) => {
        const resources = ResourceState.addEntityResource(entity, response)
        const unload = () => {
          for (const resource of resources) ResourceState.removeEntityResource(resource)
        }
        resolve([response, unload, null])
      },
      (request) => {},
      (err) => {
        resolve([null, () => {}, err])
      },
      controller.signal,
      loader
    )
  })
}

/**
 *
 * GLTF loader hook for use in React Contexts.
 * Creates an entity with a GLTFComponent as a child of the provided parentEntity param
 * Returns the root entity of the GLTF after the GLTF has completed loading
 *
 * @param url The URL of the GLTF file to load
 * @param parentEntity The entity that is loading the GLTF
 * @returns Entity | null
 */
export function useGLTFComponent(url: string, parentEntity: Entity): Entity | null {
  const gltfEntityState = useHookstate(UndefinedEntity)
  const loaded = GLTFComponent.useSceneLoaded(gltfEntityState.value)

  useEffect(() => {
    if (!url || !parentEntity) return
    const gltfEntity = createEntity()
    setComponent(gltfEntity, EntityTreeComponent, { parentEntity })
    setComponent(gltfEntity, UUIDComponent, generateEntityUUID())
    setComponent(gltfEntity, GLTFComponent, { src: url })
    gltfEntityState.set(gltfEntity)

    return () => {
      if (entityExists(gltfEntity)) {
        removeEntity(gltfEntity)
        gltfEntityState.set(UndefinedEntity)
      }
    }
  }, [parentEntity, url])

  return loaded ? gltfEntityState.value : null
}

/**
 *
 * Texture loader hook for use in React Contexts.
 * The asset will be loaded through the ResourceState in ResourceState.ts.
 * The asset will be unloaded and disposed when the component is unmounted or when onUnloadCallback is called.
 *
 * @param url The URL of the texture file to load
 * @param entity *Optional* The entity that is loading the texture, defaults to UndefinedEntity
 * @param params *Optional* LoadingArgs that are passed through to the asset loader
 * @param onUnload *Optional* A callback that is called when the URL is changed and the previous asset is unloaded, only needed for editor specific behavior
 * @returns Tuple of [Texture, Error, Progress, onUnloadCallback]
 */
export function useTexture(
  url: string,
  entity?: Entity,
  onUnload?: (url: string) => void,
  loader?: Loader
): [Texture | null, ErrorEvent | Error | null, ProgressEvent<EventTarget> | null, () => void] {
  return useLoader<Texture>(url, ResourceType.Texture, entity, loader, onUnload)
}

export function useFile(
  url: string,
  entity?: Entity,
  onUnload?: (url: string) => void,
  loader: Loader = defaultLoaders.fileLoader
): [ArrayBuffer | null, ErrorEvent | Error | null, ProgressEvent<EventTarget> | null, () => void] {
  return useLoader<ArrayBuffer>(url, ResourceType.File, entity, loader, onUnload)
}

/**
 *
 * Texture loader function for when you need to load an asset in a non-React context.
 * The asset will be loaded through the ResourceState in ResourceState.ts.
 * The asset will only be unloaded when onUnloadCallback is called, otherwise the asset will be leaked.
 *
 * @param url The URL of the texture file to load
 * @param entity *Optional* The entity that is loading the texture, defaults to UndefinedEntity
 * @param params *Optional* LoadingArgs that are passed through to the asset loader
 * @returns Promise of Tuple of [Texture, onUnloadCallback, Error]
 */
export async function getTextureAsync(
  url: string,
  entity?: Entity,
  loader?: Loader
): Promise<[Texture | null, () => void, ErrorEvent | Error | null]> {
  return getLoader<Texture>(url, ResourceType.Texture, entity, loader)
}

export async function getAudioAsync(
  url: string,
  entity?: Entity
): Promise<[AudioBuffer | null, () => void, ErrorEvent | Error | null]> {
  return getLoader<AudioBuffer>(url, ResourceType.Audio, entity)
}
