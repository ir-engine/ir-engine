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

import { Engine, Entity, getOptionalComponent } from '@etherealengine/ecs'
import {
  NO_PROXY,
  State,
  defineState,
  getMutableState,
  getState,
  none,
  useMutableState
} from '@etherealengine/hyperflux'
import { PerformanceState } from '@etherealengine/spatial/src/renderer/PerformanceState'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { useEffect } from 'react'
import { Cache, CompressedTexture, Material, Mesh, Object3D, Scene, SkinnedMesh, Texture } from 'three'
import { Geometry } from '../common/constants/Geometry'
import iterateObject3D from '../common/functions/iterateObject3D'

export interface DisposableObject {
  uuid: string
  id: number
  entity?: Entity
  dispose?: () => void
  disposed?: boolean
}

Cache.enabled = true

export enum ResourceStatus {
  Unloaded,
  Loading,
  Loaded,
  Error
}

export enum ResourceType {
  GLTF = 'GLTF',
  Mesh = 'Mesh',
  Texture = 'Texture',
  Geometry = 'Geometry',
  Material = 'Material',
  Object3D = 'Object3D',
  Unknown = 'Unknown'
  // ECSData = 'ECSData',
  // Audio = 'Audio',
}

type GLTF = {
  scene: Scene
  scenes: Scene[]
}

export type ResourceAssetType =
  | GLTF
  | Texture
  | CompressedTexture
  | Geometry
  | Material
  | Material[]
  | Mesh
  | DisposableObject

type BaseMetadata = {
  size?: number
}

type GLTFMetadata = {
  vertexCount: number
  textureWidths: number[]
} & BaseMetadata

type TexutreMetadata = {
  textureWidth: number
  onGPU: boolean
} & BaseMetadata

type Metadata = GLTFMetadata | TexutreMetadata | BaseMetadata

type Resource = {
  id: string
  status: ResourceStatus
  type: ResourceType
  references: Entity[]
  asset?: ResourceAssetType
  assetRefs?: Record<ResourceType, string[]>
  args?: Record<string, any>
  onLoads?: Record<string, (response: ResourceAssetType) => void>
  metadata: Metadata
}

export const ResourceState = defineState({
  name: 'ResourceManagerState',

  initial: () => ({
    resources: {} as Record<string, Resource>,
    referencedAssets: {} as Record<string, string[]>,
    totalVertexCount: 0,
    totalBufferCount: 0,
    debug: false
  }),

  reactor: () => {
    const resourceState = useMutableState(ResourceState)
    const debugEnabled = useMutableState(RendererState).nodeHelperVisibility

    useEffect(() => {
      if (debugEnabled.value) {
        //@ts-ignore
        window.resources = getState(ResourceState)
        resourceState.debug.set(true)
      } else {
        //@ts-ignore
        window.resources = undefined
        resourceState.debug.set(false)
      }
    }, [debugEnabled])
  },

  debugLog: (...data: any[]) => {
    if (getState(ResourceState).debug) console.log(...data)
  }
})

const onItemLoadedFor = <T extends ResourceAssetType>(
  url: string,
  resourceType: ResourceType,
  id: string,
  asset: T
) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[url].value) {
    // Volumetric models load assets that aren't managed by the resource manager
    // console.warn('ResourceManager:loadedFor asset loaded for asset that is not loaded: ' + url)
    return
  }

  ResourceState.debugLog(
    `ResourceManager:loadedFor loading asset of type ${resourceType} with ID: ${id} for asset at url: ${url}`
  )

  const referencedAssets = resourceState.nested('referencedAssets')
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
        metadata: {}
      }
    })
    const callbacks = resourceCallbacks[resourceType]
    callbacks.onStart(resources[id])
    callbacks.onLoad(asset, resources[id], resourceState)
  }

  if (!resources[url].assetRefs.value)
    resources[url].assetRefs.set({ [resourceType]: [id] } as Record<ResourceType, string[]>)
  else if (!resources[url].assetRefs[resourceType].value) resources[url].assetRefs.merge({ [resourceType]: [id] })
  else resources[url].assetRefs[resourceType].merge([id])

  referencedAssets[id].set([url])
}

const getTotalSizeOfResources = () => {
  let size = 0
  const resources = getState(ResourceState).resources
  for (const key in resources) {
    const resource = resources[key]
    if (resource.metadata.size) size += resource.metadata.size
  }

  return size
}

const getTotalBufferSize = () => {
  let size = 0
  const resources = getState(ResourceState).resources
  for (const key in resources) {
    const resource = resources[key]
    if (resource.type == ResourceType.Texture && resource.metadata.size) size += resource.metadata.size
  }

  return size
}

