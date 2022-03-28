import { Color, Object3D } from 'three'

import { RethrownError } from '@xrengine/client-core/src/util/errors'
import { ComponentJson, EntityJson, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { getAbsolutePath, getGLTFLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { GLTFExporter } from '@xrengine/engine/src/assets/exporters/gltf/GLTFExporter'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getAllComponents, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'

import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DWithEntity } from '../components/Object3DComponent'

export const nodeToEntityJson = (node: any): EntityJson => {
  const parentId = node.extras.parent ? { parent: node.extras.parent } : {}
  return {
    name: node.name,
    components: Object.entries(node.extensions).map(([k, v]) => {
      return { name: k, props: v }
    }),
    uuid: node.extras.uuid,
    ...parentId
  }
}

export const gltfToSceneJson = (gltf: any): SceneJson => {
  const rootGL = gltf.scenes[gltf.scene]
  const rootUuid = rootGL.extras.uuid
  const result: SceneJson = {
    entities: {},
    root: rootUuid,
    version: 2.0
  }
  result.entities[rootUuid] = nodeToEntityJson(rootGL)
  const lookupNode = (idx) => gltf.nodes[idx]
  const nodeQ: Array<any> = rootGL.nodes.map(lookupNode).map((node) => {
    node.extras['parent'] = rootUuid
    return node
  })
  while (nodeQ.length > 0) {
    const node = nodeQ.pop()
    const uuid = node.extras.uuid
    let eJson: any = result.entities[uuid]
    if (!eJson) eJson = {}
    result.entities[uuid] = { ...eJson, ...nodeToEntityJson(node) }
    node.children?.map(lookupNode).forEach((child) => {
      child.extras['parent'] = uuid
      nodeQ.push(child)
    })
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
  const exporter: GLTFExporter = new GLTFExporter()
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
          animations: [] //getAnimationClips()
        }
      )
    })
  let gltf
  try {
    gltf = await doParse()
  } catch (error) {
    throw new RethrownError('error exporting scene', error)
  }
  const hostPath = Engine.publicPath.replace(/:\d{4}$/, '')
  const cacheRe = new RegExp(`${hostPath}:\\d{4}\/projects`)

  const frontier: any[] = []
  gltf.scenes.forEach((scene) => frontier.push(scene))
  gltf.nodes.forEach((node) => frontier.push(node))
  while (frontier.length > 0) {
    const elt = frontier.pop()
    for (const [k, v] of Object.entries(elt)) {
      if (typeof v === 'object') {
        frontier.push(v)
      }
      if (typeof v === 'string' && cacheRe.test(v)) {
        elt[k] = v.replace(cacheRe, '__$project$__')
      }
    }
  }
  return gltf
}

const addComponentDataToGLTFExtension = (obj3d: Object3D, data: ComponentJson) => {
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

export const prepareObjectForGLTFExport = (obj3d: Object3DWithEntity, world = useWorld()) => {
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
        if (data) addComponentDataToGLTFExtension(obj3d, data)
      }
    })
  }
  const allComponents = getAllComponents(obj3d.entity, world)
  allComponents.forEach((comp) => {})
}
