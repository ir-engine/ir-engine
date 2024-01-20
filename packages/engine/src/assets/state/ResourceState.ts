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

import { NO_PROXY, State, defineState, getMutableState, getState, none } from '@etherealengine/hyperflux'
import { Cache, DefaultLoadingManager, Texture } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { AssetLoader, LoadingArgs } from '../classes/AssetLoader'
import { GLTF } from '../loaders/gltf/GLTFLoader'

Cache.enabled = true

DefaultLoadingManager.onLoad = () => {
  const totalSize = getCurrentSizeOfResources()
  console.log('Loaded: ' + totalSize + ' bytes of resources')
}

// //Called when the item at the url passed in has completed loading
// DefaultLoadingManager.onProgress = (url: string, loaded: number, total: number) => {
//   console.log('On Progress', url, loaded, total)
// }

// DefaultLoadingManager.onError = (url: string) => {
//   console.log('On Error', url)
// }

// //This doesn't work as you might imagine, it is only called once, the url parameter is pretty much useless
// DefaultLoadingManager.onStart = (url: string, loaded: number, total: number) => {
//   console.log('On Start', url, loaded, total)
// }

enum ResourceStatus {
  Unloaded,
  Loading,
  Loaded,
  Error
}

export enum ResourceType {
  GLTF,
  Texture,
  Geometry,
  ECSData,
  Audio,
  Unknown
}

export type AssetType = GLTF | Texture

type BaseMetadata = {
  size?: number
}

type GLTFMetadata = BaseMetadata

type TexutreMetadata = {
  onGPU: boolean
} & BaseMetadata

type Metadata = GLTFMetadata | TexutreMetadata

type Resource = {
  status: ResourceStatus
  type: ResourceType
  references: Entity[]
  assetRef?: AssetType
  metadata: Metadata
}

export const ResourceState = defineState({
  name: 'ResourceManagerState',
  initial: () => ({
    resources: {} as Record<string, Resource>
  })
})

const getCurrentSizeOfResources = () => {
  let size = 0
  const resources = getState(ResourceState).resources
  for (const key in resources) {
    const resource = resources[key]
    if (resource.metadata.size) size += resource.metadata.size
  }

  return size
}

const Callbacks = {
  [ResourceType.GLTF]: {
    onLoad: (response: GLTF, resource: State<Resource>) => {},
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {
      resource.metadata.size.set(request.total)
    },
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {}
  },
  [ResourceType.Texture]: {
    onLoad: (response: Texture, resource: State<Resource>) => {
      if (response.mipmaps[0]) {
        resource.metadata.size.set(response.mipmaps[0].data.length)
      } else {
        const height = response.image.height
        const width = response.image.width
        const size = width * height * 4
        resource.metadata.size.set(size)
      }
    },
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {},
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {}
  }
}

const load = <T extends AssetType>(
  url: string,
  resourceType: ResourceType,
  entity: Entity,
  args: LoadingArgs,
  onLoad: (response: T) => void,
  onProgress: (request: ProgressEvent) => void,
  onError: (event: ErrorEvent | Error) => void
) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[url].value) {
    resources.merge({
      [url]: {
        status: ResourceStatus.Unloaded,
        type: resourceType,
        references: [entity],
        metadata: {}
      }
    })
  } else {
    resources[url].references.merge([entity])
  }

  const resource = resources[url]
  const callback = Callbacks[resourceType]
  console.log('Resource Manager Loading Asset at: ' + url)
  AssetLoader.load(
    url,
    args,
    (response: T) => {
      resource.status.set(ResourceStatus.Loaded)
      resource.assetRef.set(response)
      callback?.onLoad(response, resource)
      onLoad(response)
    },
    (request) => {
      resource.status.set(ResourceStatus.Loading)
      callback?.onProgress(request, resource)
      onProgress(request)
    },
    (error) => {
      resource.status.set(ResourceStatus.Error)
      callback?.onError(error, resource)
      onError(error)
    }
  )
}

const unload = (url: string, entity: Entity) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[url].value) {
    console.error('ResourceManager:unload No resource exists for url: ' + url)
    return
  }

  const resource = resources[url]

  resource.references.set((entities) => {
    const index = entities.indexOf(entity)
    if (index > -1) {
      entities.splice(index, 1)
    }
    return entities
  })

  if (resource.references.length == 0) {
    removeResource(url)
  }
}

const removeResource = (url: string) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[url].value) {
    console.error('ResourceManager:removeResource No resource exists for url: ' + url)
    return
  }

  console.log('Resource Manager Unloading Asset at: ' + url)

  Cache.remove(url)
  const resource = resources[url]

  const asset = resource.assetRef.get(NO_PROXY)
  if (asset) {
    switch (resource.type.value) {
      case ResourceType.GLTF:
        break
      case ResourceType.Texture:
        ;(asset as Texture).dispose()
        break
      case ResourceType.Geometry:
        break
      case ResourceType.ECSData:
        break
      case ResourceType.Audio:
        break
      case ResourceType.Unknown:
        break

      default:
        break
    }
  }

  resources[url].set(none)
}

export const ResourceManager = {
  load,
  unload
}
