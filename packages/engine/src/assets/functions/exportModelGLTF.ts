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

import {
  getAllComponents,
  getComponent,
  getOptionalComponent,
  hasComponent,
  serializeComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'

import { GLTF } from '@gltf-transform/core'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { GLTFWriter } from '../exporters/gltf/GLTFExporter'
import createGLTFExporter from './createGLTFExporter'

export default async function exportModelGLTF(
  entity: Entity,
  options = {
    projectName: '',
    relativePath: '',
    binary: true,
    includeCustomExtensions: true,
    embedImages: true,
    onlyVisible: false
  }
) {
  const scene = getOptionalComponent(entity, ModelComponent)?.scene ?? getComponent(entity, GroupComponent)[0]
  const exporter = createGLTFExporter()
  const modelName = options.relativePath.split('/').at(-1)!.split('.').at(0)!
  const resourceURI = `model-resources/${modelName}`
  const gltf: ArrayBuffer = await new Promise((resolve) => {
    exporter.parse(
      scene,
      (gltf: ArrayBuffer) => {
        resolve(gltf)
      },
      (error) => {
        throw error
      },
      {
        ...options,
        animations: scene.animations ?? [],
        flipY: !!scene.userData.src?.endsWith('.usdz'),
        resourceURI,
        srcEntity: entity
      }
    )
  })
  return gltf
}

type GLTFWriterOptions = {
  projectName: string
  relativePath: string
  binary: boolean
  includeCustomExtensions: boolean
  embedImages: boolean
  onlyVisible: boolean
}

const createGLTFWriter = (options: GLTFWriterOptions) => {
  const gltf = { nodes: [] as GLTF.INode[] } as GLTF.IGLTF
  const writer = new GLTFWriter()
  writer.json = gltf
  return writer
}

export async function exportGLTFComponent(
  entity: Entity,
  options = {
    projectName: '',
    relativePath: '',
    binary: true,
    includeCustomExtensions: true,
    embedImages: true,
    onlyVisible: false
  }
) {
  const extensionsUsed = new Set<string>()

  const writer = createGLTFWriter(options)
  exportGLTFNode(entity, writer, extensionsUsed)

  const gltf = writer.json
  if (extensionsUsed.size) gltf.extensionsUsed = [...extensionsUsed]
  return gltf
}

const exportGLTFNode = (entity: Entity, writer: GLTFWriter, extensionsUsed: Set<string>): number[] => {
  const gltf = writer.json as GLTF.IGLTF
  const children = getComponent(entity, EntityTreeComponent).children
  const childrenIndicies = [] as number[]
  if (children.length > 0) {
    for (const child of children) {
      childrenIndicies.push(...exportGLTFNode(child, writer, extensionsUsed))
    }
  }

  const indices = [] as number[]
  const group = getOptionalComponent(entity, GroupComponent)
  if (group && group.length) {
    /** @todo how to map ECS data to nodes when multiple objects are in the group */
    for (const obj of group) indices.push(writer.processNode(obj))
  }

  if (!indices.length) {
    indices.push(gltf.nodes!.length)
    gltf.nodes!.push({})
  }

  const node = gltf.nodes![indices[0]]
  if (hasComponent(entity, NameComponent)) {
    node.name = getComponent(entity, NameComponent)
  }

  const extensions = {} as Record<string, unknown>
  const components = getAllComponents(entity)
  for (const component of components) {
    if (
      component === TransformComponent || //skip transform data as that is stored in the object3d
      !component.jsonID //skip components that don't have a jsonID
    )
      continue

    const compData = serializeComponent(entity, component)
    // Do we not want to serialize tag components?
    if (!compData) continue
    extensions[component.jsonID] = compData
    extensionsUsed.add(component.jsonID)
  }
  if (Object.keys(extensions).length > 0) node.extensions = extensions
  node.children = children

  return indices
}
