import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Color, Object3D } from 'three'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { Object3DWithEntity } from '../components/Object3DComponent'
import cloneObject3D from './cloneObject3D'

export const serializeForGLTFExport = (object3d: Object3D) => {
  const clonnedObject = cloneObject3D(object3d, true)

  prepareObjectForGLTFExport(clonnedObject)
  clonnedObject.traverse((node: Object3DWithEntity) => {
    if (node.entity) {
      prepareObjectForGLTFExport(node)
    }
  })

  return clonnedObject
}

const addComponentDataToGLTFExtenstion = (obj3d: Object3D, data: ComponentJson) => {
  if (!obj3d.userData.gltfExtensions) obj3d.userData.gltfExtensions = {}
  if (!obj3d.userData.gltfExtensions.componentData) obj3d.userData.gltfExtensions.componentData = {}
  if (data.props && typeof data.props !== 'object')
    throw new Error('glTF component props must be an object or undefined')

  const componentProps = {}

  for (const key in data.props) {
    const value = data.props[key]
    if (value instanceof Color) {
      componentProps[key] = `Color { r: ${value.r}, g: ${value.g}, b: ${value.b}, hex: #${value.getHexString()}}`
    } else {
      componentProps[key] = value
    }
  }

  obj3d.userData.gltfExtensions.componentData[data.name] = componentProps
}

const prepareObjectForGLTFExport = (obj3d: Object3DWithEntity, world = useWorld()) => {
  const entityNode = getComponent(obj3d.entity, EntityNodeComponent)

  if (entityNode?.components) {
    entityNode.components.forEach((comp) => {
      const loadingRegister = world.sceneLoadingRegistry.get(comp)

      if (loadingRegister) {
        obj3d.userData.editor_uuid = world.entityTree.findNodeFromEid(obj3d.entity)?.uuid
        if (loadingRegister.prepareForGLTFExport) loadingRegister.prepareForGLTFExport(obj3d)

        let data = loadingRegister.serialize(obj3d.entity)
        if (data) addComponentDataToGLTFExtenstion(obj3d, data)
      }
    })
  }
}
