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

import { useEffect } from 'react'
import {
  ClampToEdgeWrapping,
  CompressedTexture,
  DoubleSide,
  LinearFilter,
  Mesh,
  MirroredRepeatWrapping,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  Uniform,
  Vector2,
  VideoTexture
} from 'three'

import { createEntity, EntityTreeComponent, removeEntity, useEntityContext, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent,
  useHasComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityID } from '@ir-engine/ecs/src/Entity'
import { defineState, NO_PROXY, State, useHookstate, useState } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { createPriorityQueue } from '@ir-engine/spatial/src/common/functions/PriorityQueue'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ContentFitTypeSchema } from '@ir-engine/spatial/src/transform/functions/ObjectFitFunctions'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { TransformComponent } from '@ir-engine/spatial'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { Vector2_One } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { HighlightComponent } from '@ir-engine/spatial/src/renderer/components/HighlightComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { clearErrors } from '../functions/ErrorFunctions'
import { getTextureSize, PLANE_GEO, SideSchema, SPHERE_GEO } from './ImageComponent'
import { MediaComponent, MediaElementComponent } from './MediaComponent'

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

const WrappingSchema = S.LiteralUnion([RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping], {
  default: ClampToEdgeWrapping
})

const ProjectionSchema = S.LiteralUnion(['Flat', 'Equirectangular360'], { default: 'Flat' })

export const VideoComponent = defineComponent({
  name: 'EE_video',
  jsonID: 'EE_video',

  schema: S.Object({
    side: SideSchema(DoubleSide),
    uvOffset: T.Vec2(),
    uvScale: T.Vec2(Vector2_One),
    alphaUVOffset: T.Vec2(),
    wrapS: WrappingSchema,
    wrapT: WrappingSchema,
    useAlpha: S.Bool({ default: false }),
    useAlphaInvert: S.Bool({ default: false }),
    alphaThreshold: S.Number({ default: 0.5 }),
    fit: ContentFitTypeSchema('stretch'),
    projection: ProjectionSchema,
    mediaUUID: S.EntityID(),

    // internal
    videoMeshEntity: S.Entity({ serialized: false }),
    currentVideoSize: T.Vec2(Vector2_One, { serialized: false }),
    texture: S.Type<VideoTexturePriorityQueue | null>({ serialized: false })
  }),

  onRemove: (entity, component) => {
    if (VideoComponent.uniqueVideoEntities.includes(entity)) {
      VideoComponent.uniqueVideoEntities.splice(VideoComponent.uniqueVideoEntities.indexOf(entity), 1)
    }

    removeComponent(entity, MediaComponent)
  },

  errors: ['INVALID_MEDIA_UUID', 'MISSING_MEDIA_ELEMENT'],

  uniqueVideoEntities: [] as Entity[],

  reactor: VideoReactor
})

