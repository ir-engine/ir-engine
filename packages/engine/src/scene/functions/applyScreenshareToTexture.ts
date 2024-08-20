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

import { BufferGeometry, DoubleSide, Mesh, MeshStandardMaterial, SRGBColorSpace, Vector4, VideoTexture } from 'three'

import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { addOBCPlugin } from '@ir-engine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'

import { ScreenshareTargetComponent } from '../components/ScreenshareTargetComponent'
import { fitTexture } from './fitTexture'

const screenshareTargetQuery = defineQuery([MeshComponent, ScreenshareTargetComponent])

const getAspectRatioFromBufferGeometry = (mesh: Mesh<BufferGeometry>) => {
  mesh.geometry.computeBoundingBox()
  const boundingBox = mesh.geometry.boundingBox!
  const bb = boundingBox.clone().applyMatrix4(mesh.matrixWorld)
  return (bb.max.x - bb.min.x) / (bb.max.y - bb.min.y)
}

export const applyVideoToTexture = (
  video: HTMLVideoElement,
  obj: Mesh<any, any>,
  fit: 'fit' | 'fill' | 'stretch' = 'fit',
  overwrite = true
) => {
  if (!obj.material)
    obj.material = new MeshStandardMaterial({ color: 0xffffff, map: new VideoTexture(video), side: DoubleSide })

  if (!obj.material.map || overwrite) obj.material.map = new VideoTexture(video)

  obj.material.map.colorSpace = SRGBColorSpace

  const imageAspect = video.videoWidth / video.videoHeight
  const screenAspect = getAspectRatioFromBufferGeometry(obj)

  addOBCPlugin(obj.material, {
    id: 'ee.engine.UVClipPlugin',
    compile: (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace('void main() {', `uniform vec4 clipColor;\nvoid main() {\n`)

      const mapFragment = `#ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D( map, vMapUv );

        // Newly added clipping Logic /////
        if (vMapUv.x < 0.0 || vMapUv.x > 1.0 || vMapUv.y < 0.0 || vMapUv.y > 1.0) sampledDiffuseColor = clipColor;
        /////////////////////////////

        #ifdef DECODE_VIDEO_TEXTURE
          sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
        #endif
        diffuseColor *= sampledDiffuseColor;
      #endif`

      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', mapFragment)

      // TODO: Need to find better way to define variables
      shader.uniforms.clipColor = { value: new Vector4(0, 0, 0, 1) }
    }
  })

  fitTexture(obj.material.map, imageAspect, screenAspect, fit)
}

export const applyScreenshareToTexture = (video: HTMLVideoElement) => {
  const applyTexture = () => {
    if ((video as any).appliedTexture) return
    ;(video as any).appliedTexture = true
    if (!video.videoWidth || !video.videoHeight) return
    for (const entity of screenshareTargetQuery()) {
      const mesh = getComponent(entity, MeshComponent)
      if (mesh.material) {
        applyVideoToTexture(video, mesh)
      }
    }
  }
  if (!video.readyState) {
    video.onloadeddata = () => {
      applyTexture()
    }
  } else {
    applyTexture()
  }
}
