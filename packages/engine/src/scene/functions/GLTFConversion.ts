import { Color, Object3D, Scene } from 'three'

import { RethrownError } from '@xrengine/client-core/src/util/errors'
import { ComponentJson, EntityJson, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AssetLoader, getGLTFLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { GLTFExporter } from '@xrengine/engine/src/assets/exporters/gltf/GLTFExporter'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getAllComponents, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'

import { EntityNodeComponent, EntityNodeComponentType } from '../components/EntityNodeComponent'
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
  handleScenePaths(gltf, 'decode')
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
  const url = AssetLoader.getAbsolutePath(_url)
  try {
    const gltf = await loader.loadAsync(url)

    return gltfToSceneJson(gltf)
  } catch (error) {
    throw new RethrownError('error loading scene glTF: ', error)
  }
}

const recursiveGetEntities = (root) => {
  const result = new Map()
  const frontier = [root]
  do {
    const obj = frontier.pop()
    if (obj.entity !== undefined && hasComponent(obj.entity, EntityNodeComponent)) {
      result.set(obj.entity, obj)
    }
    obj.children?.forEach((child) => frontier.push(child))
  } while (frontier.length > 0)
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

export class XRE_GLTF implements GLTFExtension {
  dudNodes: Map<Entity, Object3DWithEntity>
  setParentOps: Array<{ parent: Entity; child: Entity }>
  knownEntities: Map<Entity, Object3DWithEntity>
  beforeParse(input) {
    this.dudNodes = new Map()
    this.setParentOps = new Array()
    this.knownEntities = new Map()
    const knownEntities = recursiveGetEntities(input)
    const world = useWorld()
    const eTree = world.entityTree
    const idNodeMap = eTree.uuidNodeMap

    for (const eNode of idNodeMap.values()) {
      if (!knownEntities.has(eNode.entity)) {
        const dud = new Object3D() as Object3DWithEntity
        dud.entity = eNode.entity
        eNode.children?.forEach((child) => {
          this.setParentOps.push({ parent: eNode.entity, child: child })
        })
        if (eNode.parentEntity !== undefined) {
          this.setParentOps.push({ parent: eNode.parentEntity, child: eNode.entity })
        }
        prepareObjectForGLTFExport(dud, world)
        this.knownEntities.set(dud.entity, dud)
        this.dudNodes.set(dud.entity, dud)
      }
    }
    this.setParentOps.forEach((op) => {
      const child = this.knownEntities.get(op.child)
      const parent = this.knownEntities.get(op.parent)
      if (parent && child) parent.add(child)
    })
  }

  afterParse(scene) {
    this.setParentOps.forEach((op) => {
      const child = this.knownEntities.get(op.child)
      child?.removeFromParent()
    })
    for (const dudNode of this.dudNodes.values()) {
      scene.remove(dudNode)
    }
    this.setParentOps = []
    this.dudNodes.clear()
    this.knownEntities.clear()
  }
}

const serializeECS = (root: Scene, world: World = useWorld()) => {
  const eTree = world.entityTree
  const nodeMap = eTree.entityNodeMap
  let sceneEntity
  const idxTable = new Map<Entity, number>()
  const extensionSet = new Set<string>()
  const frontier: Object3DWithEntity[] = []
  const haveChildren = new Array()
  const result = {
    asset: { version: '2.0', generator: 'XREngine glTF Scene Conversion' },
    scenes: new Array(),
    scene: 0,
    nodes: new Array(),
    extensionsUsed: new Array<string>()
  }

  frontier.push(root as Object3D as Object3DWithEntity)
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
      const isScene = srcObj instanceof Scene
      if (children) {
        haveChildren.push(nodeMap.get(srcObj.entity))
        if (isScene) {
          nodeBase['nodes'] = children
        } else {
          nodeBase['children'] = children
        }
      }
      if (isScene) {
        sceneEntity = srcObj.entity
        result.scenes.push(nodeBase)
      } else {
        idxTable.set(srcObj.entity, result.nodes.length)
        result.nodes.push(nodeBase)
      }
    }
    if (srcObj?.children) {
      frontier.push(...(srcObj.children as Object3DWithEntity[]))
    }
  } while (frontier.length > 0)
  result.extensionsUsed = [...extensionSet.values()]
  for (const parent of haveChildren) {
    if (parent.entity === sceneEntity) result.scenes[0].nodes = parent.children.map((entity) => idxTable.get(entity))
    else parent.children = parent.children.map((entity) => idxTable.get(entity))
  }
  return result
}

export const sceneToGLTF = async (root: Scene) => {
  root.traverse((node: Object3DWithEntity) => {
    if (node.entity) {
      prepareObjectForGLTFExport(node)
    }
  })
  const gltf = serializeECS(root)
  handleScenePaths(gltf, 'encode')
  return gltf
}

/**
 * Handles encoding and decoding scene path symbols from gltfs
 * @param gltf
 * @param mode 'encode' or 'decode'
 */
const handleScenePaths = (gltf: any, mode: 'encode' | 'decode') => {
  const hostPath = Engine.publicPath.replace(/:\d{4}$/, '')
  const cacheRe = new RegExp(`${hostPath}:\\d{4}\/projects`)
  const symbolRe = /__\$project\$__/
  const pathSymbol = '__$project$__'
  const frontier: any[] = []
  gltf.scenes.forEach((scene) => frontier.push(scene))
  gltf.nodes.forEach((node) => frontier.push(node))
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
        let data = loadingRegister.serialize(obj3d.entity)
        if (data) addComponentDataToGLTFExtension(obj3d, data)
      }
    })
  }
}
