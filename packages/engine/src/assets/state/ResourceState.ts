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
import { NO_PROXY, State, defineState, getMutableState, getState, none } from '@etherealengine/hyperflux'
import { EngineRenderer } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { Cache, CompressedTexture, DefaultLoadingManager, LoadingManager, Material, Texture } from 'three'
import { SourceType } from '../../scene/materials/components/MaterialSource'
import { removeMaterialSource } from '../../scene/materials/functions/MaterialLibraryFunctions'
import { AssetLoader, LoadingArgs } from '../classes/AssetLoader'
import { Geometry } from '../constants/Geometry'
import { ResourceLoadingManager } from '../loaders/base/ResourceLoadingManager'
import { GLTF } from '../loaders/gltf/GLTFLoader'

Cache.enabled = true

export enum ResourceStatus {
  Unloaded,
  Loading,
  Loaded,
  Error
}

export enum ResourceType {
  GLTF,
  Texture,
  Geometry,
  Material,
  ECSData,
  Audio,
  Unknown
}

const resourceTypeName = {
  [ResourceType.GLTF]: 'GLTF',
  [ResourceType.Texture]: 'Texture',
  [ResourceType.Geometry]: 'Geometry',
  [ResourceType.Material]: 'Material',
  [ResourceType.ECSData]: 'ECSData',
  [ResourceType.Audio]: 'Audio',
  [ResourceType.Unknown]: 'Unknown'
}

export type AssetType = GLTF | Texture | CompressedTexture | Geometry | Material

type BaseMetadata = {
  size?: number
}

type GLTFMetadata = {
  verts: number
} & BaseMetadata

type TexutreMetadata = {
  onGPU: boolean
} & BaseMetadata

type Metadata = GLTFMetadata | TexutreMetadata | BaseMetadata

type Resource = {
  id: string
  status: ResourceStatus
  type: ResourceType
  references: Entity[]
  asset?: AssetType
  assetRefs: string[]
  metadata: Metadata
}

const debug = false
const debugLog = debug
  ? (message?: any, ...optionalParams: any[]) => {
      console.log(message)
    }
  : (message?: any, ...optionalParams: any[]) => {}

export const ResourceState = defineState({
  name: 'ResourceManagerState',
  initial: () => ({
    resources: {} as Record<string, Resource>,
    referencedAssets: {} as Record<string, string[]>
  })
})

const setDefaultLoadingManager = (
  loadingManager: LoadingManager = new ResourceLoadingManager(
    onItemStart,
    onStart,
    onLoad,
    onProgress,
    onError
  ) as LoadingManager
) => {
  DefaultLoadingManager.itemStart = loadingManager.itemStart
  DefaultLoadingManager.itemEnd = loadingManager.itemEnd
  DefaultLoadingManager.itemError = loadingManager.itemError
  DefaultLoadingManager.resolveURL = loadingManager.resolveURL
  DefaultLoadingManager.setURLModifier = loadingManager.setURLModifier
  DefaultLoadingManager.addHandler = loadingManager.addHandler
  DefaultLoadingManager.removeHandler = loadingManager.removeHandler
  DefaultLoadingManager.getHandler = loadingManager.getHandler
  //@ts-ignore
  DefaultLoadingManager.itemEndFor = onItemLoadedFor
}

const onItemStart = (url: string) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[url].value) {
    // console.warn('ResourceManager: asset loaded outside of the resource manager, url: ' + url)
    return
  }

  const resource = resources[url]
  if (resource.status.value === ResourceStatus.Unloaded) {
    resource.status.set(ResourceStatus.Loading)
  }
}

const onStart = (url: string, loaded: number, total: number) => {}
const onLoad = () => {
  const totalSize = getCurrentSizeOfResources()
  const totalVerts = getCurrentVertCountOfResources()
  debugLog('Loaded: ' + totalSize + ' bytes of resources')
  debugLog(totalVerts + ' Vertices')

  //@ts-ignore
  if (debug) window.resources = getState(ResourceState)
}

const onItemLoadedFor = <T extends AssetType>(url: string, resourceType: ResourceType, id: string, asset: T) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  const referencedAssets = resourceState.nested('referencedAssets')
  if (!resources[url].value) {
    console.warn('ResourceManager:loadedFor asset loaded for asset that is not loaded: ' + url)
    return
  }

  debugLog(
    'ResourceManager:loadedFor loading asset of type ' +
      resourceTypeName[resourceType] +
      ' with ID: ' +
      id +
      ' for asset at url: ' +
      url
  )

  if (!referencedAssets[id].value) {
    referencedAssets.merge({
      [id]: []
    })
  }

  if (!resources[id].value) {
    resources.merge({
      [id]: {
        id: id,
        status: ResourceStatus.Loaded,
        type: resourceType,
        references: [],
        asset: asset,
        assetRefs: [],
        metadata: {}
      }
    })
    const callbacks = Callbacks[resourceType]
    callbacks.onStart(resources[id])
    callbacks.onLoad(asset, resources[id])
  }

  resources[url].assetRefs.merge([id])
  referencedAssets[id].merge([url])
}

const onProgress = (url: string, loaded: number, total: number) => {}
const onError = (url: string) => {}

setDefaultLoadingManager()

const getCurrentSizeOfResources = () => {
  let size = 0
  const resources = getState(ResourceState).resources
  for (const key in resources) {
    const resource = resources[key]
    if (resource.metadata.size) size += resource.metadata.size
  }

  return size
}

const getCurrentVertCountOfResources = () => {
  let verts = 0
  const resources = getState(ResourceState).resources
  for (const key in resources) {
    const resource = resources[key]
    if ((resource.metadata as GLTFMetadata).verts) verts += (resource.metadata as GLTFMetadata).verts
  }

  return verts
}

