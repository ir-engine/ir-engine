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

import { useEffect } from 'react'
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CompressedTexture,
  DoubleSide,
  FrontSide,
  InterleavedBufferAttribute,
  LinearMipmapLinearFilter,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Side,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TwoPassDoubleSide,
  Vector2
} from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { AssetType } from '@ir-engine/engine/src/assets/constants/AssetType'
import { State } from '@ir-engine/hyperflux'
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
    side: SideSchema(DoubleSide)
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

const scaleMatrix = new Matrix4()
export function resizeImageMesh(mesh: Mesh<any, MeshBasicMaterial>) {
  if (!mesh.material.map) return

  const { width, height } = getTextureSize(mesh.material.map)

  if (!width || !height) return

  const ratio = (height || 1) / (width || 1)
  const _width = Math.min(1.0, 1.0 / ratio)
  const _height = Math.min(1.0, ratio)
  scaleMatrix.makeScale(_width, _height, 1)
  mesh.geometry.applyMatrix4(scaleMatrix)
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
  const [texture, error] = useTexture(image.source.value, entity)
  useEffect(() => {
    setComponent(entity, MeshComponent, new Mesh(PLANE_GEO(), new MeshBasicMaterial()))
    return () => {
      removeComponent(entity, MeshComponent)
    }
  }, [])
  const mesh = useOptionalComponent(entity, MeshComponent) as any as State<
    Mesh<PlaneGeometry | SphereGeometry, MeshBasicMaterial>
  >

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
    if (!texture || !mesh) return

    clearErrors(entity, ImageComponent)

    texture.colorSpace = SRGBColorSpace
    texture.minFilter = LinearMipmapLinearFilter

    mesh.material.map.set(texture)
    mesh.material.needsUpdate.set(true)
    mesh.visible.set(true)
  }, [!!mesh?.value, texture])

  useEffect(() => {
    if (!mesh || !texture || !mesh.material.map.value) return

    const flippedTexture = mesh.material.map.value.flipY
    switch (image.projection.value) {
      case ImageProjection.Equirectangular360:
        mesh.geometry.set(flippedTexture ? SPHERE_GEO() : SPHERE_GEO_FLIPPED())
        mesh.scale.value.set(-1, 1, 1)
        break
      case ImageProjection.Flat:
      default:
        mesh.geometry.set(flippedTexture ? PLANE_GEO() : PLANE_GEO_FLIPPED())
        resizeImageMesh(mesh.value as Mesh<PlaneGeometry, MeshBasicMaterial>)
    }
  }, [!!mesh?.value, image.projection, !!texture])

  useEffect(() => {
    if (!mesh) return
    mesh.material.transparent.set(image.alphaMode.value !== ImageAlphaMode.Opaque)
    mesh.material.alphaTest.set(image.alphaMode.value === 'Mask' ? image.alphaCutoff.value : 0)
    mesh.material.side.set(image.side.value)
  }, [!!mesh?.value, image.alphaMode, image.alphaCutoff, image.side])

  return null
}
