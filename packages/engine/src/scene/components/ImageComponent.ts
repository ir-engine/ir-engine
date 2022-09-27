import { subscribable } from '@hookstate/subscribable'
import {
  BufferGeometry,
  CompressedTexture,
  DoubleSide,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SphereGeometry,
  sRGBEncoding,
  Texture
} from 'three'

import { hookstate, StateMethodsDestroy } from '@xrengine/hyperflux/functions/StateFunctions'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AssetClass } from '../../assets/enum/AssetClass'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { entityExists } from '../../ecs/functions/EntityFunctions'
import { ImageAlphaMode, ImageAlphaModeType, ImageProjection, ImageProjectionType } from '../classes/ImageUtils'
import { addError, removeError } from '../functions/ErrorFunctions'

export const PLANE_GEO = new PlaneGeometry(1, 1, 1, 1)
export const SPHERE_GEO = new SphereGeometry(1, 64, 32)
export const PLANE_GEO_FLIPPED = flipNormals(new PlaneGeometry(1, 1, 1, 1))
export const SPHERE_GEO_FLIPPED = flipNormals(new SphereGeometry(1, 64, 32))

export const ImageComponent = defineComponent({
  name: 'XRE_image',

  onAdd: (entity) => {
    const state = hookstate(
      {
        source: '',
        alphaMode: ImageAlphaMode.Opaque as ImageAlphaModeType,
        alphaCutoff: 0.5,
        projection: ImageProjection.Flat as ImageProjectionType,
        side: DoubleSide,
        // runtime props
        mesh: new Mesh(PLANE_GEO as PlaneGeometry | SphereGeometry, new MeshBasicMaterial())
      },
      subscribable()
    )

    state.mesh.value.visible = false

    const updateTexture = async () => {
      try {
        const source = state.source.value
        if (!source) {
          addError(entity, 'imageError', `Image source is missing`)
          return
        }

        const assetType = AssetLoader.getAssetClass(source)
        if (assetType !== AssetClass.Image) {
          addError(entity, 'imageError', `Image format ${source.split('.').pop()} not supported`)
          return
        }
        const texture = (await AssetLoader.loadAsync(source)) as Texture
        if (entityExists(entity) && source === state.source.value) {
          texture.encoding = sRGBEncoding
          texture.minFilter = LinearMipmapLinearFilter
          state.mesh.material.map.ornull?.value.dispose()
          state.mesh.material.map.set(texture)
          state.mesh.visible.set(true)
          state.mesh.material.value.needsUpdate = true
          removeError(entity, 'imageError')
        }
      } catch (error) {
        addError(entity, 'imageError', 'Error Loading image')
        return
      }
    }

    const updateGeometry = () => {
      if (state.mesh.material.map.value) {
        const flippedTexture = state.mesh.material.map.value.flipY
        switch (state.projection.value) {
          case ImageProjection.Equirectangular360:
            state.mesh.geometry.set(flippedTexture ? SPHERE_GEO : SPHERE_GEO_FLIPPED)
            state.mesh.scale.value.set(-1, 1, 1)
            break
          case ImageProjection.Flat:
          default:
            state.mesh.geometry.set(flippedTexture ? PLANE_GEO : PLANE_GEO_FLIPPED)
            resizeImageMesh(state.mesh.value)
        }
      }
    }

    const updateMaterial = () => {
      state.mesh.material.transparent.set(state.alphaMode.value === ImageAlphaMode.Blend)
      state.mesh.material.alphaTest.set(state.alphaMode.value === 'Mask' ? state.alphaCutoff.value : 0)
      state.mesh.material.side.set(state.side.value)
      state.mesh.material.value.needsUpdate = true
    }

    // bind state data to mesh
    state.source.subscribe(updateTexture)
    state.mesh.material.map.subscribe(updateGeometry)
    state.projection.subscribe(updateGeometry)
    state.alphaMode.subscribe(updateMaterial)
    state.alphaMode.subscribe(updateMaterial)
    state.side.subscribe(updateMaterial)

    // remove the following once subscribers detect merged state https://github.com/avkonst/hookstate/issues/338
    updateTexture()
    updateMaterial()
    updateGeometry()

    return state as typeof state & StateMethodsDestroy // TODO: StateMethodsDestroy temporary until hookstate fixes typings
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
    component.destroy()
  }
})

export function resizeImageMesh(mesh: Mesh<any, MeshBasicMaterial>) {
  if (!mesh.material.map) return

  const map = mesh.material.map as Texture | CompressedTexture | undefined
  const image = map?.image as (HTMLImageElement & HTMLCanvasElement & HTMLVideoElement) | undefined
  const width = image?.videoWidth || image?.naturalWidth || image?.width
  const height = image?.videoHeight || image?.naturalHeight || image?.height

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
