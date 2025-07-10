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

import { Entity, getComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs'
import { convertImageDataToKTX2Blob } from '@ir-engine/engine/src/scene/classes/ImageUtils'
import { mergeGeometries } from '@ir-engine/engine/src/scene/util/meshUtils'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  BufferAttribute,
  BufferGeometry,
  FloatType,
  LinearFilter,
  LinearMipMapLinearFilter,
  Matrix4,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  TextureFilter,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three'
import { MeshBVH } from 'three-mesh-bvh'
import { uploadProjectFiles } from '../functions/assetFunctions'
import { EditorState } from '../services/EditorServices'
import { AtlasingFunctions } from './AtlasingFunctions'
import { LightmapBakeComponent } from './LightmapBakeComponent'
import { LightmapperMaterial } from './LightmapperMaterial'

export type RaycastOptions = {
  resolution: number
  casts: number
  lightPosition: Vector3
  lightSize: number
  filterMode: TextureFilter

  directLightEnabled: boolean
  indirectLightEnabled: boolean
  ambientLightEnabled: boolean
  ambientDistance: number
}

/**
 * Initialize the lightmapper, creates and sets up a render target plane to render the lightmap shader to
 * This is run to set up the render target and material for sampling
 * @param renderer The renderer to use, in most cases this will be the viewer entity's renderer
 * @param positions The atlas texture containing the world positions of each pixel
 * @param normals The atlas texture containing the world normals of each pixel
 * @param bvh The BVH of the entities to bake
 * @param options The raycast options
 * @returns The render target, raycast mesh, orthographic camera, and raycast material
 */
const initialize = (
  renderer: WebGLRenderer,
  positions: Texture,
  normals: Texture,
  bvh: MeshBVH,
  options: RaycastOptions
): [WebGLRenderTarget, Mesh, OrthographicCamera, LightmapperMaterial] => {
  const renderTexture = new WebGLRenderTarget(options.resolution, options.resolution, {
    type: FloatType,
    minFilter: LinearMipMapLinearFilter,
    magFilter: LinearFilter,
    generateMipmaps: true,
    colorSpace: 'srgb'
  })
  renderer.setRenderTarget(renderTexture)
  renderer.setClearColor(0xff0000, 0)
  renderer.clear()

  const raycastMaterial = new LightmapperMaterial({
    bvh,
    invModelMatrix: new Matrix4().identity(),
    positions,
    normals,
    casts: options.casts,
    lightPosition: options.lightPosition,
    lightSize: options.lightSize,
    opacity: 1,
    sampleIndex: 0,
    directLightEnabled: options.directLightEnabled,
    indirectLightEnabled: options.indirectLightEnabled,
    ambientLightEnabled: options.ambientLightEnabled,
    ambientDistance: options.ambientDistance
  })

  const raycastMesh = new Mesh(new PlaneGeometry(2, 2), raycastMaterial)

  renderer.setRenderTarget(null)

  const orthographicCamera = new OrthographicCamera()

  return [renderTexture, raycastMesh, orthographicCamera, raycastMaterial]
}

/**
 * Render the lightmap shader
 * @param raycastMesh The flat plane mesh to render
 * @param renderTexture The render target to render to
 * @param raycastMaterial The material to render
 * @param orthographicCamera The camera to render with
 * @param renderer The renderer to use
 * @param totalSamples The total number of samples to render
 * @returns The number of samples rendered
 */
const sample = (
  raycastMesh: Mesh,
  renderTexture: WebGLRenderTarget,
  raycastMaterial: ShaderMaterial,
  orthographicCamera: OrthographicCamera,
  renderer: WebGLRenderer,
  totalSamples: number
) => {
  renderer.setRenderTarget(renderTexture)

  raycastMaterial.uniforms.sampleIndex.value = totalSamples
  raycastMaterial.uniforms.opacity.value = totalSamples == 0 ? 1 : 1 / totalSamples

  renderer.render(raycastMesh, orthographicCamera)
  renderer.setRenderTarget(null)
  totalSamples++
  return totalSamples
}

/**
 * Creates a new BufferGeometry containing only the specified groups from the source geometry
 * Currently used as a workaround for transparent materials occluding light
 * This will be removed once the lightmapper considers material data and transparency
 * @param sourceGeometry The source geometry to create the new geometry from
 * @param groups The groups to include in the new geometry
 */
const createGeometryFromGroups = (
  sourceGeometry: BufferGeometry,
  groups: Array<{ start: number; count: number; materialIndex?: number }>
) => {
  const newGeometry = new BufferGeometry()
  const index = sourceGeometry.index

  if (!index) {
    console.warn('createGeometryFromGroups: Source geometry must be indexed')
    return sourceGeometry.clone()
  }

  const totalIndices = groups.reduce((sum, group) => sum + group.count, 0)

  const newIndices = new (index.array.constructor as any)(totalIndices)
  let newIndexOffset = 0

  const usedVertices = new Set<number>()

  for (const group of groups) {
    for (let i = 0; i < group.count; i++) {
      const originalIndex = index.getX(group.start + i)
      newIndices[newIndexOffset + i] = originalIndex
      usedVertices.add(originalIndex)
    }
    newIndexOffset += group.count
  }

  const vertexMap = new Map<number, number>()
  const sortedVertices = Array.from(usedVertices).sort((a, b) => a - b)
  sortedVertices.forEach((oldIndex, newIndex) => {
    vertexMap.set(oldIndex, newIndex)
  })

  for (let i = 0; i < newIndices.length; i++) {
    newIndices[i] = vertexMap.get(newIndices[i])!
  }

  newGeometry.setIndex(new BufferAttribute(newIndices, 1))

  for (const attributeName in sourceGeometry.attributes) {
    const sourceAttribute = sourceGeometry.attributes[attributeName]
    const itemSize = sourceAttribute.itemSize
    const newArray = new (sourceAttribute.array.constructor as any)(sortedVertices.length * itemSize)

    sortedVertices.forEach((oldVertexIndex, newVertexIndex) => {
      for (let i = 0; i < itemSize; i++) {
        newArray[newVertexIndex * itemSize + i] = sourceAttribute.array[oldVertexIndex * itemSize + i]
      }
    })

    newGeometry.setAttribute(attributeName, new BufferAttribute(newArray, itemSize))
  }

  let groupStart = 0
  for (const group of groups) {
    newGeometry.addGroup(groupStart, group.count, group.materialIndex)
    groupStart += group.count
  }

  return newGeometry
}

/**
 * Creates a merged mesh BVH from the entities provided,
 * and removes any transparent materials from the BVH,
 * transparent materials are not yet supported by the lightmapper
 * @param entities The mesh entities to create the BVH from
 * @todo add material consideration to the lightmapper shader */
const getBakeBVH = (entities: Entity[]) => {
  const meshComponents = entities.map((entity) => getComponent(entity, MeshComponent))
  const geometries = meshComponents
    .map((meshComponent, index) => {
      const clonedGeometry = meshComponent.geometry.clone()

      // remove any groups/geometries that use transparency materials for now
      const entity = entities[index]
      const materialInstanceComponent = getOptionalComponent(entity, MaterialInstanceComponent)
      if (materialInstanceComponent) {
        const materialEntities = materialInstanceComponent.entities

        if (clonedGeometry.groups.length > 0) {
          const transparentGroupIndices = new Set<number>()

          materialEntities.forEach((materialEntity, materialIndex) => {
            const materialStateComponent = getOptionalComponent(materialEntity, MaterialStateComponent)
            if (materialStateComponent) {
              const material = materialStateComponent.material
              if (material.transparent || material.opacity < 1.0) {
                transparentGroupIndices.add(materialIndex)
              }
            }
          })

          if (transparentGroupIndices.size > 0) {
            const filteredGroups = clonedGeometry.groups.filter((group, groupIndex) => {
              return !transparentGroupIndices.has(group.materialIndex || groupIndex)
            })

            if (filteredGroups.length === 0) {
              return null
            }

            const newGeometry = createGeometryFromGroups(clonedGeometry, filteredGroups)
            return newGeometry
          }
        } else {
          if (materialEntities.length > 0) {
            const materialEntity = materialEntities[0]
            const materialStateComponent = getOptionalComponent(materialEntity, MaterialStateComponent)
            if (materialStateComponent) {
              const material = materialStateComponent.material
              if (material.transparent || material.opacity < 1.0) {
                return null
              }
            }
          }
        }
      }

      const positionNormalized = clonedGeometry.attributes.position.normalized
      const normalNormalized = clonedGeometry.attributes.normal.normalized
      const indexNormalized = clonedGeometry.index?.normalized
      console.log(clonedGeometry, positionNormalized, normalNormalized, indexNormalized)
      return clonedGeometry
    })
    .filter((geometry) => geometry !== null) // Remove null geometries (transparent single materials)

  for (let i = 0; i < geometries.length; i++) {
    geometries[i].applyMatrix4(meshComponents[i].matrixWorld)
  }
  //remove all geometry attributes except position and normal
  for (let i = 0; i < geometries.length; i++) {
    const geometry = geometries[i]
    const attributes = geometry.attributes
    for (const attributeName in attributes) {
      if (attributeName !== 'position') {
        geometry.deleteAttribute(attributeName)
      }
    }
  }

  const merged = mergeGeometries(geometries)!
  return new MeshBVH(merged)
}

/**
 * Convert the lightmapper render target texture to ImageData and upload it to the project files
 * @param renderTarget The render target to upload
 * @param entity The entity to upload the lightmap for
 * @returns The URL of the uploaded lightmap texture
 */
const uploadLightmapTexture = async (renderTarget: WebGLRenderTarget, entity: Entity): Promise<string | null> => {
  const editorState = getState(EditorState)!
  const projectName = editorState.projectName!
  const sceneName = editorState.sceneName!

  if (!projectName || !sceneName) {
    console.warn('Project name or scene name not available for lightmap upload')
    return null
  }

  const renderer = getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer!

  const floatPixels = new Float32Array(4 * renderTarget.width * renderTarget.height)
  renderer.readRenderTargetPixels(renderTarget, 0, 0, renderTarget.width, renderTarget.height, floatPixels)

  const uint8Pixels = new Uint8ClampedArray(floatPixels.length)
  for (let i = 0; i < floatPixels.length; i++) {
    const linearValue = Math.max(0, Math.min(1, floatPixels[i]))
    // sRGB gamma correction
    const srgbValue = linearValue <= 0.0031308 ? linearValue * 12.92 : 1.055 * Math.pow(linearValue, 1.0 / 2.4) - 0.055
    uint8Pixels[i] = Math.floor(srgbValue * 255)
  }

  const imageData = new ImageData(uint8Pixels, renderTarget.width, renderTarget.height)

  const blob = await convertImageDataToKTX2Blob(imageData)
  if (!blob) {
    console.error('Failed to convert image data to KTX2 blob')
    return null
  }

  const filename = `${getComponent(entity, NameComponent)}.ktx2`
  const file = new File([blob], filename, { type: 'image/ktx2' })

  const lightmapPath = `public/scenes/lightmap/${sceneName.substring(0, sceneName.lastIndexOf('.'))}`

  const uploadResult = uploadProjectFiles(
    projectName,
    [file],
    [lightmapPath],
    [{ contentType: 'image/ktx2', type: 'asset' }]
  )

  const urls = await Promise.all(uploadResult.promises)
  return urls[0]?.[0] || null
}

/**
 * Kicks off lightmap baking using the simulation layer entity
 * @param entity the lightmap bake entity
 * @param entities the atlased entities to bake
 * @param resolution the resolution of the lightmap, must be power of 2
 * @param samples the number of samples to take, higher numbers take longer but yield better results
 */
const handleBakeLightmap = (
  entity: Entity,
  entities: Entity[],
  resolution: number,
  samples: number,
  channel: number,
  bakeIndirect: boolean = true,
  bakeAO: boolean = true
) => {
  if (!entities.length) console.error('No atlased entities to bake')

  const textures = AtlasingFunctions.renderAtlasTextures(
    getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer!,
    entities.map((entity) => getComponent(entity, MeshComponent)),
    resolution,
    true
  )

  const [renderTexture, raycastMesh, orthographicCamera, raycastMaterial] = Lightmapper.initialize(
    getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer!,
    textures.positionTexture,
    textures.normalTexture,
    Lightmapper.getBakeBVH(entities as Entity[]),
    {
      resolution,
      casts: 1,
      lightPosition: new Vector3(),
      lightSize: 1,
      filterMode: LinearFilter,
      directLightEnabled: false,
      indirectLightEnabled: bakeIndirect,
      ambientLightEnabled: bakeAO,
      ambientDistance: 1
    }
  )

  setComponent(entity, LightmapBakeComponent, {
    entities: entities as Entity[],
    renderTarget: renderTexture,
    raycastMesh,
    orthographicCamera,
    raycastMaterial,
    totalSamples: samples,
    currentSamples: 0,
    channel
  })
}

export const Lightmapper = {
  initialize,
  sample,
  getBakeBVH,
  uploadLightmapTexture,
  handleBakeLightmap
}
