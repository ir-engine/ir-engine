import { Color, MathUtils, Object3D } from 'three'

import { ComponentJson, EntityJson, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getAllComponents, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { getState } from '@xrengine/hyperflux'

import { AssetComponentType } from '../components/AssetComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DWithEntity } from '../components/Object3DComponent'

export const nodeToEntityJson = (node: any): EntityJson => {
  const parentId = node.extras?.parent ? { parent: node.extras.parent } : {}
  const uuid = node.extras?.uuid ? node.extras.uuid : MathUtils.generateUUID()
  return {
    name: node.name,
    components: node.extensions
      ? Object.entries(node.extensions).map(([k, v]) => {
          return { name: k, props: v }
        })
      : [],
    ...parentId
  }
}

export const gltfToSceneJson = (gltf: any): SceneJson => {
  handleScenePaths(gltf, 'decode')
  const rootGL = gltf.scenes[gltf.scene]
  const rootUuid = MathUtils.generateUUID()
  const result: SceneJson = {
    entities: {},
    root: rootUuid,
    version: 2.0,
    metadata: Engine.instance.currentWorld.sceneMetadata.get({ noproxy: true })
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

export interface GLTFExtension {
  beforeParse?(input)
  afterParse?(input)
  writeTexture?(map, textureDef)
  writeMaterial?(material, materialDef)
  writeMesh?(mesh, meshDef)
  writeNode?(node, nodeDef)
}

const serializeECS = (
  roots: Object3DWithEntity[],
  asset?: AssetComponentType,
  world: World = Engine.instance.currentWorld
) => {
  const eTree = world.entityTree
  const nodeMap = eTree.entityNodeMap
  let rootEntities = new Array()
  const idxTable = new Map<Entity, number>()
  const extensionSet = new Set<string>()
  const frontier: Object3DWithEntity[] = []
  const haveChildren = new Array()
  const result = {
    asset: { version: '2.0', generator: 'Ethereal Engine glTF Scene Conversion' },
    scenes: [{ nodes: new Array() }],
    scene: 0,
    nodes: new Array(),
    extensionsUsed: new Array<string>()
  }

  frontier.push(...roots)
  do {
    const srcObj = frontier.pop()
    if (srcObj?.userData.gltfExtensions) {
      const nodeBase = {
        name: srcObj.name,
        extensions: srcObj.userData.gltfExtensions,
        extras: { uuid: nodeMap.get(srcObj.entity)?.uuid }
      }
      for (const [name] of Object.entries(nodeBase.extensions)) {
        extensionSet.add(name)
      }
      delete srcObj.userData.gltfExtensions
      const children = nodeMap.get(srcObj.entity)?.children

      if (children) {
        haveChildren.push(nodeBase)
        nodeBase['children'] = children
      }
      if (roots.includes(srcObj)) {
        result.scenes[0].nodes.push(result.nodes.length)
      }
      idxTable.set(srcObj.entity, result.nodes.length)
      result.nodes.push(nodeBase)
    }
    if (srcObj?.children) {
      frontier.push(...(srcObj.children as Object3DWithEntity[]))
    }
  } while (frontier.length > 0)
  result.extensionsUsed = [...extensionSet.values()]
  for (const parent of haveChildren) {
    parent.children = parent.children.map((entity) => idxTable.get(entity))
  }
  return result
}

export const sceneToGLTF = (roots: Object3DWithEntity[]) => {
  roots.forEach((root) =>
    root.traverse((node: Object3DWithEntity) => {
      if (node.entity) {
        prepareObjectForGLTFExport(node)
      }
    })
  )

  const gltf = serializeECS(roots)
  handleScenePaths(gltf, 'encode')
  return gltf
}

/**
 * Handles encoding and decoding scene path symbols from gltfs
 * @param gltf
 * @param mode 'encode' or 'decode'
 */
export const handleScenePaths = (gltf: any, mode: 'encode' | 'decode') => {
  const hostPath = Engine.instance.publicPath.replace(/:\d{4}$/, '')
  const cacheRe = new RegExp(`${hostPath}:\\d{4}\/projects`)
  const symbolRe = /__\$project\$__/
  const pathSymbol = '__$project$__'
  const frontier = [...gltf.scenes, ...gltf.nodes]
  while (frontier.length > 0) {
    const elt = frontier.pop()
    for (const [k, v] of Object.entries(elt)) {
      if (typeof v === 'object') {
        frontier.push(v)
      }
      if (mode === 'encode') {
        if (typeof v === 'string' && cacheRe.test(v)) {
          elt[k] = v.replace(cacheRe, pathSymbol)
        }
      }
      if (mode === 'decode') {
        if (typeof v === 'string' && symbolRe.test(v)) {
          elt[k] = v.replace(symbolRe, `${hostPath}:8642/projects`)
        }
      }
    }
  }
}

const addComponentDataToGLTFExtension = (obj3d: Object3D, data: ComponentJson) => {
  if (!obj3d.userData.gltfExtensions) obj3d.userData.gltfExtensions = {}
  if (data.props && typeof data.props !== 'object')
    throw new Error('glTF component props must be an object or undefined')

  const componentProps = {}

  for (const key in data.props) {
    const value = data.props[key]
    if (value instanceof Color) {
      componentProps[key] = `#${value.getHexString()}`
    } else {
      componentProps[key] = value
    }
  }

  obj3d.userData.gltfExtensions[data.name] = componentProps
}

export const prepareObjectForGLTFExport = (obj3d: Object3DWithEntity, world = Engine.instance.currentWorld) => {
  const nameCmp = getComponent(obj3d.entity, NameComponent)
  if (nameCmp?.name) {
    obj3d.name = nameCmp.name
  }

  const { entity } = obj3d

  const components = getAllComponents(entity)

  for (const component of components) {
    const sceneComponentID = world.sceneComponentRegistry.get(component._name)!
    if (sceneComponentID) {
      const loadingRegister = world.sceneLoadingRegistry.get(sceneComponentID)
      if (loadingRegister) {
        const serialize = world.sceneLoadingRegistry.get(sceneComponentID)?.serialize
        const data = serialize ? serialize(entity) : getComponent(entity, component)
        if (data)
          addComponentDataToGLTFExtension(obj3d, {
            name: sceneComponentID,
            props: Object.assign({}, data)
          })
      }
    }
  }
}
