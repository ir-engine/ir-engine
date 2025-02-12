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
  ComponentType,
  getAllComponents,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  serializeComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Matrix4 } from 'three'
import { cleanStorageProviderURLs } from '../assets/functions/parseSceneJSON'
import { GLTFComponent } from './GLTFComponent'

export interface GLTFSceneExportExtension {
  before?: (rootEntity: Entity, gltf: GLTF.IGLTF) => void
  beforeNode?: (entity: Entity) => void
  beforeComponent?: (entity: Entity, component: ComponentType<any>, node: GLTF.INode, index: number) => void
  afterComponent?: (entity: Entity, component: ComponentType<any>, node: GLTF.INode, index: number) => void
  afterNode?: (entity: Entity, node: GLTF.INode, index: number) => void
  after?: (rootEntity: Entity, gltf: GLTF.IGLTF) => void
}

export class RemoveRootNodeParentExportExtension implements GLTFSceneExportExtension {
  parentEntity: Entity = UndefinedEntity

  before(rootEntity: Entity) {
    if (hasComponent(rootEntity, EntityTreeComponent)) {
      const tree = getMutableComponent(rootEntity, EntityTreeComponent)
      this.parentEntity = tree.parentEntity.value
      tree.parentEntity.set(UndefinedEntity)
    }
  }

  after(rootEntity: Entity) {
    if (hasComponent(rootEntity, EntityTreeComponent)) {
      getMutableComponent(rootEntity, EntityTreeComponent).parentEntity.set(this.parentEntity)
    }
  }
}

export class IgnoreGLTFComponentExportExtension implements GLTFSceneExportExtension {
  entityChildrenCache = new Map<Entity, Entity[] | undefined>()

  beforeNode(entity: Entity) {
    if (hasComponent(entity, GLTFComponent)) {
      const children = getOptionalComponent(entity, EntityTreeComponent)?.children
      if (children && children.length) {
        this.entityChildrenCache[entity] = children
        getMutableComponent(entity, EntityTreeComponent).children.set([])
      }
    }
  }

  afterNode(entity: Entity) {
    const children = this.entityChildrenCache[entity]
    if (children) {
      getMutableComponent(entity, EntityTreeComponent).children.set(children)
      this.entityChildrenCache.delete(entity)
    }
  }
}

export type ExportExtension = new () => GLTFSceneExportExtension

export const defaultExportExtensionList = [
  IgnoreGLTFComponentExportExtension,
  RemoveRootNodeParentExportExtension
] as ExportExtension[]

export function exportGLTFScene(entity: Entity, exportExtensionTypes: ExportExtension[] = defaultExportExtensionList) {
  const exportExtensions = exportExtensionTypes.map((ext) => new ext())

  const gltf = {
    asset: { generator: 'IREngine.SceneExporter', version: '2.0' },
    nodes: [] as GLTF.INode[],
    scene: 0,
    scenes: [{ nodes: [] }] as GLTF.IScene[]
  } as GLTF.IGLTF

  for (const extension of exportExtensions) extension.before?.(entity, gltf)

  const context = {
    extensionsUsed: new Set<string>(),
    exportExtensions
  }
  const rootIndex = exportGLTFSceneNode(entity, gltf, context)
  gltf.scenes![0].nodes.push(rootIndex)
  if (context.extensionsUsed.size) gltf.extensionsUsed = [...context.extensionsUsed]
  cleanStorageProviderURLs(gltf)

  for (const extension of exportExtensions) extension.after?.(entity, gltf)

  return gltf
}

const _diffMatrix = new Matrix4()
const _transformMatrix = new Matrix4()

const exportGLTFSceneNode = (
  entity: Entity,
  gltf: GLTF.IGLTF,
  context: {
    extensionsUsed: Set<string>
    exportExtensions: GLTFSceneExportExtension[]
  }
): number => {
  for (const extension of context.exportExtensions) extension.beforeNode?.(entity)

  const children = getOptionalComponent(entity, EntityTreeComponent)?.children
  const childrenIndicies = [] as number[]
  if (children && children.length > 0) {
    for (const child of children) {
      childrenIndicies.push(exportGLTFSceneNode(child, gltf, context))
    }
  }

  const index = gltf.nodes!.push({}) - 1
  const node = gltf.nodes![index]

  if (hasComponent(entity, NameComponent)) {
    node.name = getComponent(entity, NameComponent)
  }

  const extensions = {} as Record<string, unknown>
  const components = getAllComponents(entity)
  for (const component of components) {
    for (const extension of context.exportExtensions) extension.beforeComponent?.(entity, component, node, index)

    //skip components that don't have a jsonID
    if (!component.jsonID) continue

    if (component === TransformComponent) {
      const transform = getComponent(entity, TransformComponent)
      const parent = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity
      if (parent) {
        const parentTransform = getComponent(parent, TransformComponent)
        _diffMatrix.copy(parentTransform.matrix).invert().multiply(transform.matrix)
        node.matrix = _transformMatrix.copy(parentTransform.matrix).multiply(_diffMatrix).toArray()
      } else {
        // If no parent, position at identity, but keep scale
        node.matrix = _diffMatrix.identity().scale(transform.scale).toArray()
      }
    } else {
      const compData = serializeComponent(entity, component)
      // Do we not want to serialize tag components?
      if (!compData) continue
      extensions[component.jsonID] = compData
      context.extensionsUsed.add(component.jsonID)
    }

    for (const extension of context.exportExtensions) extension.afterComponent?.(entity, component, node, index)
  }
  if (Object.keys(extensions).length > 0) node.extensions = extensions
  node.children = childrenIndicies

  for (const extension of context.exportExtensions) extension.afterNode?.(entity, node, index)

  return index
}
