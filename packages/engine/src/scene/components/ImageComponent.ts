import { useEffect } from 'react'
import {
  BufferGeometry,
  CompressedTexture,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SphereGeometry,
  Vector2
} from 'three'
import { LinearMipmapLinearFilter, sRGBEncoding, Texture } from 'three'

import { useHookstate } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AssetClass } from '../../assets/enum/AssetClass'
import {
  defineComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { ImageAlphaMode, ImageAlphaModeType, ImageProjection, ImageProjectionType } from '../classes/ImageUtils'
import { addObjectToGroup, removeObjectFromGroup } from '../components/GroupComponent'
import { addError, clearErrors } from '../functions/ErrorFunctions'

export const PLANE_GEO = new PlaneGeometry(1, 1, 1, 1)
export const SPHERE_GEO = new SphereGeometry(1, 64, 32)
export const PLANE_GEO_FLIPPED = flipNormals(new PlaneGeometry(1, 1, 1, 1))
export const SPHERE_GEO_FLIPPED = flipNormals(new SphereGeometry(1, 64, 32))

export const ImageComponent = defineComponent({
  name: 'XRE_image',

  onInit: (entity) => {
    return {
      source: '',
      alphaMode: ImageAlphaMode.Opaque as ImageAlphaModeType,
      alphaCutoff: 0.5,
      projection: ImageProjection.Flat as ImageProjectionType,
      side: DoubleSide,
      // runtime props
      mesh: new Mesh(PLANE_GEO as PlaneGeometry | SphereGeometry, new MeshBasicMaterial())
    }
  },

  toJSON: (entity, component) => {
    return {
      source: component.source.value,
      alphaMode: component.alphaMode.value,
      alphaCutoff: component.alphaCutoff.value,
      projection: component.projection.value,
      side: component.side.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    // backwards compatability
    if (typeof json['imageSource'] === 'string' && json['imageSource'] !== component.source.value)
      component.source.set(json['imageSource'])
    //
    if (typeof json.source === 'string' && json.source !== component.source.value) component.source.set(json.source)
    if (typeof json.alphaMode === 'string' && json.alphaMode !== component.alphaMode.value)
      component.alphaMode.set(json.alphaMode)
    if (typeof json.alphaCutoff === 'number' && json.alphaCutoff !== component.alphaCutoff.value)
      component.alphaCutoff.set(json.alphaCutoff)
    if (typeof json.projection === 'string' && json.projection !== component.projection.value)
      component.projection.set(json.projection)
    if (typeof json.side === 'number' && json.side !== component.side.value) component.side.set(json.side)
  },

  onRemove: (entity, component) => {
    component.mesh.material.map.value?.dispose()
    component.mesh.value.removeFromParent()
  },

  errors: ['MISSING_TEXTURE_SOURCE', 'UNSUPPORTED_ASSET_CLASS', 'LOADING_ERROR'],

  reactor: ImageReactor
})

const _size = new Vector2()
export function getTextureSize(texture: Texture | CompressedTexture | null, size: Vector2 = _size) {
  const image = texture?.image as (HTMLImageElement & HTMLCanvasElement & HTMLVideoElement) | undefined
  const width = image?.videoWidth || image?.naturalWidth || image?.width || 0
  const height = image?.videoHeight || image?.naturalHeight || image?.height || 0
  return size.set(width, height)
}

export function resizeImageMesh(mesh: Mesh<any, MeshBasicMaterial>) {
  if (!mesh.material.map) return

  const { width, height } = getTextureSize(mesh.material.map)

  if (!width || !height) return

  const ratio = (height || 1) / (width || 1)
  const _width = Math.min(1.0, 1.0 / ratio)
  const _height = Math.min(1.0, ratio)
  mesh.scale.set(_width, _height, 1)
}

function flipNormals<G extends BufferGeometry>(geometry: G) {
  const uvs = geometry.attributes.uv.array
  for (let i = 1; i < uvs.length; i += 2) {
    // @ts-ignore
    uvs[i] = 1 - uvs[i]
  }
  return geometry
}

export const SCENE_COMPONENT_IMAGE = 'image'

export function ImageReactor({ root }: EntityReactorProps) {
  const entity = root.entity
  if (!hasComponent(entity, ImageComponent)) throw root.stop()

  const image = useComponent(entity, ImageComponent)
  const texture = useHookstate(null as Texture | null)

  useEffect(
    function updateTextureSource() {
      const source = image.source.value

      if (!source) {
        return addError(entity, ImageComponent, `MISSING_TEXTURE_SOURCE`)
      }

      const assetType = AssetLoader.getAssetClass(source)
      if (assetType !== AssetClass.Image) {
        return addError(entity, ImageComponent, `UNSUPPORTED_ASSET_CLASS`)
      }

      AssetLoader.loadAsync(source)
        .then((_texture) => {
          texture.set(_texture)
        })
        .catch((e) => {
          addError(entity, ImageComponent, `LOADING_ERROR`, e.message)
        })

      return () => {
        // TODO: abort load request, pending https://github.com/mrdoob/three.js/pull/23070
      }
    },
    [image.source]
  )

  useEffect(
    function updateTexture() {
      if (!image) return
      if (!texture.value) return

      clearErrors(entity, ImageComponent)

      texture.value.encoding = sRGBEncoding
      texture.value.minFilter = LinearMipmapLinearFilter

      image.mesh.material.map.ornull?.value.dispose()
      image.mesh.material.map.set(texture.value)
      image.mesh.visible.set(true)
      image.mesh.material.value.needsUpdate = true

      // upload to GPU immediately
      EngineRenderer.instance.renderer.initTexture(texture.value)

      const imageMesh = image.mesh.value
      addObjectToGroup(entity, imageMesh)

      return () => {
        removeObjectFromGroup(entity, imageMesh)
      }
    },
    [texture]
  )

  useEffect(
    function updateGeometry() {
      if (!image.mesh.material.map.value) return

      const flippedTexture = image.mesh.material.map.value.flipY
      switch (image.projection.value) {
        case ImageProjection.Equirectangular360:
          image.mesh.value.geometry = flippedTexture ? SPHERE_GEO : SPHERE_GEO_FLIPPED
          image.mesh.scale.value.set(-1, 1, 1)
          break
        case ImageProjection.Flat:
        default:
          image.mesh.value.geometry = flippedTexture ? PLANE_GEO : PLANE_GEO_FLIPPED
          resizeImageMesh(image.mesh.value)
      }
    },
    [image.mesh.material.map, image.projection]
  )

  useEffect(
    function updateMaterial() {
      const material = image.mesh.material.value
      material.transparent = image.alphaMode.value === ImageAlphaMode.Blend
      material.alphaTest = image.alphaMode.value === 'Mask' ? image.alphaCutoff.value : 0
      material.side = image.side.value
      material.needsUpdate = true
    },
    [image.alphaMode, image.alphaCutoff, image.side]
  )

  return null
}
