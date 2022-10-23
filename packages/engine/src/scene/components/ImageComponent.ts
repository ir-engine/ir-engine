import {
  BufferGeometry,
  CompressedTexture,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SphereGeometry,
  Texture,
  Vector2
} from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { ImageAlphaMode, ImageAlphaModeType, ImageProjection, ImageProjectionType } from '../classes/ImageUtils'

export const PLANE_GEO = new PlaneGeometry(1, 1, 1, 1)
export const SPHERE_GEO = new SphereGeometry(1, 64, 32)
export const PLANE_GEO_FLIPPED = flipNormals(new PlaneGeometry(1, 1, 1, 1))
export const SPHERE_GEO_FLIPPED = flipNormals(new SphereGeometry(1, 64, 32))

export const ImageComponent = defineComponent({
  name: 'XRE_image',

  onAdd: (entity) => {
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

  onUpdate: (entity, component, json) => {
    if (!json) return
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
  }
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
