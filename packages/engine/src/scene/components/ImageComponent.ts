import {
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Side,
  SphereBufferGeometry
} from 'three'

import { defineMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ImageAlphaMode, ImageAlphaModeType, ImageProjection, ImageProjectionType } from '../classes/ImageUtils'

export type ImageComponentType = {
  mesh: Mesh<BufferGeometry, MeshBasicMaterial>
  currentSource: string
  source: string
  alphaMode: ImageAlphaModeType
  alphaCutoff: number
  projection: ImageProjectionType
  side: Side
}

function flipNormals(geometry: BufferGeometry) {
  const uvs = geometry.attributes.uv.array
  for (let i = 1; i < uvs.length; i += 2) {
    // @ts-ignore
    uvs[i] = 1 - uvs[i]
  }
  return geometry
}

export const PLANE_GEO = new PlaneBufferGeometry(1, 1, 1, 1)
export const SPHERE_GEO = new SphereBufferGeometry(1, 64, 32)
export const PLANE_GEO_FLIPPED = flipNormals(new PlaneBufferGeometry(1, 1, 1, 1))
export const SPHERE_GEO_FLIPPED = flipNormals(new SphereBufferGeometry(1, 64, 32))

export const ImageComponent = defineMappedComponent('XRE_image')
  .withData(() => {
    return {
      ...SCENE_COMPONENT_IMAGE_DEFAULT_VALUES,
      mesh: new Mesh(PLANE_GEO, new MeshBasicMaterial()),
      currentSource: ''
    } as ImageComponentType
  })
  .build()

export const SCENE_COMPONENT_IMAGE = 'image'
export const SCENE_COMPONENT_IMAGE_DEFAULT_VALUES = {
  source: '',
  alphaMode: ImageAlphaMode.Opaque,
  alphaCutoff: 0.5,
  projection: ImageProjection.Flat,
  side: DoubleSide
}
