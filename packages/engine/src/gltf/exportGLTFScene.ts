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
import { EntityTreeComponent } from '@ir-engine/ecs'
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
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Matrix4, Mesh } from 'three'
import createGLTFExporter from '../assets/functions/createGLTFExporter'
import { cleanStorageProviderURLs } from '../assets/functions/parseSceneJSON'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFComponent } from './GLTFComponent'
import { appendGLTF } from './gltfUtils'

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
      const source = GLTFComponent.getInstanceID(entity)
      const children = getOptionalComponent(entity, EntityTreeComponent)?.children
      if (children && children.length) {
        const removed: Entity[] = []
        const toKeep: Entity[] = []
        for (const child of children) {
          if (getOptionalComponent(child, SourceComponent) === source) removed.push(child)
          else toKeep.push(child)
        }
        this.entityChildrenCache[entity] = removed
        getMutableComponent(entity, EntityTreeComponent).children.set(toKeep)
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

type GLTFSceneExportContext = {
  extensionsUsed: Set<string>
  exportExtensions: GLTFSceneExportExtension[]
  projectName: string
  relativePath: string
}

export type ExportExtension = new () => GLTFSceneExportExtension

export const defaultExportExtensionList = [
  IgnoreGLTFComponentExportExtension,
  RemoveRootNodeParentExportExtension
] as ExportExtension[]

export async function exportGLTFScene(
  entity: Entity,
  projectName: string,
  relativePath: string,
  exportRoot = true,
  exportExtensionTypes: ExportExtension[] = defaultExportExtensionList
) {
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
    exportExtensions,
    projectName,
    relativePath
  }

  if (exportRoot) {
    const rootIndex = await exportGLTFSceneNode(entity, gltf, context)
    rootIndex && gltf.scenes![0].nodes.push(rootIndex)
  } else {
    const indices: number[] = []
    const children = getComponent(entity, EntityTreeComponent).children
    for (const child of children) {
      const index = await exportGLTFSceneNode(child, gltf, context)
      index && indices.push(index)
    }
    gltf.scenes![0].nodes.push(...indices)
  }

  if (context.extensionsUsed.size) gltf.extensionsUsed = [...context.extensionsUsed]
  cleanStorageProviderURLs(gltf)

  for (const extension of exportExtensions) extension.after?.(entity, gltf)

  return gltf
}

const _diffMatrix = new Matrix4()
const _transformMatrix = new Matrix4()

const exportMesh = async (mesh: Mesh, gltf: GLTF.IGLTF, context: GLTFSceneExportContext) => {
  return new Promise<GLTF.INode>((resolve, reject) => {
    const exporter = createGLTFExporter()
    exporter.parse(
      mesh,
      (meshGLTF: GLTF.IGLTF) => {
        console.log(gltf)
        appendGLTF(meshGLTF, gltf)
        const dstNode = gltf.nodes!.at(-1)!
        resolve(dstNode)
      },
      reject,
      {
        projectName: context.projectName,
        relativePath: context.relativePath,
        onlyVisible: false,
        includeCustomExtensions: false,
        embedImages: false
      }
    )
  })
}

const exportGLTFSceneNode = async (
  entity: Entity,
  gltf: GLTF.IGLTF,
  context: GLTFSceneExportContext
): Promise<number | void> => {
  for (const extension of context.exportExtensions) extension.beforeNode?.(entity)

  //ignore material entities as they get exported in exportMesh
  const materialComponent = getOptionalComponent(entity, MaterialStateComponent)
  if (materialComponent) return

  const children = getOptionalComponent(entity, EntityTreeComponent)?.children
  const childrenIndicies = [] as number[]
  if (children && children.length > 0) {
    for (const child of children) {
      const childIndex = await exportGLTFSceneNode(child, gltf, context)
      childIndex && childrenIndicies.push(childIndex)
    }
  }

  let node: GLTF.INode = {}

  const meshComponent = getOptionalComponent(entity, MeshComponent)
  if (meshComponent && !meshComponent.userData['ignoreOnExport']) {
    node = await exportMesh(meshComponent, gltf, context)
  } else {
    gltf.nodes!.push(node)
  }

  const index = gltf.nodes!.length - 1

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
    } else if (component === MeshComponent) {
      continue
      // const mesh = getComponent(entity, MeshComponent)
      // if (mesh.userData['ignoreOnExport']) continue
      // // might need to do something with the mesh scale first
      // await exportMesh(mesh, gltf, context)
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