const getTotalVertexCount = () => {
  let verts = 0
  const resources = getState(ResourceState).resources
  for (const key in resources) {
    const resource = resources[key]
    if (resource.type == ResourceType.GLTF && (resource.metadata as GLTFMetadata).vertexCount)
      verts += (resource.metadata as GLTFMetadata).vertexCount
  }

  return verts
}

const getRendererInfo = () => {
  const renderer = getOptionalComponent(Engine.instance.viewerEntity, RendererComponent)?.renderer
  if (!renderer) return {}
  return {
    memory: renderer.info.memory,
    programCount: renderer.info.programs?.length
  }
}

const resourceCallbacks = {
  [ResourceType.GLTF]: {
    onStart: (resource: State<Resource>) => {},
    onLoad: (response: GLTF, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {
      const resources = getMutableState(ResourceState).nested('resources')
      const geometryIDs = resource.assetRefs[ResourceType.Geometry]
      const metadata = resource.metadata as State<GLTFMetadata>
      if (geometryIDs && geometryIDs.value) {
        let vertexCount = 0
        for (const geoID of geometryIDs.value) {
          const geoResource = resources[geoID].value
          const verts = (geoResource.metadata as GLTFMetadata).vertexCount
          if (verts) vertexCount += verts
        }
        metadata.merge({ vertexCount: vertexCount })
        resourceState.totalVertexCount.set(resourceState.totalVertexCount.value + vertexCount)
      }
      const textureIDs = resource.assetRefs[ResourceType.Texture]
      if (textureIDs && textureIDs.value) {
        const textureWidths = [] as number[]
        for (const textureID of textureIDs.value) {
          const texResource = resources[textureID].value
          const textureWidth = (texResource.metadata as TexutreMetadata).textureWidth
          if (textureWidth) textureWidths.push(textureWidth)
        }
        metadata.textureWidths.set(textureWidths)
      }
    },
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {
      resource.metadata.size.set(request.total)
    },
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {},
    onUnload: (asset: GLTF, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {
      const metadata = resource.metadata.value as GLTFMetadata
      if (metadata.vertexCount)
        resourceState.totalVertexCount.set(resourceState.totalVertexCount.value - metadata.vertexCount)
    }
  },
  [ResourceType.Texture]: {
    onStart: (resource: State<Resource>) => {
      resource.metadata.merge({ onGPU: false })
    },
    onLoad: (
      response: Texture | CompressedTexture,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>
    ) => {
      response.onUpdate = () => {
        if (resource && resource.value) resource.metadata.merge({ onGPU: true })
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

      resource.metadata.merge({ textureWidth: response.image.width })
      resourceState.totalBufferCount.set(resourceState.totalBufferCount.value + resource.metadata.size.value!)
    },
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {},
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {},
    onUnload: (
      asset: Texture | CompressedTexture,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>
    ) => {
      asset.dispose()
      const size = resource.metadata.size.value
      if (size) resourceState.totalBufferCount.set(resourceState.totalBufferCount.value - size)
    }
  },
  [ResourceType.Material]: {
    onStart: (resource: State<Resource>) => {},
    onLoad: (response: Material, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {},
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {},
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {},
    onUnload: (
      asset: Material | Material[],
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>
    ) => {
      disposeMaterial(asset)
    }
  },
  [ResourceType.Geometry]: {
    onStart: (resource: State<Resource>) => {},
    onLoad: (response: Geometry, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {
      // Estimated geometry size
      let size = 0
      for (const name in response.attributes) {
        const attr = response.getAttribute(name)
        size += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT
      }

      const indices = response.getIndex()
      if (indices) {
        resource.metadata.merge({ vertexCount: indices.count })
        size += indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT
      }
      resource.metadata.size.set(size)
    },
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {},
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {},
    onUnload: (asset: Geometry, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {
      disposeGeometry(asset)
    }
  },
  [ResourceType.Mesh]: {
    onStart: (resource: State<Resource>) => {},
    onLoad: (response: Material, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {},
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {},
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {},
    onUnload: (asset: Mesh, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {
      disposeMesh(asset)
    }
  },
  [ResourceType.Object3D]: {
    onStart: (resource: State<Resource>) => {},
    onLoad: (response: Material, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {},
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {},
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {},
    onUnload: (
      asset: DisposableObject,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>
    ) => {
      tryUnloadObj(asset)
    }
  },
  [ResourceType.Unknown]: {
    onStart: (resource: State<Resource>) => {},
    onLoad: (response: Material, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {},
    onProgress: (request: ProgressEvent, resource: State<Resource>) => {},
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => {},
    onUnload: (
      asset: ResourceAssetType,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>
    ) => {
      dispose(asset)
    }
  }
} as {
  [key in ResourceType]: {
    onStart: (resource: State<Resource>) => void
    onLoad: (
      response: ResourceAssetType,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>
    ) => void
    onProgress: (request: ProgressEvent, resource: State<Resource>) => void
    onError: (event: ErrorEvent | Error, resource: State<Resource>) => void
    onUnload: (
      asset: ResourceAssetType,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>
    ) => void
  }
}

const dispose = (asset: ResourceAssetType) => {
  if ((asset as Geometry).isBufferGeometry) disposeGeometry(asset as Geometry)
  else if ((asset as Material).isMaterial) disposeMaterial(asset as Material)
  else if ((asset as Mesh).isMesh) disposeMesh(asset as Mesh)
  else {
    const disposable = asset as DisposableObject
    if (!disposable.disposed && typeof disposable.dispose == 'function') disposable.dispose()
    disposable.disposed = true
  }
}

const disposeGeometry = (asset: Geometry) => {
  if ((asset as DisposableObject).disposed) return
  asset.dispose()
  for (const key in asset.attributes) {
    asset.deleteAttribute(key)
  }
  for (const key in asset.morphAttributes) {
    delete asset.morphAttributes[key]
  }

  //@ts-ignore todo - figure out why check errors flags this
  if (asset.boundsTree) asset.disposeBoundsTree()
  ;(asset as DisposableObject).disposed = true
}

const disposeMesh = (asset: Mesh) => {
  if ((asset as DisposableObject).disposed) return
  const skinnedMesh = asset as SkinnedMesh
  if (skinnedMesh.isSkinnedMesh && skinnedMesh.skeleton) {
    skinnedMesh.skeleton.dispose()
  }

  // InstancedMesh or anything with a dispose function
  const disposable = asset as DisposableObject
  if (typeof disposable.dispose === 'function') {
    disposable.dispose()
  }
  ;(asset as DisposableObject).disposed = true
}

const disposeMaterial = (asset: Material | Material[]) => {
  const dispose = (material: Material) => {
    if ((material as DisposableObject).disposed) return
    for (const [key, val] of Object.entries(material) as [string, Texture][]) {
      if (val && typeof val.dispose === 'function') {
        val.dispose()
      }
    }
    material.dispose()
    ;(material as DisposableObject).disposed = true
  }
  if (Array.isArray(asset)) {
    for (const mat of asset) dispose(mat)
  } else {
    dispose(asset)
  }
}

const checkBudgets = () => {
  const resourceState = getState(ResourceState)
  const performanceState = getState(PerformanceState)
  const maxVerts = performanceState.budgets.maxVerticies
  const maxBuffer = performanceState.budgets.maxBufferSize
  const currVerts = resourceState.totalVertexCount
  const currBuff = resourceState.totalBufferCount
  if (currVerts > maxVerts)
    console.warn('ResourceState:GLTF:onLoad Exceeded vertex budget, budget: ' + maxVerts + ', loaded: ' + currVerts)
  if (currBuff > maxBuffer)
    console.warn('ResourceState:GLTF:onLoad Exceeded buffer budget, budget: ' + maxBuffer + ', loaded: ' + currBuff)
}

const getResourceType = (asset: ResourceAssetType, defaultType: ResourceType = ResourceType.Unknown) => {
  if ((asset as Geometry).isBufferGeometry) return ResourceType.Geometry
  else if ((asset as Material).isMaterial) return ResourceType.Material
  else if ((asset as Mesh).isMesh) return ResourceType.Mesh
  else if ((asset as Texture).isTexture) return ResourceType.Texture
  else return defaultType
}

const loadObj = <T extends DisposableObject, T2 extends new (...params: any[]) => T>(
  disposableLike: T2,
  entity: Entity,
  ...args: ConstructorParameters<T2>
): InstanceType<T2> => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  const obj = new disposableLike(...args)
  if (entity) obj.entity = entity
  const id = obj.uuid
  const resourceType = getResourceType(obj, ResourceType.Object3D)
  const callbacks = resourceCallbacks[resourceType]

  // Only one object can exist per UUID
  resources.merge({
    [id]: {
      id: id,
      asset: obj as any,
      status: ResourceStatus.Loaded,
      type: resourceType,
      references: [entity],
      metadata: {},
      onLoads: {}
    }
  })

  const resource = resources[id]
  callbacks.onStart(resource)
  callbacks.onLoad(obj, resource, resourceState)
  ResourceState.debugLog('ResourceManager:loadObj Loading object resource: ' + id + ' for entity: ' + entity)
  return obj as InstanceType<T2>
}

const addReferencedAsset = (assetKey: string, asset: ResourceAssetType) => {
  const resourceType = getResourceType(asset)
  if (resourceType == ResourceType.Unknown) return

  switch (resourceType) {
    case ResourceType.GLTF:
      console.warn("ResourceState:addReferencedAsset GLTFs shouldn't be a referenced asset")
      break
    case ResourceType.Mesh:
      onItemLoadedFor(assetKey, resourceType, (asset as Mesh).uuid, asset as Mesh)
      break
    case ResourceType.Texture:
      onItemLoadedFor(assetKey, resourceType, (asset as Texture).source.uuid, asset as Texture)
      break
    case ResourceType.Geometry:
      onItemLoadedFor(assetKey, resourceType, (asset as Geometry).uuid, asset as Geometry)
      break
    case ResourceType.Material:
      onItemLoadedFor(assetKey, resourceType, (asset as Material).uuid, asset as Material)
      break
    case ResourceType.Object3D:
      onItemLoadedFor(assetKey, resourceType, (asset as Object3D).uuid, asset as Object3D)
      break
    default:
      break
  }
}

const addResource = <T extends object>(res: NonNullable<T> | (() => NonNullable<T>), id: string, entity: Entity): T => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  const obj = (typeof res === 'function' ? res() : res) as unknown as ResourceAssetType
  const resourceType = getResourceType(obj)
  const callbacks = resourceCallbacks[resourceType]
  resources.merge({
    [id]: {
      id: id,
      asset: obj,
      status: ResourceStatus.Loaded,
      type: resourceType,
      references: [entity],
      metadata: {},
      onLoads: {}
    }
  })

  const resource = resources[id]
  callbacks.onStart(resource)
  callbacks.onLoad(obj, resource, resourceState)
  ResourceState.debugLog('ResourceManager:addResource Loading resource: ' + id + ' for entity: ' + entity)
  return resource.asset.get(NO_PROXY) as T
}

const unload = (id: string, entity: Entity, uuid?: string) => {
  const resourceState = getMutableState(ResourceState)
  const resources = resourceState.nested('resources')
  if (!resources[id].value) {
    console.warn('ResourceManager:unload No resource exists for id: ' + id)
    return
  }

  const resource = resources[id]
  ResourceState.debugLog(
    `ResourceManager:unload Unloading resource: ${id}, for entity: ${entity}, of type: ${resource.type.value}`
  )
  if (uuid) resource.onLoads.merge({ [uuid]: none })
  resource.references.set((entities) => {
    const index = entities.indexOf(entity)
    if (index > -1) {
      entities.splice(index, 1)
    }
    return entities
  })

  if (resource.references.length == 0) {
    if (resourceState.debug.value)
      ResourceState.debugLog('Before Removing Resources: ' + JSON.stringify(getRendererInfo()))
    removeReferencedResources(resource)
    removeResource(id)
    if (resourceState.debug.value)
      ResourceState.debugLog('After Removing Resources: ' + JSON.stringify(getRendererInfo()))
  }
}

const tryUnloadObj = (obj: DisposableObject) => {
  const obj3D = obj as Object3D
  if (!obj3D.isObject3D) return

  const entity = obj.entity
  if (entity) removeObjectFromGroup(entity, obj3D)
  unloadObj(obj3D)
}

const disposeObj = (obj: Object3D, sceneID?: string) => {
  ResourceState.debugLog(`ResourceManager:unloadObj Unloading Object3D: ${obj.name} for scene: ${sceneID}`)
  const disposable = obj as DisposableObject // anything with dispose function
  if (typeof disposable.dispose === 'function') disposable.dispose()
}

const unloadObj = (obj: Object3D, sceneID?: string) => {
  if (obj.isProxified) {
    disposeObj(obj, sceneID)
  } else {
    iterateObject3D(obj, disposeObj)
  }
}

const removeReferencedResources = (resource: State<Resource>) => {
  const resourceState = getMutableState(ResourceState)
  const referencedAssets = resourceState.referencedAssets

  if (!resource.assetRefs.value) return

  for (const resourceType in ResourceType) {
    const assetRefs = resource.assetRefs[resourceType as ResourceType]
    if (!assetRefs.value) continue
    for (const ref of assetRefs.value) {
      if (referencedAssets[ref].value) {
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
  ResourceState.debugLog('ResourceManager:removeResource: Removing ' + resource.type.value + ' resource with ID: ' + id)
  Cache.remove(id)

  const asset = resource.asset.get(NO_PROXY)
  if (asset) {
    resourceCallbacks[resource.type.value].onUnload(asset, resource, resourceState)
  }

  resources[id].set(none)
}

export const ResourceManager = {
  resourceCallbacks,
  loadObj,
  addReferencedAsset,
  addResource,
  unload,
  unloadObj,
  removeReferencedResources,
  checkBudgets,
  budgets: {
    getTotalSizeOfResources,
    getTotalBufferSize,
    getTotalVertexCount
  }
}