const getRendererInfo = () => {
  return {
    memory: EngineRenderer.instance.renderer.info.memory,
    programCount: EngineRenderer.instance.renderer.info.programs?.length
  }
}

const Callbacks = {
  [ResourceType.GLTF]: {
    onStart: (resource: State<Resource>) => {},
    onLoad: (response: GLTF, resource: State<Resource>) => {},
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {
      resource.metadata.size.set(request.total)
    },
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {}
  },
  [ResourceType.Texture]: {
    onStart: (resource: State<Resource>) => {
      resource.metadata.merge({ onGPU: false })
    },
    onLoad: (response: Texture | CompressedTexture, resource: State<Resource>) => {
      response.onUpdate = () => {
        resource.metadata.merge({ onGPU: true })
        //@ts-ignore
        response.onUpdate = null
      }
      //Compressed texture size
      if (response.mipmaps[0]) {
        let size = 0
        for (const mip of response.mipmaps) {
          size += mip.data.byteLength
        }
        resource.metadata.size.set(size)
        // Non compressed texture size
      } else {
        const height = response.image.height
        const width = response.image.width
        const size = width * height * 4
        resource.metadata.size.set(size)
      }
    },
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {},
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {}
  },
  [ResourceType.Material]: {
    onStart: (resource: State<Resource>) => {},
    onLoad: (response: Material, resource: State<Resource>) => {},
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {},
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {}
  },
  [ResourceType.Geometry]: {
    onStart: (resource: State<Resource>) => {},
    onLoad: (response: Geometry, resource: State<Resource>) => {
      // Estimated geometry size
      let size = 0
      for (const name in response.attributes) {
        const attr = response.getAttribute(name)
        size += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT
      }

      const indices = response.getIndex()
      if (indices) {
        resource.metadata.merge({ verts: indices.count })
        size += indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT
      }
      resource.metadata.size.set(size)
    },
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {},
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {}
  }
} as {
  [key in ResourceType]: {
    onStart: (resource: State<Resource>) => void
    onLoad: (response: AssetType, resource: State<Resource>) => void
    onProgress: (request: ProgressEvent, resource: State<Resource>) => void
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => void
  }
}

const load = <T extends AssetType>(
  url: string,
  resourceType: ResourceType,
  entity: Entity,
  args: LoadingArgs,
  onLoad: (response: T) => void,
  onProgress: (request: ProgressEvent) => void,
  onError: (event: ErrorEvent | Error) => void,
  signal: AbortSignal
) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[url].value) {
    resources.merge({
      [url]: {
        id: url,
        status: ResourceStatus.Unloaded,
        type: resourceType,
        references: [entity],
        metadata: {},
        assetRefs: []
      }
    })
  } else {
    resources[url].references.merge([entity])
  }

  const resource = resources[url]
  const callbacks = Callbacks[resourceType]
  callbacks.onStart(resource)
  debugLog('ResourceManager:load Loading resource: ' + url + ' for entity: ' + entity)
  AssetLoader.load(
    url,
    args,
    (response: T) => {
      resource.status.set(ResourceStatus.Loaded)
      resource.asset.set(response)
      callbacks.onLoad(response, resource)
      onLoad(response)
    },
    (request) => {
      callbacks.onProgress(request, resource)
      onProgress(request)
    },
    (error) => {
      resource.status.set(ResourceStatus.Error)
      callbacks.onError(error, resource)
      onError(error)
    },
    signal
  )
}

const unload = (url: string, entity: Entity) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[url].value) {
    console.warn('ResourceManager:unload No resource exists for url: ' + url)
    return
  }

  debugLog('ResourceManager:unload Unloading resource: ' + url + ' for entity: ' + entity)
  const resource = resources[url]
  resource.references.set((entities) => {
    const index = entities.indexOf(entity)
    if (index > -1) {
      entities.splice(index, 1)
    }
    return entities
  })

  if (resource.references.length == 0) {
    debugLog('Before Removing Resources', debug && JSON.stringify(getRendererInfo()))
    removeResource(url)
    debugLog('After Removing Resources', debug && JSON.stringify(getRendererInfo()))
  }
}

const removeReferencedResources = (resource: State<Resource>) => {
  const resourceState = getMutableState(ResourceState)
  const referencedAssets = resourceState.nested('referencedAssets')

  for (const ref of resource.assetRefs.value) {
    referencedAssets[ref].set((refs) => {
      const index = refs.indexOf(resource.id.value)
      if (index > -1) {
        refs.splice(index, 1)
      }
      return refs
    })

    if (referencedAssets[ref].length == 0) {
      removeResource(ref)
      referencedAssets[ref].set(none)
    }
  }
}

const removeResource = (id: string) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[id].value) {
    console.warn('ResourceManager:removeResource No resource exists at id: ' + id)
    return
  }

  const resource = resources[id]
  debugLog(
    'ResourceManager:removeResource: Removing ' + resourceTypeName[resource.type.value] + ' resource with ID: ' + id
  )
  Cache.remove(id)
  removeReferencedResources(resource)

  const asset = resource.asset.get(NO_PROXY)
  if (asset) {
    switch (resource.type.value) {
      case ResourceType.GLTF:
        removeMaterialSource({ type: SourceType.MODEL, path: id })
        break
      case ResourceType.Texture:
        ;(asset as Texture).dispose()
        break
      case ResourceType.Geometry:
        ;(asset as Geometry).dispose()
        break
      case ResourceType.Material:
        {
          const material = asset as Material
          for (const [key, val] of Object.entries(material) as [string, Texture][]) {
            if (val && typeof val.dispose === 'function') {
              val.dispose()
            }
          }
          material.dispose()
        }
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

  resources[id].set(none)
}

export const ResourceManager = {
  load,
  unload,
  setDefaultLoadingManager
}
