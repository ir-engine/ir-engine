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

import {
  AnimationClip,
  BufferAttribute,
  CompressedTexture,
  CompressedTextureMipmap,
  InterleavedBufferAttribute,
  Light,
  Line,
  Material,
  Mesh,
  Object3D,
  SkinnedMesh,
  Texture
} from 'three'

import {
  Engine,
  Entity,
  Layers,
  PresentationSystemGroup,
  UUIDComponent,
  defineSystem,
  getAncestorWithComponents,
  getAuthoringCounterpart,
  getComponent,
  getOptionalComponent,
  hasComponent
} from '@ir-engine/ecs'

import { NO_PROXY, State, defineState, getMutableState, getState, none, useMutableState } from '@ir-engine/hyperflux'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'

import { useEffect } from 'react'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { Geometry } from '../common/constants/Geometry'
import iterateObject3D from '../common/functions/iterateObject3D'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { PerformanceState } from '../renderer/PerformanceState'
import { RendererComponent } from '../renderer/components/RendererComponent'
import { VisibleComponent } from '../renderer/components/VisibleComponent'

// offloadTextureData implemented in engine package, but needs to be called and typed here

declare module 'three/src/textures/Texture.js' {
  export interface Texture {
    offloadTextureData: () => Promise<boolean>
  }
}

export interface DisposableObject {
  uuid: string
  id: number
  entity?: Entity
  dispose?: () => void
  disposed?: boolean
}

// Cache.enabled = true

export enum ResourceType {
  Mesh = 'Mesh',
  SkinnedMesh = 'SkinnedMesh',
  Texture = 'Texture',
  Geometry = 'Geometry',
  Material = 'Material',
  AnimationClip = 'AnimationClip',
  Line = 'Line',
  Light = 'Light',
  Audio = 'Audio',
  File = 'File',
  ArrayBuffer = 'ArrayBuffer',
  BufferAttribute = 'BufferAttribute',
  InterleavedBufferAttribute = 'InterleavedBufferAttribute',
  Unknown = 'Unknown'
  // ECSData = 'ECSData',
}

export type ResourceAssetType =
  | Texture
  | CompressedTexture
  | Geometry
  | Material
  | SkinnedMesh
  | Mesh
  | AnimationClip
  // | Bone // bone does not have any resources we need to rack
  | DisposableObject
  | BufferAttribute
  | InterleavedBufferAttribute
  | Light
  | AudioBuffer
  | ArrayBuffer
  | Line

type BaseMetadata = {
  size?: number
  discarded?: boolean
  onGPU?: boolean
}

type GLTFMetadata = {
  vertexCount: number
  textureWidths: number[]
} & BaseMetadata

type TextureMetadata = {
  textureWidth: number
} & BaseMetadata

type Metadata = GLTFMetadata | TextureMetadata | BaseMetadata

export type Resource = {
  id: string
  entity: Entity
  asset: ResourceAssetType
  name: string
  type: ResourceType
  metadata: Metadata
}

//#region budget checking functions
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
    if (resource.type == ResourceType.Geometry && (resource.metadata as GLTFMetadata).vertexCount)
      verts += (resource.metadata as GLTFMetadata).vertexCount
  }

  return verts
}

const useTotalVertexCount = () => {
  let verts = 0
  const resources = useMutableState(ResourceState).resources.value as Record<string, Resource>
  for (const key in resources) {
    const resource = resources[key]
    if (resource.type == ResourceType.Geometry && (resource.metadata as GLTFMetadata).vertexCount)
      verts += (resource.metadata as GLTFMetadata).vertexCount
  }

  return verts
}

const useVisibleVertexCount = () => {
  let verts = 0
  const resources = useMutableState(ResourceState).resources.value as Record<string, Resource>
  for (const key in resources) {
    const resource = resources[key]
    if (
      resource.type == ResourceType.Geometry &&
      (resource.metadata as GLTFMetadata).vertexCount &&
      hasComponent(resource.entity, VisibleComponent) &&
      // Ignore helpers and gizmos
      hasComponent(resource.entity, UUIDComponent)
    )
      verts += (resource.metadata as GLTFMetadata).vertexCount
  }

  return verts
}

