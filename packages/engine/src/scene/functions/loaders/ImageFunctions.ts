import { LinearFilter, Mesh, MeshBasicMaterial, PlaneBufferGeometry, SphereBufferGeometry, sRGBEncoding } from 'three'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { AssetClass } from '../../../assets/enum/AssetClass'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { ImageAlphaMode, ImageProjection } from '../../classes/ImageUtils'
import {
  ImageComponent,
  ImageComponentType,
  SCENE_COMPONENT_IMAGE_DEFAULT_VALUES
} from '../../components/ImageComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { addError, removeError } from '../ErrorFunctions'

export const deserializeImage: ComponentDeserializeFunction = (entity: Entity, data: ImageComponentType) => {
  const props = parseImageProperties(data)
  addComponent(entity, ImageComponent, props)
}

export const updateImage: ComponentUpdateFunction = async (entity: Entity) => {
  console.log('updateImage', entity)
  const imageComponent = getComponent(entity, ImageComponent)

  if (!hasComponent(entity, Object3DComponent)) {
    const mesh = new Mesh(new PlaneBufferGeometry(), new MeshBasicMaterial())
    addComponent(entity, Object3DComponent, { value: mesh })
  }

  const mesh = getComponent(entity, Object3DComponent).value as Mesh<
    PlaneBufferGeometry | SphereBufferGeometry,
    MeshBasicMaterial
  >

  /** @todo replace userData usage with something else */
  const sourceChanged =
    imageComponent.imageSource &&
    (!hasComponent(entity, Object3DComponent) ||
      getComponent(entity, Object3DComponent).value.userData.src !== imageComponent.imageSource)
  if (sourceChanged) {
    try {
      const assetType = AssetLoader.getAssetClass(imageComponent.imageSource)
      if (assetType !== AssetClass.Image) {
        addError(entity, 'error', `Image format ${imageComponent.imageSource.split('.').pop()}not supported`)
        return
      }

      const texture = await AssetLoader.loadAsync(imageComponent.imageSource)
      texture.encoding = sRGBEncoding
      texture.minFilter = LinearFilter

      if (mesh.material.map) mesh.material.map?.dispose()
      mesh.material.map = texture

      mesh.userData.src = imageComponent.imageSource

      if (imageComponent.projection === ImageProjection.Flat) resizeImageMesh(mesh)

      removeError(entity, 'error')
    } catch (error) {
      addError(entity, 'error', 'Error Loading image')
      return
    }
  }

  const changeToSphereProjection =
    !(mesh.geometry instanceof SphereBufferGeometry) && imageComponent.projection === ImageProjection.Equirectangular360
  const changeToPlaneProjection =
    !(mesh.geometry instanceof PlaneBufferGeometry) && imageComponent.projection === ImageProjection.Flat

  if (changeToSphereProjection) {
    mesh.geometry = new SphereBufferGeometry(1, 64, 32)
    mesh.scale.set(1, 1, 1)
  }

  if (changeToPlaneProjection) {
    mesh.geometry = new PlaneBufferGeometry()
    if (mesh.material.map) resizeImageMesh(mesh)
  }

  mesh.material.transparent = imageComponent.alphaMode === ImageAlphaMode.Blend
  mesh.material.alphaTest = imageComponent.alphaMode === ImageAlphaMode.Mask ? imageComponent.alphaCutoff : 0
  mesh.material.alphaTest = imageComponent.alphaCutoff
  mesh.material.side = imageComponent.side

  mesh.material.needsUpdate = true
}

export const serializeImage: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ImageComponent) as ImageComponentType
  if (!component) return

  return {
    imageSource: component.imageSource,
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

  const ratio = (mesh.material.map.image.height || 1) / (mesh.material.map.image.width || 1)
  const _width = Math.min(1.0, 1.0 / ratio)
  const _height = Math.min(1.0, ratio)
  mesh.scale.set(_width, _height, 1)
}

const parseImageProperties = (props): ImageComponentType => {
  return {
    imageSource: props.imageSource ?? SCENE_COMPONENT_IMAGE_DEFAULT_VALUES.imageSource,
    alphaMode: props.alphaMode ?? SCENE_COMPONENT_IMAGE_DEFAULT_VALUES.alphaMode,
    alphaCutoff: props.alphaCutoff ?? SCENE_COMPONENT_IMAGE_DEFAULT_VALUES.alphaCutoff,
    projection: props.projection ?? SCENE_COMPONENT_IMAGE_DEFAULT_VALUES.projection,
    side: props.side ?? SCENE_COMPONENT_IMAGE_DEFAULT_VALUES.side
  }
}
