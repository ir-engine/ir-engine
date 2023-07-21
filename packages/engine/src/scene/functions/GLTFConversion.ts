/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Color, MathUtils, Object3D } from 'three'

import config from '@etherealengine/common/src/config'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { ComponentJson, EntityJson, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  getAllComponents,
  getComponent,
  serializeComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { Object3DWithEntity } from '../components/GroupComponent'
import { NameComponent } from '../components/NameComponent'
import { UUIDComponent } from '../components/UUIDComponent'

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
  const rootUuid = MathUtils.generateUUID() as EntityUUID
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

export interface GLTFExtension {
  beforeParse?(input)
  afterParse?(input)
  writeTexture?(map, textureDef)
  writeMaterial?(material, materialDef)
  writeMesh?(mesh, meshDef)
  writeNode?(node, nodeDef)
}

const serializeECS = (roots: Object3DWithEntity[]) => {
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
        extras: { uuid: getComponent(srcObj.entity, UUIDComponent) }
      }
      for (const [name] of Object.entries(nodeBase.extensions)) {
        extensionSet.add(name)
      }
      delete srcObj.userData.gltfExtensions
      const children = getComponent(srcObj.entity, EntityTreeComponent)?.children

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
  for (const root of roots) {
    root.traverse((node: Object3DWithEntity) => {
      if (node.entity) {
        prepareObjectForGLTFExport(node)
      }
    })
  }

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
  const cacheRe = new RegExp(`${config.client.fileServer}\/projects`)
  const symbolRe = /__\$project\$__/
  const pathSymbol = '__$project$__'
  const frontier = [...gltf.scenes, ...gltf.nodes]
  while (frontier.length > 0) {
    const elt = frontier.pop()
    if (typeof elt === 'object' && elt !== null) {
      for (const [k, v] of Object.entries(elt)) {
        if (!!v && typeof v === 'object' && !(v as Object3D).isObject3D) {
          frontier.push(v)
        }
        if (mode === 'encode') {
          if (typeof v === 'string' && cacheRe.test(v)) {
            elt[k] = v.replace(cacheRe, pathSymbol)
          }
        }
        if (mode === 'decode') {
          if (typeof v === 'string' && symbolRe.test(v)) {
            elt[k] = v.replace(symbolRe, `${config.client.fileServer}/projects`)
          }
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

export const prepareObjectForGLTFExport = (obj3d: Object3DWithEntity) => {
  const name = getComponent(obj3d.entity, NameComponent)
  if (name) obj3d.name = name

  const { entity } = obj3d

  const components = getAllComponents(entity)

  for (const component of components) {
    const sceneComponentID = component.jsonID
    if (sceneComponentID) {
      const data = serializeComponent(entity, component)
      if (data)
        addComponentDataToGLTFExtension(obj3d, {
          name: sceneComponentID,
          props: Object.assign({}, data)
        })
    }
  }
}