const getRendererInfo = () => {
  const viewer = Engine?.instance?.viewerEntity as Entity | undefined
  if (!viewer) return {}
  const renderer = getOptionalComponent(viewer, RendererComponent)?.renderer
  if (!renderer) return {}
  return {
    memory: renderer.info.memory,
    programCount: renderer.info.programs?.length
  }
}

const checkBudgets = () => {
  const resourceState = getState(ResourceState)
  const performanceState = getState(PerformanceState)
  const maxVerts = performanceState.maxVerticies
  const maxBuffer = performanceState.maxBufferSize
  const currVerts = resourceState.totalVertexCount
  const currBuff = resourceState.totalBufferCount
  if (currVerts > maxVerts)
    ResourceState.debugWarn(
      'ResourceState:GLTF:onLoad Exceeded vertex budget, budget: ' + maxVerts + ', loaded: ' + currVerts
    )
  if (currBuff > maxBuffer)
    ResourceState.debugWarn(
      'ResourceState:GLTF:onLoad Exceeded buffer budget, budget: ' + maxBuffer + ', loaded: ' + currBuff
    )
}
//#endregion

//#region resource loading callbacks
const resourceCallbacks = {
  /** @todo add this GLTF tracking stuff back to the resources themselves */
  // [ResourceType.GLTF]: {
  //   onStart: (resource: State<Resource>) => {},
  //   onLoad: (asset: GLTF, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {
  //     const resources = getMutableState(ResourceState).nested('resources')
  //     const geometryIDs = resource.assetRefs[ResourceType.Geometry]
  //     const metadata = resource.metadata as State<GLTFMetadata>
  //     if (geometryIDs && geometryIDs.value) {
  //       let vertexCount = 0
  //       for (const geoID of geometryIDs.value) {
  //         const geoResource = resources[geoID].value
  //         const verts = (geoResource.metadata as GLTFMetadata).vertexCount
  //         if (verts) vertexCount += verts
  //       }
  //       metadata.merge({ vertexCount: vertexCount })
  //       resourceState.totalVertexCount.set(resourceState.totalVertexCount.value + vertexCount)
  //     }
  //     const textureIDs = resource.assetRefs[ResourceType.Texture]
  //     if (textureIDs && textureIDs.value) {
  //       const textureWidths = [] as number[]
  //       for (const textureID of textureIDs.value) {
  //         const texResource = resources[textureID].value
  //         const textureWidth = (texResource.metadata as TexutreMetadata).textureWidth
  //         if (textureWidth) textureWidths.push(textureWidth)
  //       }
  //       metadata.textureWidths.set(textureWidths)
  //     }

  //     if (asset.parser) delete asset.parser
  //   },
  //   onProgress: (request: ProgressEvent, resource: State<Resource>) => {
  //     resource.metadata.size.set(request.total)
  //   },
  //   onError: (event: ErrorEvent | Error, resource: State<Resource>) => {},
  //   onUnload: (asset: GLTF, resource: State<Resource>, resourceState: State<typeof ResourceState._TYPE>) => {
  //     const metadata = resource.metadata.value as GLTFMetadata
  //     if (metadata.vertexCount)
  //       resourceState.totalVertexCount.set(resourceState.totalVertexCount.value - metadata.vertexCount)
  //   }
  // },
  [ResourceType.Texture]: {
    onLoad: (
      asset: Texture | CompressedTexture,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>,
      discardUponUpload = false
    ) => {
      if (!asset.image) return

      resource.metadata.merge({ onGPU: false, discarded: false })
      asset.onUpdate = () => {
        if (!resource?.value?.metadata) return
        resource.metadata.merge({ onGPU: true, discarded: false })
        setTimeout(() => {
          const viewer = getState(ReferenceSpaceState).viewerEntity
          const renderer = getComponent(viewer, RendererComponent)
          const gl = renderer.renderContext as WebGL2RenderingContext
          if (discardUponUpload && typeof gl.fenceSync === 'function') {
            const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
            if (sync) {
              gl.flush()
              let count = 0
              const checkSync = () => {
                const status = gl.clientWaitSync(sync, 0, 0)
                if (status === gl.TIMEOUT_EXPIRED && count++ < 10) {
                  setTimeout(checkSync)
                } else {
                  gl.deleteSync(sync)
                  asset
                    .offloadTextureData()
                    .then(() => {
                      if (!resource?.value?.metadata) return
                      resource.metadata.merge({ onGPU: true, discarded: true })
                    })
                    .catch((err) => {
                      console.error(err)
                    })
                }
              }
              setTimeout(checkSync)
            }
          }
        }, 1000)
      }
      //Compressed texture size
      if (asset.mipmaps![0]) {
        let size = 0
        for (const mip of asset.mipmaps as CompressedTextureMipmap[]) {
          size += mip.data.byteLength
        }
        resource.metadata.size.set(size)
        // Non compressed texture size
      } else {
        const height = asset.image.height
        const width = asset.image.width
        const size = width * height * 4
        resource.metadata.size.set(size)
      }
      /** @todo why did we put the id on the source data? */
      // if ((asset as CompressedTexture).isCompressedTexture) {
      //   const id = resource.id.value
      //   if (id.endsWith('ktx2')) asset.source.data.src = id
      // }`
      resource.metadata.merge({ textureWidth: asset.image.width })
      resourceState.totalBufferCount.set(resourceState.totalBufferCount.value + resource.metadata.size.value!)
    },
    onUnload: (
      asset: Texture | CompressedTexture,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>,
      discardUponUpload: boolean
    ) => {
      asset.dispose?.()
      if (!resource.value?.metadata) return
      const size = resource.metadata.size.value
      if (size) resourceState.totalBufferCount.set(resourceState.totalBufferCount.value - size)
    }
  },
  [ResourceType.Geometry]: {
    onLoad: (
      asset: Geometry,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>,
      discardUponUpload: boolean
    ) => {
      asset.computeBoundingSphere()

      // Estimated geometry size
      const attributeKeys = Object.keys(asset.attributes)
      let needsUploaded = asset.index ? attributeKeys.length + 1 : attributeKeys.length
      let size = 0

      const checkUploaded = () => {
        if (!resource.get(NO_PROXY)?.metadata) return
        resource.metadata.merge({ onGPU: needsUploaded === 0, discarded: false }) //needsUploaded === 0 && discardUponUpload })
      }

      asset.index?.onUpload(function () {
        if (discardUponUpload) {
          /** @todo re-enable discard */
          // this.array = new this.array.constructor(1)
        }
        needsUploaded -= 1
        checkUploaded()
      })

      for (const name of attributeKeys) {
        const attr = asset.getAttribute(name) as BufferAttribute
        size += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT
        if (typeof attr.onUpload === 'function') {
          attr.onUpload(function () {
            if (discardUponUpload) {
              /** @todo re-enable discard */
              // this.array = new this.array.constructor(1)
            }
            needsUploaded -= 1
            checkUploaded()
          })
        } else {
          needsUploaded -= 1
        }
      }
      checkUploaded()

      const indices = asset.getIndex()
      if (indices) {
        resource.metadata.merge({ vertexCount: indices.count })
        size += indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT
      }
      resource.metadata.size.set(size)
    }
  },
  [ResourceType.AnimationClip]: {
    onLoad: (
      asset: AnimationClip,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>,
      discardUponUpload: boolean
    ) => {
      let size = 0
      for (const track of asset.tracks) {
        const times = track.times
        const values = track.values
        size += times.length * times.BYTES_PER_ELEMENT + values.length * values.BYTES_PER_ELEMENT
      }
      resource.metadata.size.set(size)
    }
  }
} as {
  [key in ResourceType]: {
    onLoad?: (
      asset: ResourceAssetType,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>,
      discardUponUpload?: boolean
    ) => void
    onProgress?: (request: ProgressEvent, resource: State<Resource>) => void
    onError?: (event: ErrorEvent | Error, resource: State<Resource>) => void
    onUnload?: (
      asset: ResourceAssetType,
      resource: State<Resource>,
      resourceState: State<typeof ResourceState._TYPE>
    ) => void
  }
}
//#endregion

