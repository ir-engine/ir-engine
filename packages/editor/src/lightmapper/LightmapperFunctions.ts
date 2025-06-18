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

import { Entity, getComponent, getSimulationCounterpart, setComponent } from '@ir-engine/ecs'
import { convertImageDataToKTX2Blob } from '@ir-engine/engine/src/scene/classes/ImageUtils'
import { mergeGeometries } from '@ir-engine/engine/src/scene/util/meshUtils'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import {
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
 */
const initializeLightmapper = (
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
 */
const sampleLightmap = (
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
 * Creates a merged mesh BVH from the entities provided
 */
const getBakeBVH = (entities: Entity[]) => {
  const meshComponents = entities.map((entity) => getComponent(entity, MeshComponent))
  const geometries = meshComponents.map((meshComponent) => meshComponent.geometry.clone())
  for (let i = 0; i < geometries.length; i++) {
    geometries[i].applyMatrix4(meshComponents[i].matrixWorld)
  }
  const merged = mergeGeometries(geometries)!

  return new MeshBVH(merged)
}

/**
 * Convert the lightmapper render target texture to ImageData and upload it to the project files
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
 * Kicks off lightmap baking
 * @param entity the lightmap bake entity
 * @param entities the atlased entities to bake
 * @param resolution the resolution of the lightmap, must be power of 2
 * @param samples the number of samples to take, higher numbers take longer but yield better results
 */
const handleBakeLightmap = (entity: Entity, entities: Entity[], resolution: number, samples: number) => {
  if (!entities.length) console.error('No atlased entities to bake')

  const textures = AtlasingFunctions.renderAtlas(
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
      indirectLightEnabled: true,
      ambientLightEnabled: true,
      ambientDistance: 1
    }
  )

  setComponent(getSimulationCounterpart(entity), LightmapBakeComponent, {
    entities: entities as Entity[],
    renderTarget: renderTexture,
    raycastMesh,
    orthographicCamera,
    raycastMaterial,
    totalSamples: samples,
    currentSamples: 0
  })
}

export const Lightmapper = {
  initialize: initializeLightmapper,
  sample: sampleLightmap,
  getBakeBVH,
  uploadLightmapTexture,
  handleBakeLightmap
}
