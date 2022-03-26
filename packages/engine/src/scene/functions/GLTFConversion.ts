import { GLTF } from 'src/assets/loaders/gltf/GLTFLoader'
import { createEntity } from 'src/ecs/functions/EntityFunctions'
import { Color, Object3D } from 'three'
import { Scene } from 'three'

import { RethrownError } from '@xrengine/client-core/src/util/errors'
import { ComponentJson, EntityJson, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { getAbsolutePath, getGLTFLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { GLTFExporter } from '@xrengine/engine/src/assets/exporters/gltf/GLTFExporter'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  addComponent,
  getAllComponents,
  getComponent,
  hasComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'

import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DWithEntity } from '../components/Object3DComponent'
import { getAnimationClips } from './cloneObject3D'

export const gltfToSceneJson = (gltf: GLTF) => {
  const entities = new Array<EntityJson>()
  const rootGL = gltf.scene as any
  const result: SceneJson = {
    entities: {},
    root: rootGL.extras['uuid'],
    version: 2.0
  }

  const nodes = new Array()
  gltf.scene.children.forEach((child) => nodes.push(child))
  while (nodes.length > 0) {
    const glNode = nodes.pop()
  }
  return result
}

export const sceneFromGLTF = async (_url: string) => {
  const loader = getGLTFLoader()
  const url = getAbsolutePath(_url)
  try {
    const gltf = await loader.loadAsync(url)

    return gltfToSceneJson(gltf)
  } catch (error) {
    throw new RethrownError('error loading scene glTF: ', error)
  }
}

export const sceneToGLTF = async (root: Object3DWithEntity) => {
  root.traverse((node: Object3DWithEntity) => {
    if (node.entity) {
      prepareObjectForGLTFExport(node)
    }
  })
  const exporter = new GLTFExporter()
  const doParse = () =>
    new Promise((resolve, reject) => {
      exporter.parse(
        root,
        (gltf) => {
          resolve(gltf)
        },
        (error) => {
          reject(error)
        },
        {
          embedImages: false,
          trs: true,
          onlyVisible: false,
          includeCustomExtensions: true,
          animations: getAnimationClips()
        }
      )
    })
  let gltf
  try {
    gltf = await doParse()
  } catch (error) {
    throw new RethrownError('error exporting scene', error)
  }
  return gltf
}

const addComponentDataToGLTFExtenstion = (obj3d: Object3D, data: ComponentJson) => {
  if (!obj3d.userData.gltfExtensions) obj3d.userData.gltfExtensions = {}
  //if (!obj3d.userData.gltfExtensions.componentData) obj3d.userData.gltfExtensions.componentData = {}
  if (data.props && typeof data.props !== 'object')
    throw new Error('glTF component props must be an object or undefined')

  const componentProps = {}

  for (const key in data.props) {
    const value = data.props[key]
    if (value instanceof Color) {
      //componentProps[key] = `Color { r: ${value.r}, g: ${value.g}, b: ${value.b}, hex: #${value.getHexString()}}`
      componentProps[key] = `#${value.getHexString()}`
    } else {
      componentProps[key] = value
    }
  }

  obj3d.userData.gltfExtensions[data.name] = componentProps
}

const prepareObjectForGLTFExport = (obj3d: Object3DWithEntity, world = useWorld()) => {
  const entityNode = getComponent(obj3d.entity, EntityNodeComponent)
  const nameCmp = getComponent(obj3d.entity, NameComponent)
  if (nameCmp?.name) {
    obj3d.name = nameCmp.name
  }

  if (entityNode?.components) {
    entityNode.components.forEach((comp) => {
      const loadingRegister = world.sceneLoadingRegistry.get(comp)
      if (loadingRegister) {
        obj3d.userData.editor_uuid = world.entityTree.entityNodeMap[obj3d.entity]?.uuid
        //if (loadingRegister.prepareForGLTFExport) loadingRegister.prepareForGLTFExport(obj3d)

        let data = loadingRegister.serialize(obj3d.entity)
        if (data) addComponentDataToGLTFExtenstion(obj3d, data)
      }
    })
  }
  const allComponents = getAllComponents(obj3d.entity, world)
  allComponents.forEach((comp) => {})
}