//#region resource disposal functions
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
  if (asset.boundsTree && typeof asset.disposeBoundsTree === 'function') asset.disposeBoundsTree()
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
      // Ignore envmaps until resource reference counting is reimplemented
      if (isTexture(val) && key !== 'envMap') {
        // Dispose texture if it was added to material after the material added
        val.dispose?.()
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

const disposeObj = (obj: Object3D) => {
  ResourceState.debugLog(`ResourceManager:unloadObj Unloading Object3D: ${obj.name}}`)
  const disposable = obj as DisposableObject // anything with dispose function
  if (typeof disposable.dispose === 'function') disposable.dispose()
}
//#endregion

const isTexture = (val: any): val is Texture => {
  return val && typeof val === 'object' && 'isTexture' in val
}

const getResourceType = (
  asset: Exclude<ResourceAssetType, Material[]>,
  defaultType: ResourceType = ResourceType.Unknown
) => {
  if ((asset as Geometry).isBufferGeometry) return ResourceType.Geometry
  else if ((asset as Material).isMaterial) return ResourceType.Material
  else if ((asset as SkinnedMesh).isSkinnedMesh) return ResourceType.Mesh
  else if ((asset as Mesh).isMesh) return ResourceType.Mesh
  else if ((asset as CompressedTexture).isCompressedTexture) return ResourceType.Texture
  else if ((asset as Texture).isTexture) return ResourceType.Texture
  else if ((asset as Line).isLine) return ResourceType.Line
  else if ((asset as Light).isLight) return ResourceType.Light
  else if (asset instanceof AnimationClip) return ResourceType.AnimationClip
  else if (asset instanceof BufferAttribute) return ResourceType.BufferAttribute
  else if (asset instanceof InterleavedBufferAttribute) return ResourceType.InterleavedBufferAttribute
  else return defaultType
}

let _resourceID = 0

const getResourceID = (asset: ResourceAssetType): string => {
  if ('resourceID' in asset) return asset.resourceID as string
  const resourceID = (_resourceID++).toString()
  Object.defineProperty(asset, 'resourceID', { value: resourceID, configurable: true })
  return resourceID
}

const tryUnloadObj = (obj: DisposableObject) => {
  const obj3D = obj as Object3D
  if (!obj3D.isObject3D) return

  unloadObj(obj3D)
}

const unloadObj = (obj: Object3D) => {
  // @ts-ignore
  if (obj.isProxified) {
    disposeObj(obj)
  } else {
    iterateObject3D(obj, disposeObj)
  }
}

const removeResource = (id: string) => {
  /** @todo */
  // const resourceState = getMutableState(ResourceState)
  // const resources = resourceState.resources
  // if (!resources[id].value) {
  //   ResourceState.debugWarn('ResourceManager:removeResource No resource exists at id: ' + id)
  //   return
  // }
  // Cache.remove(id)
  // const resource = resources[id]
  // ResourceState.debugLog('ResourceManager:removeResource: Removing ' + resource.type.value + ' resource with ID: ' + id)
  // const asset = resource.asset.get(NO_PROXY) as ResourceAssetType
  // if (asset) {
  //   resourceCallbacks[resource.type.value].onUnload(asset, resource, resourceState)
  // }
  // resources[id].set(none)
}

const getResourceName = (asset: ResourceAssetType) => {
  if ('name' in asset && asset.name !== '') return asset.name
  if ('src' in asset && asset.src !== '') return asset.src as string
  if ('constructor' in asset) return asset.constructor.name
  return 'Unknown'
}

const addEntityResource = (
  entity: Entity,
  asset: ResourceAssetType,
  returnedResources = [] as Resource[],
  extraData?: string
) => {
  if (Array.isArray(asset)) {
    for (const assetItem of asset) {
      addEntityResource(entity, assetItem, returnedResources)
    }
    return returnedResources
  }

  const resourceType = getResourceType(asset)
  /** @todo if we don't recognize the resource, we don't need to track it */
  if (resourceType === ResourceType.Unknown) return returnedResources

  const id = getResourceID(asset)

  ResourceState.debugLog('addEntityResource', { entity, asset, resourceType, id })
  const name = extraData ?? getResourceName(asset)

  const resource: Resource = {
    id,
    entity,
    asset,
    name,
    type: resourceType,
    metadata: {}
  }

  const resourceState = getMutableState(ResourceState)
  resourceState.resources.merge({
    [id]: resource
  })

  returnedResources.push(resource)

  const entityHasAuthoringUpstream =
    getAuthoringCounterpart(entity) || getAncestorWithComponents(entity, [ColliderComponent]) // collider component is a hack to prevent unloading of physics objects

  const callbacks = resourceCallbacks[resourceType]
  if (callbacks?.onLoad)
    callbacks.onLoad(asset, resourceState.resources[id], resourceState, !entityHasAuthoringUpstream)

  switch (resourceType) {
    case ResourceType.Line:
    case ResourceType.Mesh: {
      const mesh = asset as Mesh | Line
      if (Array.isArray(mesh.material)) {
        for (const mat of mesh.material) {
          addEntityResource(entity, mat, returnedResources)
        }
      } else {
        addEntityResource(entity, mesh.material, returnedResources)
      }
      addEntityResource(entity, mesh.geometry, returnedResources)
      break
    }
    case ResourceType.Material: {
      const material = asset as Material
      for (const [key, val] of Object.entries(material) as [string, any][]) {
        if (isTexture(val) && key !== 'envMap') {
          addEntityResource(entity, val, returnedResources)
        }
      }
      break
    }
    case ResourceType.Geometry: {
      const geometry = asset as Geometry
      const indices = geometry.getIndex()
      if (indices) addEntityResource(entity, indices, returnedResources)
      const attributes = geometry.attributes
      for (const key in attributes) {
        addEntityResource(entity, attributes[key], returnedResources)
      }
      break
    }

    default: {
      break
    }
  }

  return returnedResources
}

const removeEntityResource = (resource: Resource) => {
  const asset = resource.asset

  const resourceType = resource.type
  const id = resource.id

  ResourceState.debugLog('removeEntityResource', { asset, resourceType, id })

  const resourceState = getMutableState(ResourceState)

  const callbacks = resourceCallbacks[resourceType]
  if (callbacks?.onUnload) callbacks.onUnload(asset, resourceState.resources[id], resourceState)

  resourceState.resources[id].set(none)

  tryUnloadObj(asset as any)
  dispose(asset)
}

const getAllResourcesOfType = (type: ResourceType) => {
  const resources = getState(ResourceState).resources
  const result = [] as Resource[]
  for (const key in resources) {
    const resource = resources[key]
    if (resource.type === type) result.push(resource)
  }
  return result
}

export const ResourceState = defineState({
  name: 'ResourceState',

  initial: () => ({
    resources: {} as Record<string, Resource>,
    totalVertexCount: 0,
    totalBufferCount: 0,
    debug: false
  }),

  debugLog: (...data: any[]) => {
    if (getState(ResourceState).debug) console.log(...data)
  },
  debugWarn: (...data: any[]) => {
    if (getState(ResourceState).debug) console.warn(...data)
  },

  getAllResourcesOfType,

  resourceCallbacks,
  addEntityResource,
  removeEntityResource,
  getResourceID,
  checkBudgets,
  budgets: {
    getTotalSizeOfResources,
    getTotalBufferSize,
    getTotalVertexCount,
    useTotalVertexCount,
    useVisibleVertexCount
  },
  /** Removes a resource even if it is still being referenced, needed for updating assets in the studio */
  __unsafeRemoveResource: removeResource
})

export const ResourceStateSystem = defineSystem({
  uuid: 'core.spatial.ResourceStateSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    useEffect(() => {
      // @ts-ignore - @todo Object3D recursively nested property types causes issues here
      const handle = ObjectComponent.defineObserver(
        (entity) => {
          const asset = getComponent(entity, ObjectComponent)
          const resources = addEntityResource(entity, asset)
          if (!resources.length) return
          return () => {
            for (const resource of resources) removeEntityResource(resource)
          }
        },
        '',
        Layers.Simulation
      )
      return () => {
        ObjectComponent.removeObserver(handle)
      }
    })
    return null
  }
})
