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
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CompressedTexture,
  DoubleSide,
  FrontSide,
  InterleavedBufferAttribute,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Side,
  SphereGeometry,
  Texture,
  TwoPassDoubleSide,
  Uniform,
  Vector2,
  Vector3
} from 'three'

import { Entity, UndefinedEntity, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getSimulationCounterpart,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { AssetType } from '@ir-engine/engine/src/assets/constants/AssetType'
import { NO_PROXY, State, useState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { Vector2_One } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { ContentFitTypeSchema } from '@ir-engine/spatial/src/transform/functions/ObjectFitFunctions'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { ImageAlphaMode, ImageProjection } from '../classes/ImageUtils'
import { addError, clearErrors } from '../functions/ErrorFunctions'

// Making these functions to make it more explicit, otherwise .clone() needs to be called any time these are referenced between components
export const PLANE_GEO = () => new PlaneGeometry(1, 1, 1, 1)
export const SPHERE_GEO = () => new SphereGeometry(1, 64, 32)
export const PLANE_GEO_FLIPPED = () => flipNormals(new PlaneGeometry(1, 1, 1, 1))
export const SPHERE_GEO_FLIPPED = () => flipNormals(new SphereGeometry(1, 64, 32))

export const SideSchema = (init: Side) =>
  S.LiteralUnion([FrontSide, BackSide, DoubleSide, TwoPassDoubleSide], { default: init })

export const ImageComponent = defineComponent({
  name: 'EE_image',
  jsonID: 'EE_image',

  schema: S.Object({
    source: S.String({ default: '' }),
    alphaMode: S.Enum(ImageAlphaMode, { default: ImageAlphaMode.Opaque }),
    alphaCutoff: S.Number({ default: 0.5 }),
    projection: S.Enum(ImageProjection, { default: ImageProjection.Flat }),
    side: SideSchema(DoubleSide),
    fit: ContentFitTypeSchema('stretch'),

    //internal
    uvOffset: T.Vec2(),
    uvScale: T.Vec2(Vector2_One)
  }),

  errors: ['MISSING_TEXTURE_SOURCE', 'UNSUPPORTED_ASSET_CLASS', 'LOADING_ERROR', 'INVALID_URL'],

  reactor: ImageReactor
})

const _size = new Vector2()
export function getTextureSize(texture: Texture | CompressedTexture | null, size: Vector2 = _size) {
  const image = texture?.image as (HTMLImageElement & HTMLCanvasElement & HTMLVideoElement) | undefined
  const width = image?.videoWidth || image?.naturalWidth || image?.width || 0
  const height = image?.videoHeight || image?.naturalHeight || image?.height || 0
  return size.set(width, height)
}

export function getImageAspectRatio(entity: Entity) {
  const simEntity = getSimulationCounterpart(entity)
  if (simEntity === UndefinedEntity) return

  const mesh = getComponent(simEntity, MeshComponent) as Mesh<any, ShaderMaterial>
  if (!mesh || !mesh.material.uniforms.map) return

  const { width, height } = getTextureSize(mesh.material.uniforms.map.value as Texture | CompressedTexture)

  if (!width || !height) return

  const ratio = (width || 1) / (height || 1)
  return ratio
}

export function resizeImage(entity: Entity) {
  const imageRatio = getImageAspectRatio(entity) || 1
  const transformComponent = getMutableComponent(entity, TransformComponent)
  const scale = transformComponent.scale.value
  const newX = scale.y * imageRatio
  const newY = scale.y
  const newZ = 1
  const newScale = new Vector3(newX, newY, newZ)
  transformComponent.scale.set(newScale)
}

function flipNormals<G extends BufferGeometry>(geometry: G) {
  const uvs = (geometry.attributes.uv as BufferAttribute | InterleavedBufferAttribute).array
  for (let i = 1; i < uvs.length; i += 2) {
    // @ts-ignore
    uvs[i] = 1 - uvs[i]
  }
  return geometry
}

export function ImageReactor() {
  const entity = useEntityContext()
  const image = useComponent(entity, ImageComponent)
  const transformComponent = useComponent(entity, TransformComponent)
  const mesh = useOptionalComponent(entity, MeshComponent) as any as State<
    Mesh<PlaneGeometry | SphereGeometry, ShaderMaterial>
  >

  const [texture, error] = useTexture(image.source.value, entity)
  const fitPlacementUvOffset = useState(new Vector2(0, 0))
  const fitPlacementUvScale = useState(new Vector2(1, 1))

  useEffect(() => {
    setComponent(
      entity,
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
            alphaUVOffset: { value: new Vector2(0, 0) }
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
    
            varying vec2 vUv;
    
            void main() {
            #ifdef USE_MAP
              vec2 adjustedUv = vUv * uvScale + uvOffset;
              vec2 mapUv = adjustedUv;
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

    return () => {
      removeComponent(entity, MeshComponent)
    }
  }, [])

  useEffect(() => {
    if (!error) return
    addError(entity, ImageComponent, `LOADING_ERROR`, error.message)
  }, [error])

  useEffect(() => {
    // if (!image.source.value) { /** @todo Just validate that the source is a valid url. Being undefined is not an error*/
    //   addError(entity, ImageComponent, `MISSING_TEXTURE_SOURCE`)
    //   return
    // }

    if (image.source.value) {
      const assetType = AssetLoader.getAssetClass(image.source.value)
      if (assetType !== AssetType.Image) {
        addError(entity, ImageComponent, `UNSUPPORTED_ASSET_CLASS`)
      }
    }
  }, [image.source.value]) // runs on any image change rn

  useEffect(() => {
    if (!mesh) return

    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    const defines = mesh.material.defines.get(NO_PROXY) as Record<string, any>

    clearErrors(entity, ImageComponent)

    if (image.source.value && texture) {
      defines.USE_MAP = ''
      uniforms.map.value = texture
    } else {
      delete defines.USE_MAP
      uniforms.map.value = null
    }
    mesh.material.needsUpdate.set(true)
    mesh.visible.set(true)
  }, [!!mesh?.value, texture, image.source])

  useEffect(() => {
    if (!mesh || !texture || !mesh.material.uniforms.map.value) return

    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    const flippedTexture = uniforms.map.value.flipY
    switch (image.projection.value) {
      case ImageProjection.Equirectangular360:
        mesh.geometry.set(flippedTexture ? SPHERE_GEO() : SPHERE_GEO_FLIPPED())
        mesh.scale.value.set(-1, 1, 1)
        break
      case ImageProjection.Flat:
      default:
        mesh.geometry.set(flippedTexture ? PLANE_GEO() : PLANE_GEO_FLIPPED())
    }
  }, [!!mesh?.value, image.projection, !!texture])

  useEffect(() => {
    if (!mesh) return
    mesh.material.transparent.set(image.alphaMode.value !== ImageAlphaMode.Opaque)
    mesh.material.alphaTest.set(image.alphaMode.value === 'Mask' ? image.alphaCutoff.value : 0)
    mesh.material.side.set(image.side.value)
  }, [!!mesh?.value, image.alphaMode, image.alphaCutoff, image.side])

  useEffect(() => {
    if (!mesh) return

    const videoMesh = mesh.value as Mesh<PlaneGeometry | SphereGeometry, ShaderMaterial>

    const uvOffset = new Vector2(0, 0)
    const uvScale = new Vector2(1, 1)
    let imageSize = new Vector2(1, 1)

    const [containerWidth, containerHeight] = [transformComponent.value.scale.x, transformComponent.value.scale.y]
    const containerRatio = containerWidth / containerHeight

    if (texture) {
      imageSize = getTextureSize(videoMesh.material.uniforms.map.value as Texture | CompressedTexture)
      if (image.fit.value !== 'stretch') {
        const imageRatio = imageSize.x / imageSize.y || 1

        let isPlacementHorz = true
        if (image.fit.value == 'horizontal') {
          isPlacementHorz = true
        }
        if (image.fit.value == 'vertical') {
          isPlacementHorz = false
        }

        if (image.fit.value == 'contain') {
          if (imageRatio > containerRatio) {
            isPlacementHorz = true
          } else {
            isPlacementHorz = false
          }
        }
        if (image.fit.value == 'cover') {
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

    fitPlacementUvOffset.set(uvOffset)
    fitPlacementUvScale.set(uvScale)
  }, [!!mesh, transformComponent.scale, image.fit, texture])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.uvOffset.value = new Vector2(
      image.uvOffset.x.value + fitPlacementUvOffset.x.value,
      image.uvOffset.y.value + fitPlacementUvOffset.y.value
    )
  }, [!!mesh, image.uvOffset, fitPlacementUvOffset])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms.get(NO_PROXY) as Record<string, Uniform>
    uniforms.uvScale.value = new Vector2(
      image.uvScale.x.value * fitPlacementUvScale.x.value,
      image.uvScale.y.value * fitPlacementUvScale.y.value
    )
  }, [!!mesh, image.uvScale, fitPlacementUvScale])

  return null
}
