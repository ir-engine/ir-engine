import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
  PlaneBufferGeometry,
  MeshStandardMaterial,
  sRGBEncoding,
  LinearFilter,
  SphereBufferGeometry,
  Object3D
} from 'three'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ImageComponent, ImageComponentType } from '../../components/ImageComponent'
import { ImageAlphaMode, ImageProjection } from '../../classes/ImageUtils'
import { resolveMedia } from '../../../common/functions/resolveMedia'
import loadTexture from '../../../assets/functions/loadTexture'
import { isClient } from '../../../common/functions/isClient'

export const SCENE_COMPONENT_IMAGE = 'image'
export const SCENE_COMPONENT_IMAGE_DEFAULT_VALUES = {
  imageSource: '',
  alphaMode: ImageAlphaMode.Opaque,
  alphaCutoff: 0.5,
  projection: ImageProjection.Flat,
  side: DoubleSide
}

export const deserializeImage: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<ImageComponentType>
) => {
  let obj3d = getComponent(entity, Object3DComponent)?.value

  if (!obj3d) {
    obj3d = new Object3D()
    const image = new Mesh(new PlaneBufferGeometry(), new MeshBasicMaterial())

    obj3d.add(image)
    obj3d.userData.mesh = image

    addComponent(entity, Object3DComponent, { value: obj3d })
  }

  const props = parseImageProperties(json.props)
  addComponent(entity, ImageComponent, props)

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_IMAGE)

  updateImage(entity, props)
}

export const updateImage: ComponentUpdateFunction = async (entity: Entity, properties: ImageComponentType) => {
  if (!isClient) return
  const obj3d = getComponent(entity, Object3DComponent).value as Mesh<any, MeshStandardMaterial>
  const mesh = obj3d.userData.mesh
  const component = getComponent(entity, ImageComponent)

  if (properties.imageSource) {
    try {
      const { url } = await resolveMedia(component.imageSource)
      const texture = await loadTexture(url)
      if (!texture) return

      texture.encoding = sRGBEncoding
      texture.minFilter = LinearFilter

      if (mesh.material.map) mesh.material.map?.dispose()
      mesh.material.map = texture

      if (component.projection === ImageProjection.Flat) resizeImageMesh(mesh)
    } catch (error) {
      console.error(error)
    }
  }

  if (properties.hasOwnProperty('projection')) {
    if (component.projection === ImageProjection.Equirectangular360) {
      mesh.geometry = new SphereBufferGeometry(1, 64, 32)
      mesh.scale.set(1, 1, 1)
    } else {
      mesh.geometry = new PlaneBufferGeometry()
      if (mesh.material.map) resizeImageMesh(mesh)
    }
  }

  if (properties.hasOwnProperty('alphaMode')) {
    mesh.material.transparent = component.alphaMode === ImageAlphaMode.Blend
    mesh.material.alphaTest = component.alphaMode === ImageAlphaMode.Mask ? component.alphaCutoff : 0
  }

  if (properties.hasOwnProperty('alphaCutoff')) {
    mesh.material.alphaTest = component.alphaCutoff
  }

  if (properties.hasOwnProperty('side')) mesh.material.side = component.side

  mesh.material.needsUpdate = true
}

export const serializeImage: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ImageComponent) as ImageComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_IMAGE,
    props: {
      imageSource: component.imageSource,
      alphaCutoff: component.alphaCutoff,
      alphaMode: component.alphaMode,
      projection: component.projection,
      side: component.side
    }
  }
}

export const prepareImageForGLTFExport: ComponentPrepareForGLTFExportFunction = (image) => {
  if (image.userData.mesh) {
    if (image.userData.mesh.parent) image.userData.mesh.removeFromParent()
    delete image.userData.mesh
  }
}

export const resizeImageMesh = (mesh: Mesh<any, MeshStandardMaterial>) => {
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
