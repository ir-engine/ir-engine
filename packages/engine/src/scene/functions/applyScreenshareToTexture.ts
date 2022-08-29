import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  sRGBEncoding,
  Vector3,
  Vector4,
  VideoTexture
} from 'three'

import { OBCType } from '../../common/constants/OBCTypes'
import { addOBCPlugin } from '../../common/functions/OnBeforeCompilePlugin'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { ScreenshareTargetComponent } from '../components/ScreenshareTargetComponent'
import { fitTexture } from './fitTexture'

const screenshareTargetQuery = defineQuery([ScreenshareTargetComponent])

export const applyVideoToTexture = (
  video: HTMLVideoElement,
  obj: Mesh<any, any>,
  fit: 'fit' | 'fill' | 'stretch' = 'fit'
) => {
  if (!obj.material)
    obj.material = new MeshStandardMaterial({ color: 0xffffff, map: new VideoTexture(video), side: DoubleSide })

  if (!obj.material.map) obj.material.map = new VideoTexture(video)

  obj.material.map.encoding = sRGBEncoding

  const imageAspect = video.videoWidth / video.videoHeight
  // todo: include goemetry in calculation of
  const worldScale = obj.getWorldScale(new Vector3())
  const screenAspect = obj.geometry instanceof PlaneGeometry ? worldScale.x / worldScale.y : 1

  addOBCPlugin(obj.material, {
    id: OBCType.UVCLIP,
    compile: (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace('void main() {', `uniform vec4 clipColor;\nvoid main() {\n`)

      const mapFragment = `#ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D( map, vUv );

        // Newly added clipping Logic /////
        if (vUv.x < 0.0 || vUv.x > 1.0 || vUv.y < 0.0 || vUv.y > 1.0) sampledDiffuseColor = clipColor;
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
    for (const entity of screenshareTargetQuery(Engine.instance.currentWorld)) {
      const obj3d = getComponent(entity, Object3DComponent)?.value
      obj3d?.traverse((obj: Mesh<any, MeshStandardMaterial>) => {
        if (obj.material) {
          applyVideoToTexture(video, obj)
        }
      })
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
