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
import { NodeID, NodeIDComponent } from '@etherealengine/spatial/src/transform/components/NodeIDComponent'
import { GLTF } from '@gltf-transform/core'
import { Matrix4, Quaternion, Vector3 } from 'three'

import { TransformComponent } from '@etherealengine/spatial'

import { migrateDirectionalLightUseInCSM } from '../scene/functions/migrateDirectionalLightUseInCSM'
import { migrateOldColliders } from '../scene/functions/migrateOldColliders'
import { migrateOldComponentJSONIDs } from '../scene/functions/migrateOldComponentJSONIDs'
import { migrateSceneSettings } from '../scene/functions/migrateSceneSettings'

export type ComponentJsonType = {
  name: string
  props?: any
}

export type EntityJsonType = {
  name: string | NodeID
  components: ComponentJsonType[]
  parent?: NodeID
  index?: number
}

export type SceneJsonType = {
  entities: Record<NodeID, EntityJsonType>
  root: NodeID
  version: number
}

export type SceneJSONDataType = {
  name: string
  scene: SceneJsonType
  thumbnailUrl: string
  project: string
}

export const migrateSceneJSONToGLTF = (data: SceneJsonType): GLTF.IGLTF => {
  migrateOldComponentJSONIDs(data)
  migrateSceneSettings(data)
  for (const [uuid, entityJson] of Object.entries(data.entities)) {
    migrateOldColliders(entityJson)
  }
  migrateDirectionalLightUseInCSM(data)

  return convertSceneJSONToGLTF(data)
}

export const convertSceneJSONToGLTF = (json: SceneJsonType): GLTF.IGLTF => {
  const gltf = {
    asset: {
      version: '2.0',
      generator: 'iR Engine'
    },
    scenes: [
      {
        nodes: []
      }
    ],
    scene: 0,
    nodes: [],
    extensionsUsed: []
  } as GLTF.IGLTF

  delete json.entities[json.root]

  // populate nodes
  for (const [uuid, entity] of Object.entries(json.entities)) {
    const node = {
      name: entity.name,
      extensions: {}
    } as GLTF.INode

    node.extensions![NodeIDComponent.jsonID] = uuid
    if (!gltf.extensionsUsed!.includes(NodeIDComponent.jsonID)) gltf.extensionsUsed!.push(NodeIDComponent.jsonID)

    for (const component of entity.components) {
      if (component.name === TransformComponent.jsonID) {
        const position = new Vector3().copy(component.props.position)
        const rotation = new Quaternion().copy(component.props.rotation)
        const scale = new Vector3().copy(component.props.scale)
        const matrix = new Matrix4().compose(position, rotation, scale)
        node.matrix = matrix.toArray()
        continue
      }
      node.extensions![component.name] = component.props
      if (!gltf.extensionsUsed!.includes(component.name)) {
        gltf.extensionsUsed!.push(component.name)
      }
    }

    gltf.nodes!.push(node)
  }

  // populate parent/child relationships
  for (const [uuid, entity] of Object.entries(json.entities)) {
    if (entity.parent === json.root) {
      const nodeIndex = gltf.nodes!.findIndex((n) => n.extensions![NodeIDComponent.jsonID] === uuid)!
      const childIndex = entity.index
      if (typeof childIndex === 'number') {
        gltf.scenes![0].nodes!.splice(childIndex, 0, nodeIndex)
      } else {
        gltf.scenes![0].nodes!.push(nodeIndex)
      }
    } else {
      const parentNode = gltf.nodes!.find((n) => n.extensions![NodeIDComponent.jsonID] === entity.parent)!
      const nodeIndex = gltf.nodes!.findIndex((n) => n.extensions![NodeIDComponent.jsonID] === uuid)
      if (!parentNode.children) parentNode.children = []
      const childIndex = entity.index
      if (typeof childIndex === 'number') {
        parentNode.children.splice(childIndex, 0, nodeIndex)
      } else {
        parentNode.children.push(nodeIndex)
      }
    }
  }

  return gltf
}
