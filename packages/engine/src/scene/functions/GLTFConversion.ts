/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { GLTF } from '@gltf-transform/core'
import { Matrix4, Object3D } from 'three'

import { EntityUUID, generateEntityUUID, SerializedComponentType, UUIDComponent } from '@ir-engine/ecs'
import { sceneRelativePathIdentifier } from '@ir-engine/engine/src/assets/functions/parseSceneJSON'
import { TransformComponent } from '@ir-engine/spatial'

import { getState } from '@ir-engine/hyperflux'
import { AssetLoaderState } from '../../assets/state/AssetLoaderState'
import { EntityJsonType, SceneJsonType } from '../types/SceneTypes'

export const nodeToEntityJson = (node: any): EntityJsonType => {
  const parentId = node.extras?.parent ? { parent: node.extras.parent } : {}
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

export const gltfToSceneJson = (gltf: any): SceneJsonType => {
  handleScenePaths(gltf, 'decode')
  const rootGL = gltf.scenes[gltf.scene]
  const rootUuid = generateEntityUUID()
  const result: SceneJsonType = {
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

export const getCacheRegex = (fileServer: string) => {
  return new RegExp(`${fileServer}\/projects`)
}

/**
 * Handles encoding and decoding scene path symbols from gltfs
 * @param gltf
 * @param mode 'encode' or 'decode'
 */
export const handleScenePaths = (gltf: GLTF.IGLTF, mode: 'encode' | 'decode') => {
  const cloudDomain = getState(AssetLoaderState).cloudDomain
  const cacheRe = getCacheRegex(cloudDomain)
  const symbolRe = /__\$project\$__/
  const frontier = [...(gltf.scenes ?? []), ...(gltf.nodes ?? [])]
  while (frontier.length > 0) {
    const elt = frontier.pop()
    if (typeof elt === 'object' && elt !== null) {
      for (const [k, v] of Object.entries(elt)) {
        if (!!v && typeof v === 'object' && !(v as Object3D).isObject3D) {
          frontier.push(v)
        }
        if (mode === 'encode') {
          if (typeof v === 'string' && cacheRe.test(v)) {
            elt[k] = v.replace(cacheRe, sceneRelativePathIdentifier)
          }
        }
        if (mode === 'decode') {
          if (typeof v === 'string' && symbolRe.test(v)) {
            elt[k] = v.replace(symbolRe, `${cloudDomain}/projects`)
          }
        }
      }
    }
  }
  return gltf
}

export function entityJSONToGLTFNode(entityJson: EntityJsonType, entityUUID: EntityUUID): GLTF.INode {
  const node: GLTF.INode = {
    name: entityJson.name,
    extensions: {
      [UUIDComponent.jsonID]: entityUUID
    }
  }
  if (entityJson.components) {
    for (const componentJson of entityJson.components) {
      //handle transform component map to matrix
      if (componentJson.name === TransformComponent.jsonID) {
        const transform = componentJson.props as SerializedComponentType<typeof TransformComponent>
        const matrix = new Matrix4().compose(transform.position, transform.rotation, transform.scale)
        node.matrix = matrix.toArray()
      } else {
        node.extensions![componentJson.name] = componentJson.props
      }
    }
  }
  return node
}