function VideoReactor() {
  const entity = useEntityContext()
  const video = useComponent(entity, VideoComponent)
  const visible = useHasComponent(entity, VisibleComponent)
  const mediaUUID = video.mediaUUID.value

  const mediaComponentEntity = mediaUUID ? UUIDComponent.useEntityFromSameSourceByID(entity, mediaUUID) : entity
  const mediaComponent = useOptionalComponent(mediaComponentEntity, MediaComponent)
  const hasMediaElementComponent = useHasComponent(mediaComponentEntity, MediaElementComponent)
  const localTextureRef = useHookstate<VideoTexturePriorityQueue | null>(null)
  const sourceVideoComponent = useOptionalComponent(mediaComponentEntity, VideoComponent)
  const transformComponent = useComponent(entity, TransformComponent)

  const highlightComponent = useOptionalComponent(entity, HighlightComponent)

  const videoMeshEntity = useHookstate(() => {
    const videoMeshEntity = createEntity()
    setComponent(
      videoMeshEntity,
      MeshComponent,
      new Mesh(
        PLANE_GEO(),
        new ShaderMaterial({
          uniforms: {
            map: { value: null },
            alphaMap: { value: null },
            uvOffset: { value: new Vector2(0, 0) },
            uvScale: { value: new Vector2(1, 1) },
            useAlpha: { value: false },
            alphaThreshold: { value: 0.5 },
            useAlphaInvert: { value: false },
            alphaUVOffset: { value: new Vector2(0, 0) },
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
        uniform bool useAlphaInvert;
        uniform float alphaThreshold;
        uniform vec2 uvOffset;
        uniform vec2 uvScale;
        uniform vec2 alphaUVOffset;
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
          vec2 adjustedUv = vUv * uvScale + uvOffset;
          vec2 mapUv = applyWrapping(adjustedUv, wrapS, wrapT);
          vec4 color = texture2D(map, mapUv);
          color.rgb = pow(color.rgb, vec3(2.2));
          if (useAlpha) {
            float intensity = 0.0;
            intensity = color.r * 0.333  + color.g * 0.333 + color.b * 0.333;
            if (useAlphaInvert) {
              intensity = 1.0 - intensity;
            }
            if (intensity < alphaThreshold) discard;
          }
          if( adjustedUv.y < 0.0 || adjustedUv.y > 1.0 || adjustedUv.x < 0.0 || adjustedUv.x > 1.0) {
              discard;
          }
          gl_FragColor = color;
        #else
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        #endif
        }
      `
        })
      )
    )
    return videoMeshEntity
  }).value

  useEffect(() => {
    return () => {
      removeComponent(videoMeshEntity, MeshComponent)
    }
  }, [])

  const fitPlacementUvOffset = useState(new Vector2(0, 0))
  const fitPlacementUvScale = useState(new Vector2(1, 1))

  const mesh = useComponent(videoMeshEntity, MeshComponent) as any as State<
    Mesh<PlaneGeometry | SphereGeometry, ShaderMaterial>
  >

  useEffect(() => {
    const videoEntity = videoMeshEntity
    video.videoMeshEntity.set(videoEntity)
    setComponent(videoEntity, EntityTreeComponent, { parentEntity: entity })
    setComponent(videoEntity, NameComponent, `video-group-${entity}`)
    setComponent(videoEntity, MediaComponent)
    setComponent(videoEntity, UUIDComponent, {
      entitySourceID: UUIDComponent.getAsSourceID(entity),
      entityID: 'video-mesh' as EntityID
    })

    setCallback(entity, 'setVisible', () => setComponent(videoEntity, VisibleComponent))
    setCallback(entity, 'setInvisible', () => removeComponent(videoEntity, VisibleComponent))

    video.mediaUUID.set('' as EntityID)

    return () => {
      removeEntity(videoEntity)
    }
  }, [])

  useEffect(() => {
    if (!mesh || !highlightComponent) return
    setComponent(videoMeshEntity, HighlightComponent)
    return () => {
      removeComponent(videoMeshEntity, HighlightComponent)
    }
  }, [!!mesh, highlightComponent])

  useEffect(() => {
    setVisibleComponent(videoMeshEntity, !!visible)
  }, [visible])

  // update side
  useEffect(() => {
    mesh.material.side.set(video.side.value)
  }, [!!mesh, video.side])

  // update mesh
  useEffect(() => {
    const videoMesh = mesh.value as Mesh<PlaneGeometry | SphereGeometry, ShaderMaterial>

    const uvOffset = new Vector2(0, 0)
    const uvScale = new Vector2(1, 1)
    let imageSize = new Vector2(1, 1)

    const [containerWidth, containerHeight] = [transformComponent.value.scale.x, transformComponent.value.scale.y]
    const containerRatio = containerWidth / containerHeight

    if (mediaComponent && mediaComponent.isCurrentTrackLoaded.value) {
      imageSize = getTextureSize(videoMesh.material.uniforms.map.value as Texture | CompressedTexture)
      if (video.fit.value !== 'stretch') {
        const imageRatio = imageSize.x / imageSize.y || 1

        let isPlacementHorz = true
        if (video.fit.value == 'horizontal') {
          isPlacementHorz = true
        }
        if (video.fit.value == 'vertical') {
          isPlacementHorz = false
        }

        if (video.fit.value == 'contain') {
          if (imageRatio > containerRatio) {
            isPlacementHorz = true
          } else {
            isPlacementHorz = false
          }
        }
        if (video.fit.value == 'cover') {
          if (imageRatio > containerRatio) {
            isPlacementHorz = false
          } else {
            isPlacementHorz = true
          }
        }

        if (isPlacementHorz) {
          uvScale.y = imageRatio / containerRatio
          uvScale.x = 1
          uvOffset.y = (1 - uvScale.y) / 2
        } else {
          uvScale.x = 1 / imageRatio / (1 / containerRatio)
          uvScale.y = 1
          uvOffset.x = (1 - uvScale.x) / 2
        }
      }
    }

    video.currentVideoSize.set(imageSize)
    fitPlacementUvOffset.set(uvOffset)
    fitPlacementUvScale.set(uvScale)
  }, [!!mesh, transformComponent.scale, video.fit, video.texture, mesh?.material, mediaComponent?.isCurrentTrackLoaded])

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
  }, [!!mesh, video.texture, video.projection])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.wrapS.value = video.wrapS.value
  }, [!!mesh, video.wrapS])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.wrapT.value = video.wrapT.value
  }, [!!mesh, video.wrapT])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.useAlpha.value = video.useAlpha.value
  }, [!!mesh, video.useAlpha])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.useAlphaInvert.value = video.useAlphaInvert.value
  }, [video.useAlphaInvert])

  useEffect(() => {
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.alphaThreshold.value = video.alphaThreshold.value
  }, [!!mesh, video.alphaThreshold])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.uvOffset.value = new Vector2(
      video.uvOffset.x.value + fitPlacementUvOffset.x.value,
      video.uvOffset.y.value + fitPlacementUvOffset.y.value
    )
  }, [!!mesh, video.uvOffset, fitPlacementUvOffset])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.uvScale.value = new Vector2(
      video.uvScale.x.value * fitPlacementUvScale.x.value,
      video.uvScale.y.value * fitPlacementUvScale.y.value
    )
  }, [!!mesh, video.uvScale, fitPlacementUvScale])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.alphaUVOffset.value = video.alphaUVOffset.value
  }, [!!mesh, video.alphaUVOffset])

  useEffect(() => {
    if (entity !== mediaComponentEntity && sourceVideoComponent) {
      if (video.texture.get(NO_PROXY) !== sourceVideoComponent.get(NO_PROXY).texture) {
        video.texture.set(sourceVideoComponent.get(NO_PROXY).texture)
      }
    } else {
      if (video.texture.get(NO_PROXY) !== localTextureRef.get(NO_PROXY)) {
        //force the html media element to update it's image that is used for the texture, by setting the current time
        const media = getComponent(mediaComponentEntity, MediaComponent)
        const mediaElement = getOptionalComponent(mediaComponentEntity, MediaElementComponent)
        if (mediaElement) {
          mediaElement.element.currentTime = media.currentTrackTime
        }
        video.texture.set(localTextureRef.get(NO_PROXY))
      }
    }
    clearErrors(entity, VideoComponent)
  }, [sourceVideoComponent?.texture])

  useEffect(() => {
    if (!mesh || !mediaComponentEntity) return

    if (!hasMediaElementComponent) {
      if (video.texture.value !== null) {
        localTextureRef.set(null)
        video.texture.set(null)
        mediaComponent?.paused.set(true)
      }
      return
    }
    if (entity !== mediaComponentEntity) {
      return
    }

    const sourceMeshComponent = getOptionalComponent(mediaComponentEntity, MeshComponent)
    const mediaElement = getComponent(mediaComponentEntity, MediaElementComponent)
    const sourceTexture = sourceVideoComponent?.texture

    if (video.texture.value) {
      const videoEl = mediaElement.element as HTMLVideoElement

      const resetMuted = () => {
        videoEl.muted = false
        document.removeEventListener('pointerdown', resetMuted)
      }

      if (videoEl.paused) {
        videoEl.pause()
      } else {
        videoEl.play().catch((error) => {
          if (error.name === 'NotAllowedError') {
            videoEl.muted = true
            videoEl.play()

            document.addEventListener('pointerdown', resetMuted)
          } else {
            console.error(error)
          }
        })
      }

      //needed to set up the self-referencing source video texture
      ;(video.texture.value.image as HTMLVideoElement) = videoEl
      clearErrors(entity, VideoComponent)
    } else {
      if (sourceTexture && sourceMeshComponent) {
        mesh.material.set(sourceMeshComponent.material as ShaderMaterial)
        clearErrors(entity, VideoComponent)
      } else {
        const textrue = new VideoTexturePriorityQueue(mediaElement.element as HTMLVideoElement)
        localTextureRef.set(textrue)
        video.texture.set(textrue)
        VideoComponent.uniqueVideoEntities.push(mediaComponentEntity)
        clearErrors(entity, VideoComponent)
        return () => {
          if (VideoComponent.uniqueVideoEntities.includes(entity)) {
            VideoComponent.uniqueVideoEntities.splice(VideoComponent.uniqueVideoEntities.indexOf(entity), 1)
          }
        }
      }
    }
  }, [!!mesh, video.texture, video.mediaUUID, mediaComponentEntity, hasMediaElementComponent])

  return null
}
