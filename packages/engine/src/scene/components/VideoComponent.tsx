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

import { useEffect } from 'react'
import {
  ClampToEdgeWrapping,
  DoubleSide,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Side,
  SphereGeometry,
  Uniform,
  Vector2,
  VideoTexture,
  Wrapping
} from 'three'

import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { defineState, NO_PROXY, useHookstate } from '@etherealengine/hyperflux'
import { isMobile } from '@etherealengine/spatial/src/common/functions/isMobile'
import { createPriorityQueue } from '@etherealengine/spatial/src/common/functions/PriorityQueue'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { MeshComponent, useMeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { setVisibleComponent, VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { isMobileXRHeadset } from '@etherealengine/spatial/src/xr/XRState'
import { ContentFitType, ObjectFitFunctions } from '@etherealengine/spatial/src/xrui/functions/ObjectFitFunctions'

import { clearErrors } from '../functions/ErrorFunctions'
import { PLANE_GEO, resizeVideoMesh, SPHERE_GEO } from './ImageComponent'
import { MediaElementComponent } from './MediaComponent'

export const VideoTexturePriorityQueueState = defineState({
  name: 'VideoTexturePriorityQueueState',
  initial: () => {
    const accumulationBudget = isMobileXRHeadset || isMobile ? 1 : 3
    return {
      queue: createPriorityQueue({
        accumulationBudget
      })
    }
  }
})

class VideoTexturePriorityQueue extends VideoTexture {
  constructor(video) {
    super(video)
    this.minFilter = LinearFilter
    this.magFilter = LinearFilter
    this.generateMipmaps = false
  }
  update() {}
}

export const VideoComponent = defineComponent({
  name: 'EE_video',
  jsonID: 'EE_video',

  onInit: (entity) => {
    return {
      side: DoubleSide as Side,
      size: new Vector2(1, 1),
      uvOffset: new Vector2(0, 0),
      uvScale: new Vector2(1, 1),
      alphaUVOffset: new Vector2(0, 0),
      alphaUVScale: new Vector2(1, 1),
      wrapS: ClampToEdgeWrapping as Wrapping,
      wrapT: ClampToEdgeWrapping as Wrapping,
      useAlpha: false,
      useAlphaUVTransform: false,
      alphaThreshold: 0.5,
      fit: 'contain' as ContentFitType,
      projection: 'Flat' as 'Flat' | 'Equirectangular360',
      mediaUUID: '' as EntityUUID,
      // internal
      videoMeshEntity: UndefinedEntity,
      texture: null as VideoTexturePriorityQueue | null
    }
  },

  toJSON: (entity, component) => {
    return {
      /**
       * An entity with with an attached MediaComponent;if an empty string, then the current entity is assumed
       */
      mediaUUID: component.mediaUUID.value,
      side: component.side.value,
      size: component.size.value,
      uvOffset: component.uvOffset.value,
      uvScale: component.uvScale.value,
      alphaUVOffset: component.alphaUVOffset.value,
      alphaUVScale: component.alphaUVScale.value,
      wrapS: component.wrapS.value,
      wrapT: component.wrapT.value,
      useAlpha: component.useAlpha.value,
      useAlphaUVTransform: component.useAlphaUVTransform.value,
      alphaThreshold: component.alphaThreshold.value,
      fit: component.fit.value,
      projection: component.projection.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.mediaUUID === 'string') component.mediaUUID.set(json.mediaUUID)
    if (typeof json.side === 'number') component.side.set(json.side)
    if (typeof json.size === 'object') component.size.set(new Vector2(json.size.x, json.size.y))
    if (typeof json.uvOffset === 'object') component.uvOffset.set(new Vector2(json.uvOffset.x, json.uvOffset.y))
    if (typeof json.uvScale === 'object') component.uvScale.set(new Vector2(json.uvScale.x, json.uvScale.y))
    if (typeof json.alphaUVOffset === 'object')
      component.alphaUVOffset.set(new Vector2(json.alphaUVOffset.x, json.alphaUVOffset.y))
    if (typeof json.alphaUVScale === 'object')
      component.alphaUVScale.set(new Vector2(json.alphaUVScale.x, json.alphaUVScale.y))
    if (typeof json.wrapS === 'number') component.wrapS.set(json.wrapS)
    if (typeof json.wrapT === 'number') component.wrapT.set(json.wrapT)
    if (typeof json.useAlpha === 'boolean') component.useAlpha.set(json.useAlpha)
    if (typeof json.useAlphaUVTransform === 'boolean') component.useAlphaUVTransform.set(json.useAlphaUVTransform)
    if (typeof json.alphaThreshold === 'number') component.alphaThreshold.set(json.alphaThreshold)
    if (typeof json.fit === 'string') component.fit.set(json.fit)
    if (typeof json.projection === 'string' && (json.projection === 'Flat' || json.projection === 'Equirectangular360'))
      component.projection.set(json.projection)
  },

  onRemove: (entity, component) => {
    if (VideoComponent.uniqueVideoEntities.includes(entity)) {
      VideoComponent.uniqueVideoEntities.splice(VideoComponent.uniqueVideoEntities.indexOf(entity), 1)
    }
  },

  errors: ['INVALID_MEDIA_UUID', 'MISSING_MEDIA_ELEMENT'],

  uniqueVideoEntities: [] as Entity[],

  reactor: VideoReactor
})

function VideoReactor() {
  const entity = useEntityContext()
  const video = useComponent(entity, VideoComponent)
  const visible = useOptionalComponent(entity, VisibleComponent)
  const mediaUUID = video.mediaUUID.value
  const mediaEntity = UUIDComponent.getEntityByUUID(mediaUUID) || entity
  const mediaElement = useOptionalComponent(mediaEntity, MediaElementComponent)

  const videoMeshEntity = useHookstate(createEntity)
  const mesh = useMeshComponent<PlaneGeometry | SphereGeometry, ShaderMaterial>(
    videoMeshEntity.value,
    PLANE_GEO,
    () =>
      new ShaderMaterial({
        uniforms: {
          map: { value: null },
          alphaMap: { value: null },
          uvOffset: { value: new Vector2(0, 0) },
          uvScale: { value: new Vector2(1, 1) },
          useAlpha: { value: false },
          alphaThreshold: { value: 0.5 },
          useAlphaUVTransform: { value: false },
          alphaUVOffset: { value: new Vector2(0, 0) },
          alphaUVScale: { value: new Vector2(1, 1) },
          wrapS: { value: ClampToEdgeWrapping },
          wrapT: { value: ClampToEdgeWrapping }
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }

      `,
        fragmentShader: `
      #ifdef USE_MAP
        uniform sampler2D map;
      #endif
        uniform bool useAlpha;
        uniform float alphaThreshold;
        uniform vec2 uvOffset;
        uniform vec2 uvScale;
        uniform bool useAlphaUVTransform;
        uniform vec2 alphaUVOffset;
        uniform vec2 alphaUVScale;
        uniform int wrapS;
        uniform int wrapT;

        varying vec2 vUv;

        vec2 applyWrapping(vec2 uv, int wrapS, int wrapT) {
          vec2 wrappedUv = uv;
          // Repeat Wrapping
          if (wrapS == 1000) {
            wrappedUv.x = fract(wrappedUv.x);
          } else if (wrapS == 1002) {
            float mirrored = mod(wrappedUv.x, 2.0);
            if (mirrored > 1.0) mirrored = 2.0 - mirrored;
            wrappedUv.x = mirrored;
          } else {
            wrappedUv.x = clamp(wrappedUv.x, 0.0, 1.0);
          }
          
          if (wrapT == 1000) {
            wrappedUv.y = fract(wrappedUv.y);
          } else if (wrapT == 1002) {
            float mirrored = mod(wrappedUv.y, 2.0);
            if (mirrored > 1.0) mirrored = 2.0 - mirrored;
            wrappedUv.y = mirrored;
          } else {
            wrappedUv.y = clamp(wrappedUv.y, 0.0, 1.0);
          }
          return wrappedUv;
        }



        void main() {
        #ifdef USE_MAP
          vec2 mapUv = applyWrapping(vUv * uvScale + uvOffset, wrapS, wrapT);
          vec4 color = texture2D(map, mapUv);
          color.rgb = pow(color.rgb, vec3(2.2));
          if (useAlpha) {
            if (useAlphaUVTransform) {
                vec2 alphaMapUv = applyWrapping(vUv * alphaUVScale + alphaUVOffset, wrapS, wrapT);
                vec4 alphaColor = texture2D(map, alphaMapUv);
                float intensity = alphaColor.r * 0.3 + alphaColor.g * 0.59 + alphaColor.b * 0.11;
                if (intensity < alphaThreshold) discard;
            } else {
                float intensity = color.r * 0.3 + color.g * 0.59 + color.b * 0.11;
                if (intensity < alphaThreshold) discard;
            }
          }
          gl_FragColor = color;
        #else
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        #endif
        }
      `
      })
  )

  useEffect(() => {
    const videoEntity = videoMeshEntity.value
    video.videoMeshEntity.set(videoEntity)
    mesh.name.set(`video-group-${entity}`)
    mesh.userData['ignoreOnExport'] = true
    setComponent(videoEntity, EntityTreeComponent, { parentEntity: entity })
    setComponent(videoEntity, NameComponent, mesh.name.value)
    return () => {
      removeEntity(videoEntity)
    }
  }, [])

  useEffect(() => {
    setVisibleComponent(videoMeshEntity.value, !!visible)
  }, [visible])

  // update side
  useEffect(() => {
    mesh.material.side.set(video.side.value)
  }, [video.side])

  // update mesh
  useEffect(() => {
    const videoMesh = mesh.value as Mesh<PlaneGeometry | SphereGeometry, ShaderMaterial>
    resizeVideoMesh(videoMesh)
    const scale = ObjectFitFunctions.computeContentFitScale(
      videoMesh.scale.x,
      videoMesh.scale.y,
      video.size.width.value,
      video.size.height.value,
      video.fit.value
    )
    videoMesh.scale.setScalar(scale)
  }, [video.size, video.fit, video.texture])

  useEffect(() => {
    mesh.geometry.set(video.projection.value === 'Flat' ? PLANE_GEO() : SPHERE_GEO())
    mesh.geometry.attributes.position.needsUpdate.set(true)
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.map.value = video.texture.value
    const defines = mesh.material.defines.get(NO_PROXY) as Record<string, any>
    if (video.texture.value) {
      defines.USE_MAP = ''
    } else {
      delete defines.USE_MAP
    }
    mesh.material.needsUpdate.set(true)
  }, [video.texture, video.projection])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.wrapS.value = video.wrapS.value
  }, [video.wrapS])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.wrapT.value = video.wrapT.value
  }, [video.wrapT])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.useAlpha.value = video.useAlpha.value
  }, [video.useAlpha])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.alphaThreshold.value = video.alphaThreshold.value
  }, [video.alphaThreshold])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.uvOffset.value = video.uvOffset.value
  }, [video.uvOffset])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.uvScale.value = video.uvScale.value
  }, [video.uvScale])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.useAlphaUVTransform.value = video.useAlphaUVTransform.value
  }, [video.useAlphaUVTransform])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.alphaUVOffset.value = video.alphaUVOffset.value
  }, [video.alphaUVOffset])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.alphaUVScale.value = video.alphaUVScale.value
  }, [video.alphaUVScale])

  useEffect(() => {
    if (!mediaEntity || !mediaElement) return
    const sourceVideoComponent = getComponent(mediaEntity, VideoComponent)
    const sourceMeshComponent = getOptionalComponent(mediaEntity, MeshComponent)
    const sourceTexture = sourceVideoComponent.texture
    if (video.texture.value) {
      ;(video.texture.value.image as HTMLVideoElement) = mediaElement.element.value as HTMLVideoElement
      clearErrors(entity, VideoComponent)
    } else {
      if (sourceTexture && sourceMeshComponent) {
        mesh.material.set(sourceMeshComponent.material as ShaderMaterial)
        clearErrors(entity, VideoComponent)
      } else {
        video.texture.set(new VideoTexturePriorityQueue(mediaElement.element.value as HTMLVideoElement))
        VideoComponent.uniqueVideoEntities.push(mediaEntity)
        clearErrors(entity, VideoComponent)
        return () => {
          if (VideoComponent.uniqueVideoEntities.includes(entity)) {
            VideoComponent.uniqueVideoEntities.splice(VideoComponent.uniqueVideoEntities.indexOf(entity), 1)
          }
        }
      }
    }
  }, [video.texture, mediaEntity, mediaElement])
  return null
}
