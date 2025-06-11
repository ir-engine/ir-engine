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

import { Entity, getComponent } from '@ir-engine/ecs'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
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

const initializeLightmapper = (
  renderer: WebGLRenderer,
  positions: Texture,
  normals: Texture,
  bvh: MeshBVH,
  options: RaycastOptions
) => {
  const renderTexture = new WebGLRenderTarget(options.resolution, options.resolution, {
    type: FloatType,
    minFilter: LinearMipMapLinearFilter,
    magFilter: LinearFilter,
    generateMipmaps: true
  })
  renderer.setRenderTarget(renderTexture)
  renderer.setClearColor(0xff0000, 0)
  renderer.clear()

  const raycastMesh = new Mesh(
    new PlaneGeometry(2, 2),
    new LightmapperMaterial({
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
  )

  renderer.setRenderTarget(null)

  const orthographicCamera = new OrthographicCamera()

  return [renderTexture, raycastMesh, orthographicCamera]
}

const sampleLightmap = (
  raycastMesh: Mesh,
  renderTexture: WebGLRenderTarget,
  material: Entity,
  orthographicCamera: OrthographicCamera,
  renderer: WebGLRenderer,
  totalSamples: number
) => {
  renderer.setRenderTarget(renderTexture)

  const raycastMaterial = getComponent(material, MaterialStateComponent).material as ShaderMaterial

  raycastMaterial.uniforms.sampleIndex.value = totalSamples
  raycastMaterial.uniforms.opacity.value = totalSamples == 0 ? 1 : 1 / totalSamples

  renderer.render(raycastMesh, orthographicCamera)
  renderer.setRenderTarget(null)
  totalSamples++
  return totalSamples
}

export const Lightmapper = {
  initialize: initializeLightmapper,
  sample: sampleLightmap
}
