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
import {
  ComponentJSONIDMap,
  createEntity,
  Entity,
  generateEntityUUID,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { loadGLTFFile } from './GLTFComponent'

export function importGLTFSceneFromURL(url: string, onLoad: (entities: Entity[]) => void) {
  loadGLTFFile(
    url,
    (gltf) => {
      onLoad(importGLTFScene(gltf))
    },
    () => onLoad([]),
    () => onLoad([])
  )
}

export function importGLTFScene(gltf: GLTF.IGLTF): Entity[] {
  const nodes = gltf.nodes
  if (!nodes) return []

  const entities = [] as Entity[]
  const imported = new Map<number, Entity>()
  for (let i = 0, len = nodes.length; i < len; i++) {
    entities.push(importGLTFSceneNode(i, nodes, imported))
  }

  return entities
}

const _matrix = new Matrix4()
const _position = new Vector3()
const _rotation = new Quaternion()
const _scale = new Vector3()

const importGLTFSceneNode = (index: number, nodes: GLTF.INode[], imported: Map<number, Entity>): Entity => {
  if (imported.has(index)) return imported.get(index)!

  const entity = createEntity()
  imported.set(index, entity)
  const node = nodes[index]

  if (node.children) {
    for (const childIndex of node.children) {
      const childEntity = importGLTFSceneNode(childIndex, nodes, imported)
      setComponent(childEntity, EntityTreeComponent, { parentEntity: entity })
    }
  }

  if (node.matrix) {
    _matrix.fromArray(node.matrix).decompose(_position, _rotation, _scale)
    setComponent(entity, TransformComponent, { position: _position, rotation: _rotation, scale: _scale })
  } else setComponent(entity, TransformComponent)

  if (node.extensions) {
    for (const componentID in node.extensions) {
      if (componentID === UUIDComponent.jsonID) {
        setComponent(entity, UUIDComponent, generateEntityUUID())
        continue
      }

      const component = ComponentJSONIDMap.get(componentID)
      if (!component) continue

      const compData = node.extensions[componentID]
      setComponent(entity, component, compData)
    }
  }

  return entity
}
