import { Group, LinearFilter, LinearMipmapLinearFilter, Mesh, sRGBEncoding, Texture } from 'three'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { AssetClass } from '../../../assets/enum/AssetClass'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { entityExists } from '../../../ecs/functions/EntityFunctions'
import { ImageAlphaMode, ImageProjection } from '../../classes/ImageUtils'
import {
  ImageComponent,
  ImageComponentType,
  PLANE_GEO,
  PLANE_GEO_FLIPPED,
  SPHERE_GEO,
  SPHERE_GEO_FLIPPED
} from '../../components/ImageComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { addError, removeError } from '../ErrorFunctions'

export const deserializeImage: ComponentDeserializeFunction = (entity: Entity, data: ImageComponentType) => {
  const image = Object.assign(ImageComponent.init(), data)
  if (data['imageSource']) image.source = data['imageSource'] // backwards-compat
  addComponent(entity, ImageComponent, image)
}

export const updateImage: ComponentUpdateFunction = async (entity: Entity) => {
  const image = getComponent(entity, ImageComponent)
  const mesh = image.mesh

  if (!hasComponent(entity, Object3DComponent)) {
    addComponent(entity, Object3DComponent, { value: new Group() })
  }

  const group = getComponent(entity, Object3DComponent).value
  if (mesh.parent !== group) group.add(mesh)

  if (image.source !== image.currentSource) {
    try {
      const assetType = AssetLoader.getAssetClass(image.source)
      if (assetType !== AssetClass.Image) {
        addError(entity, 'imageError', `Image format ${image.source.split('.').pop()} not supported`)
        return
      }

      image.currentSource = image.source
      const texture = (await AssetLoader.loadAsync(image.source)) as Texture

      if (entityExists(entity) && image.source === image.currentSource) {
        if (mesh.material.map) mesh.material.map?.dispose()
        mesh.material.map = texture
        texture.encoding = sRGBEncoding
        texture.minFilter = LinearMipmapLinearFilter
        updateImage(entity)
        removeError(entity, 'imageError')
      }
    } catch (error) {
      addError(entity, 'imageError', 'Error Loading image')
      return
    }
  }

  if (mesh.material.map) {
    const flippedTexture = mesh.material.map.flipY
    switch (image.projection) {
      case ImageProjection.Equirectangular360:
        mesh.geometry = flippedTexture ? SPHERE_GEO : SPHERE_GEO_FLIPPED
        mesh.scale.set(-1, 1, 1)
        break
      case ImageProjection.Flat:
      default:
        mesh.geometry = flippedTexture ? PLANE_GEO : PLANE_GEO_FLIPPED
        resizeImageMesh(mesh)
    }
  }

  mesh.material.transparent = image.alphaMode === ImageAlphaMode.Blend
  mesh.material.alphaTest = image.alphaMode === 'Mask' ? image.alphaCutoff : 0
  mesh.material.side = image.side
  mesh.material.needsUpdate = true
}

export const serializeImage: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ImageComponent) as ImageComponentType
  if (!component) return

  return {
    source: component.source,
    alphaCutoff: component.alphaCutoff,
    alphaMode: component.alphaMode,
    projection: component.projection,
    side: component.side
  }
}

export const prepareImageForGLTFExport: ComponentPrepareForGLTFExportFunction = (image) => {
  if (image.userData.mesh) {
    if (image.userData.mesh.parent) image.userData.mesh.removeFromParent()
    delete image.userData.mesh
  }
}

export const resizeImageMesh = (mesh: Mesh<any, any>) => {
  if (!mesh.material.map) return

  const width = mesh.material.map.width ?? mesh.material.map.image.width
  const height = mesh.material.map.height ?? mesh.material.map.image.height

  const ratio = (height || 1) / (width || 1)
  const _width = Math.min(1.0, 1.0 / ratio)
  const _height = Math.min(1.0, ratio)
  mesh.scale.set(_width, _height, 1)
}
