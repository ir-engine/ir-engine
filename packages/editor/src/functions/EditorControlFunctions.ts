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
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { EntityUUID, generateEntityUUID, getMutableComponent, SetComponentType, UUIDComponent } from '@ir-engine/ecs'
import {
  Component,
  componentJsonDefaults,
  ComponentJSONIDMap,
  getComponent,
  getOptionalComponent,
  hasComponent,
  SerializedComponentType,
  updateComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { GLTFDocumentState, GLTFModifiedState, GLTFSnapshotAction } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import { GLTFSnapshotState, GLTFSourceState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { TransformSpace } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { ComponentJsonType } from '@ir-engine/engine/src/scene/types/SceneTypes'
import { dispatchAction, getMutableState, getNestedObject, getState } from '@ir-engine/hyperflux'
import { DirectionalLightComponent, HemisphereLightComponent } from '@ir-engine/spatial'
import { MAT4_IDENTITY } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { getMaterial } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import {
  EntityTreeComponent,
  findRootAncestors,
  iterateEntityNode
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { ComponentDropdownState } from '@ir-engine/ui/src/components/editor/ComponentDropdown/ComponentDropdownState.ts'
import { EditorHelperState } from '../services/EditorHelperState'
import { EditorState } from '../services/EditorServices'
import { SelectionState } from '../services/SelectionServices'

const tempMatrix4 = new Matrix4()
const tempVector = new Vector3()

const getSourcesForEntities = (entities: Entity[]) => {
  const scenes: Record<string, Entity[]> = {}
  for (const entity of entities) {
    const sceneID = getComponent(entity, SourceComponent)
    scenes[sceneID] ??= []
    scenes[sceneID].push(entity)
  }
  return scenes
}

const getGLTFNodeByUUID = (gltf: GLTF.IGLTF, uuid: string) => {
  return gltf.nodes?.find((n) => n.extensions?.[UUIDComponent.jsonID] === uuid)
}

const getParentNodeByUUID = (gltf: GLTF.IGLTF, uuid: string) => {
  const nodeIndex = gltf.nodes?.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === uuid)
  if (nodeIndex === undefined || nodeIndex < 0) return
  return gltf.nodes?.find((n) => n.children?.includes(nodeIndex))
}

const hasComponentInAuthoringLayer = <C extends Component<any, any>>(entity: Entity, component: C) => {
  const componentJsonId = component.jsonID
  if (!componentJsonId) return false
  const source = getOptionalComponent(entity, SourceComponent)
  const uuid = getOptionalComponent(entity, UUIDComponent)
  if (!source || !uuid) return false
  const doc = getState(GLTFDocumentState)[source]
  const node = getGLTFNodeByUUID(doc, uuid)
  return node?.extensions?.[componentJsonId] !== undefined
}

const appendToSnapshot = (toAppend: GLTF.IGLTF, parent = getState(EditorState).rootEntity) => {
  if (!toAppend.scenes || !toAppend.nodes) return

  const sceneID = getComponent(parent, SourceComponent)
  const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
  const offset = gltf.data.nodes!.length

  const nodesToAppend = toAppend.scenes[0].nodes
  for (let i = 0; i < nodesToAppend.length; i++) {
    const nodeIndex = nodesToAppend[i]
    const newIndex = appendNode(nodeIndex, toAppend, gltf.data, offset)
    gltf.data.scenes![0].nodes.push(newIndex)
  }

  dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
}

const appendNode = (nodeIndex: number, src: GLTF.IGLTF, dst: GLTF.IGLTF, offset: number): number => {
  const node = src.nodes![nodeIndex]
  const offsetIndex = offset + nodeIndex
  dst.nodes![offsetIndex] = node
  if (node.children) {
    node.children = node.children.map((index) => {
      appendNode(index, src, dst, offset)
      return offset + index
    })
  }

  return offsetIndex
}

const addOrRemoveComponent = <C extends Component<any, any>>(
  entities: Entity[],
  component: C,
  add: boolean,
  args: SetComponentType<C> | undefined = undefined
) => {
  const sceneComponentID = component.jsonID
  if (!sceneComponentID) return

  const scenes = getSourcesForEntities(entities)

  for (const [sceneID, entities] of Object.entries(scenes)) {
    const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
    for (const entity of entities) {
      const entityUUID = getComponent(entity, UUIDComponent)
      const node = getGLTFNodeByUUID(gltf.data, entityUUID)
      if (!node) continue
      if (add) {
        node.extensions![sceneComponentID] = {
          ...componentJsonDefaults(ComponentJSONIDMap.get(sceneComponentID)!),
          ...args
        }
      } else {
        delete node.extensions?.[sceneComponentID]
      }
    }
    dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
  }
}

const modifyName = (entities: Entity[], name: string) => {
  const scenes = getSourcesForEntities(entities)

  for (const [sceneID, entities] of Object.entries(scenes)) {
    const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    for (const entity of entities) {
      const entityUUID = getComponent(entity, UUIDComponent)
      const node = getGLTFNodeByUUID(gltf.data, entityUUID)
      if (!node) continue
      node.name = name
    }

    dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
  }
}

/**
 * Updates each property specified in 'properties' on the component for each of the specified entity nodes
 */
const modifyProperty = <C extends Component<any, any>>(
  entities: Entity[],
  component: C,
  properties: Partial<SerializedComponentType<C>>
) => {
  const scenes = getSourcesForEntities(entities)

  for (const [sceneID, entities] of Object.entries(scenes)) {
    const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    for (const entity of entities) {
      const entityUUID = getComponent(entity, UUIDComponent)
      const node = getGLTFNodeByUUID(gltf.data, entityUUID)
      if (!node) continue
      if (typeof properties === 'string') {
        node.extensions![component.jsonID!] = properties
      } else {
        Object.entries(properties).map(([k, v]) => {
          const { result, finalProp } = getNestedObject(node.extensions![component.jsonID!], k)
          result[finalProp] = v
        })
      }
    }

    dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
  }
}

const modifyMaterial = (nodes: string[], materialId: EntityUUID, properties: { [_: string]: any }[]) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node !== 'string') return
    const material = getMaterial(materialId)
    if (!material) return
    const props = properties[i] ?? properties[0]
    Object.entries(props).map(([k, v]) => {
      if (!material) throw new Error('Updating properties on undefined material')
      if (
        ![undefined, null].includes(v) &&
        ![undefined, null].includes(material[k]) &&
        typeof material[k] === 'object' &&
        typeof material[k].set === 'function'
      ) {
        material[k].set(v)
      } else {
        material[k] = v
      }
    })
    const materialEntity = UUIDComponent.getEntityByUUID(materialId)
    const sceneID = getComponent(materialEntity, SourceComponent)
    getMutableState(GLTFModifiedState)[sceneID].set(true)
    material.needsUpdate = true
  }
}

const overwriteLookdevObject = (
  beforeComponentJson: ComponentJsonType[] = [],
  componentJson: ComponentJsonType[] = [],
  parentEntity = getState(EditorState).rootEntity,
  beforeEntity?: Entity
) => {
  const scenes = getSourcesForEntities([parentEntity])
  const entityUUID =
    componentJson.find((comp) => comp.name === UUIDComponent.jsonID)?.props.uuid ?? generateEntityUUID()

  for (const [sceneID, entities] of Object.entries(scenes)) {
    const name = 'Lookdev Object'
    if (getState(GLTFSourceState)[sceneID]) {
      const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
      const extensions = {} as Record<string, any>
      for (const comp of componentJson) {
        extensions[comp.name] = {
          ...componentJsonDefaults(ComponentJSONIDMap.get(comp.name)!),
          ...comp.props
        }
      }
      //check lookdev entity
      const lookDevComponent: Component[] = [
        SkyboxComponent,
        HemisphereLightComponent,
        DirectionalLightComponent,
        PostProcessingComponent
      ]
      let overwrited = false
      for (const comp of lookDevComponent) {
        if (extensions[comp.jsonID as string]) {
          const index = gltf.data.nodes?.findIndex((n) => n.extensions?.[comp.jsonID as string] !== undefined) as number
          if (typeof index === 'number' && index > -1) {
            if (gltf.data.nodes !== undefined) {
              gltf.data.nodes[index].extensions![comp.jsonID as string] = extensions[comp.jsonID as string]
              overwrited = true
            }
          }
        }
      }
      if (!overwrited) {
        //if no lookdev object found then create new object
        createObjectFromSceneElement(beforeComponentJson, parentEntity, beforeEntity)
      } else {
        dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
      }
    }
  }
}
const createObjectFromSceneElement = (
  componentJson: ComponentJsonType[] = [],
  parentEntity = getState(EditorState).rootEntity,
  beforeEntity?: Entity,
  requestedName?: string
): { entityUUID: EntityUUID; sceneID: string } => {
  const scenes = getSourcesForEntities([parentEntity])
  const entityUUID: EntityUUID =
    componentJson.find((comp) => comp.name === UUIDComponent.jsonID)?.props.uuid ?? generateEntityUUID()
  const sceneIDUsed = Object.keys(scenes)[0]
  for (const [sceneID, entities] of Object.entries(scenes)) {
    let name = 'New Object'
    if (requestedName) {
      name = requestedName
    }
    const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    const nodeIndex = gltf.data.nodes!.length

    const extensions = {} as Record<string, any>
    for (const comp of componentJson) {
      extensions[comp.name] = {
        ...componentJsonDefaults(ComponentJSONIDMap.get(comp.name)!),
        ...comp.props
      }
    }
    if (!extensions[UUIDComponent.jsonID]) {
      extensions[UUIDComponent.jsonID] = entityUUID
    }
    if (!extensions[VisibleComponent.jsonID]) {
      extensions[VisibleComponent.jsonID] = true
    }

    const node = {
      name,
      extensions
    } as GLTF.INode

    gltf.data.nodes!.push(node)

    if (extensions[TransformComponent.jsonID]) {
      const comp = {
        ...componentJsonDefaults(TransformComponent),
        ...extensions[TransformComponent.jsonID]
      }
      const matrix = tempMatrix4.compose(
        new Vector3().copy(comp.position),
        new Quaternion().copy(comp.rotation),
        new Vector3().copy(comp.scale)
      )
      delete extensions[TransformComponent.jsonID]
      if (!matrix.equals(MAT4_IDENTITY)) node.matrix = matrix.toArray()
    }

    if (parentEntity === getState(EditorState).rootEntity) {
      const sceneIndex = 0 // TODO: how should this work? gltf.data.scenes!.findIndex((s) => s.nodes.includes(nodeIndex))

      let beforeIndex = gltf.data.scenes![sceneIndex].nodes.length
      if (typeof beforeEntity === 'number') {
        const beforeUUID = getComponent(beforeEntity, UUIDComponent)
        const beforeNodeIndex = gltf.data.nodes?.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === beforeUUID)
        if (typeof beforeNodeIndex === 'number' && beforeNodeIndex > -1) {
          beforeIndex = gltf.data.scenes![sceneIndex].nodes.indexOf(beforeNodeIndex)
        }
      }

      gltf.data.scenes![sceneIndex].nodes.splice(beforeIndex, 0, nodeIndex)
    } else {
      const parentUUID = getComponent(parentEntity, UUIDComponent)
      const parentNode = getGLTFNodeByUUID(gltf.data, parentUUID)
      if (!parentNode) continue
      if (!parentNode.children) parentNode.children = []
      let beforeIndex = 0
      if (typeof beforeEntity === 'number') {
        const beforeUUID = getComponent(beforeEntity, UUIDComponent)
        const beforeNodeIndex = gltf.data.nodes?.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === beforeUUID)
        if (typeof beforeNodeIndex == 'number' && beforeNodeIndex > -1) {
          beforeIndex = parentNode.children.indexOf(beforeNodeIndex)
        }
      }
      parentNode.children.splice(beforeIndex, 0, nodeIndex)
    }
    dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
  }
  return { entityUUID, sceneID: sceneIDUsed }
}

/**
 * @todo copying an object should be rooted to which object is currently selected
 */
const duplicateObject = (entities: Entity[]) => {
  const scenes = getSourcesForEntities(entities)
  const copyMap = {} as { [entityUUID: EntityUUID]: EntityUUID }

  for (const [sceneID, entities] of Object.entries(scenes)) {
    const rootEntities = findRootAncestors(entities)

    const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    /** Depth first */
    const duplicateNode = (entity: Entity) => {
      const entityUUID = getComponent(entity, UUIDComponent)
      const nodeIndex = gltf.data.nodes!.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === entityUUID)
      const node = gltf.data.nodes![nodeIndex]

      const newChildren = [] as number[]
      if (node.children) {
        for (const childIndex of node.children) {
          const childNode = gltf.data.nodes![childIndex]
          const childEntityUUID = childNode.extensions![UUIDComponent.jsonID] as EntityUUID
          const newChildIndex = duplicateNode(UUIDComponent.getEntityByUUID(childEntityUUID))
          newChildren.push(newChildIndex)
        }
      }

      const entityDataClone = structuredClone(node)
      const newUUID = generateEntityUUID()
      copyMap[entityUUID] = newUUID
      entityDataClone.extensions![UUIDComponent.jsonID] = newUUID
      if (newChildren.length) entityDataClone.children = newChildren

      gltf.data.nodes!.push(entityDataClone)

      const newIndex = gltf.data.nodes!.length - 1

      return newIndex
    }

    for (const rootEntity of rootEntities) {
      const entityUUID = getComponent(rootEntity, UUIDComponent)
      const originalIndex = gltf.data.nodes!.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === entityUUID)
      const newIndex = duplicateNode(rootEntity)

      const sceneIndex = gltf.data.scenes!.findIndex((s) => s.nodes.includes(originalIndex))

      if (sceneIndex > -1) {
        gltf.data.scenes![sceneIndex].nodes.push(newIndex)
      } else {
        const parentEntity = getComponent(rootEntity, EntityTreeComponent).parentEntity
        if (!parentEntity) throw new Error('Root entity must have a parent')
        const parentEntityUUID = getComponent(parentEntity, UUIDComponent)
        const parentNode = getGLTFNodeByUUID(gltf.data, parentEntityUUID)
        if (!parentNode) throw new Error('Parent node not found')
        if (!parentNode.children) parentNode.children = []
        parentNode.children.push(newIndex)
      }
    }

    dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
  }
}

const applyTransformToChildren = (entity: Entity) => {
  iterateEntityNode(entity, (entity) => {
    if (!hasComponent(entity, TransformComponent)) return
    computeTransformMatrix(entity)
    TransformComponent.dirtyTransforms[entity] = true
  })
}

const positionObject = (
  nodes: Entity[],
  positions: Vector3[],
  space = getState(EditorHelperState).transformSpace,
  addToPosition?: boolean
) => {
  for (let i = 0; i < nodes.length; i++) {
    const entity = nodes[i]
    const pos = positions[i] ?? positions[0]

    const transform = getComponent(entity, TransformComponent)

    if (space === TransformSpace.local) {
      if (addToPosition) transform.position.add(pos)
      else transform.position.copy(pos)
    } else {
      const entityTreeComponent = getComponent(entity, EntityTreeComponent)
      const parentTransform = entityTreeComponent.parentEntity
        ? getComponent(entityTreeComponent.parentEntity, TransformComponent)
        : transform

      tempVector.set(0, 0, 0)
      if (addToPosition) {
        tempVector.setFromMatrixPosition(transform.matrixWorld)
      }
      tempVector.add(pos)

      const _spaceMatrix = parentTransform.matrixWorld
      tempMatrix4.copy(_spaceMatrix).invert()
      tempVector.applyMatrix4(tempMatrix4)

      transform.position.copy(tempVector)
    }

    updateComponent(entity, TransformComponent, { position: transform.position })

    applyTransformToChildren(entity)
  }
}

const T_QUAT_1 = new Quaternion()
const T_QUAT_2 = new Quaternion()

const rotateObject = (nodes: Entity[], rotations: Quaternion[], space = getState(EditorHelperState).transformSpace) => {
  for (let i = 0; i < nodes.length; i++) {
    const entity = nodes[i]
    T_QUAT_1.copy(rotations[i] ?? rotations[0])
    const euler = new Euler().setFromQuaternion(T_QUAT_1, 'YXZ')

    const transform = getComponent(entity, TransformComponent)

    if (space === TransformSpace.local) {
      transform.rotation.copy(T_QUAT_1)
    } else {
      const entityTreeComponent = getComponent(entity, EntityTreeComponent)
      const parentTransform = entityTreeComponent.parentEntity
        ? getComponent(entityTreeComponent.parentEntity, TransformComponent)
        : transform

      const _spaceMatrix = parentTransform.matrixWorld

      const inverseParentWorldQuaternion = T_QUAT_2.setFromRotationMatrix(_spaceMatrix).invert()
      const newLocalQuaternion = inverseParentWorldQuaternion.multiply(T_QUAT_1)
      euler.copy(new Euler().setFromQuaternion(newLocalQuaternion, 'YXZ'))

      transform.rotation.copy(newLocalQuaternion)
    }

    updateComponent(entity, TransformComponent, { rotation: transform.rotation })

    applyTransformToChildren(entity)
  }
}

const rotateAround = (entities: Entity[], axis: Vector3, angle: number, pivot: Vector3) => {
  const pivotToOriginMatrix = new Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z)
  const originToPivotMatrix = new Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z)
  const rotationMatrix = new Matrix4().makeRotationAxis(axis, angle)

  for (const entity of entities) {
    const transform = getComponent(entity, TransformComponent)
    const entityTreeComponent = getComponent(entity, EntityTreeComponent)
    const parentTransform = entityTreeComponent.parentEntity
      ? getComponent(entityTreeComponent.parentEntity, TransformComponent)
      : transform

    tempMatrix4
      .copy(transform.matrixWorld)
      .premultiply(pivotToOriginMatrix)
      .premultiply(rotationMatrix)
      .premultiply(originToPivotMatrix)
      .premultiply(tempMatrix4.copy(parentTransform.matrixWorld).invert())
      .decompose(transform.position, transform.rotation, transform.scale)

    updateComponent(entity, TransformComponent, { rotation: transform.rotation })
  }
}

const scaleObject = (entities: Entity[], scales: Vector3[], overrideScale = false) => {
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    const scale = scales[i] ?? scales[0]

    const transformComponent = getComponent(entity, TransformComponent)

    if (overrideScale) {
      transformComponent.scale.copy(scale)
    } else {
      transformComponent.scale.multiply(scale)
    }

    transformComponent.scale.set(
      transformComponent.scale.x === 0 ? Number.EPSILON : transformComponent.scale.x,
      transformComponent.scale.y === 0 ? Number.EPSILON : transformComponent.scale.y,
      transformComponent.scale.z === 0 ? Number.EPSILON : transformComponent.scale.z
    )

    updateComponent(entity, TransformComponent, { scale: transformComponent.scale })
  }
}

const reparentObject = (
  entities: Entity[],
  before?: Entity | null,
  after?: Entity | null,
  parent = getState(EditorState).rootEntity
) => {
  const scenes = getSourcesForEntities(entities)

  for (const [sceneID, entities] of Object.entries(scenes)) {
    const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    for (const entity of entities) {
      if (entity === parent) continue

      const entityUUID = getComponent(entity, UUIDComponent)
      const nodeIndex = gltf.data.nodes!.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === entityUUID)

      // Ensure the entity Transform remains unmodified when reparented
      const node = getGLTFNodeByUUID(gltf.data, entityUUID) // Get the GLTF Node for the entity
      if (node) {
        // Get the transforms for both entitites
        const parentTransform = getComponent(parent, TransformComponent)
        const entityTransform = getComponent(entity, TransformComponent)
        // Calculate the new matrix relative to the new parent entity, and apply the matrix to its GLTF node.matrix
        node.matrix = tempMatrix4
          .copy(entityTransform.matrixWorld)
          .premultiply(parentTransform.matrixWorld.clone().invert())
          .toArray()
      }

      const newParentUUID = getComponent(parent, UUIDComponent)
      const isNewParentRoot = parent === getState(EditorState).rootEntity

      const entityTreeComponent = getMutableComponent(entity, EntityTreeComponent)
      const oldParent = entityTreeComponent.parentEntity.value
      const isOldParentRoot = oldParent === getState(EditorState).rootEntity
      const oldParentUUID = getComponent(oldParent, UUIDComponent)

      if (entityTreeComponent.parentEntity.value != parent) {
        entityTreeComponent.parentEntity.set(parent)
      }

      // gltf.data.scenes![0].nodes is the child array of the root parent
      // newParentNode.children is the child array of a non root parent
      // gltf.data.nodes is the node data used for reference, its index should not change, unless it is a child on the root parent, then it is used to order the root parent's children

      //build a index ref table for the lookup table to be used to correct child index value and maintain data integrity
      let indexConvertArray: number[] = []
      gltf.data.nodes?.forEach((value, index) => {
        indexConvertArray.push(index)
      })

      //if the new parent is the root parent, update the look up table since it is used for root parent child order
      //update the index conver array to match so it can be used later to correct child index value and maintain data integrity
      if (isNewParentRoot && gltf.data.nodes) {
        if (before) {
          const nodeData = gltf.data.nodes.splice(nodeIndex, 1)
          indexConvertArray.splice(nodeIndex, 1)
          const beforeNodeIndex = gltf.data.nodes.findIndex((n) => {
            return n.extensions?.[UUIDComponent.jsonID] === getComponent(before, UUIDComponent)
          })
          gltf.data.nodes.splice(beforeNodeIndex, 0, nodeData![0])
          indexConvertArray.splice(beforeNodeIndex, 0, nodeIndex)
        } else {
          if (after) {
            const afterNodeIndex = gltf.data.nodes.findIndex((n) => {
              return n.extensions?.[UUIDComponent.jsonID] === getComponent(after, UUIDComponent)
            })
            const afterIndex = gltf.data.scenes![0].nodes.findIndex((n) => {
              return n === afterNodeIndex
            })

            if (gltf.data.scenes![0].nodes.length > afterIndex + 1) {
              let spliceIndex = gltf.data.scenes![0].nodes[afterIndex + 1]
              if (nodeIndex < spliceIndex) {
                spliceIndex -= 1
              }

              const nodeData = gltf.data.nodes.splice(nodeIndex, 1)
              indexConvertArray.splice(nodeIndex, 1)

              gltf.data.nodes.splice(spliceIndex, 0, nodeData![0])
              indexConvertArray.splice(spliceIndex, 0, nodeIndex)
            } else {
              //last index, just push
              const nodeData = gltf.data.nodes.splice(nodeIndex, 1)
              indexConvertArray.splice(nodeIndex, 1)
              gltf.data.nodes?.push(nodeData![0])
              indexConvertArray.push(nodeIndex)
            }
          } else {
            const nodeData = gltf.data.nodes.splice(nodeIndex, 1)
            indexConvertArray.splice(nodeIndex, 1)
            gltf.data.nodes?.push(nodeData![0])
            indexConvertArray.push(nodeIndex)
          }
        }
      }

      // make the old parent children array into a homoginize ref
      let oldParentChildArray = gltf.data.scenes![0].nodes
      if (!isOldParentRoot) {
        const oldParentNode = getGLTFNodeByUUID(gltf.data, oldParentUUID)
        if (oldParentNode) {
          if (!oldParentNode.children) oldParentNode.children = []
          oldParentChildArray = oldParentNode.children
        }
      }

      // make the new parent children array into a homoginize ref
      let newParentChildArray = gltf.data.scenes![0].nodes
      if (!isNewParentRoot) {
        const newParentNode = getGLTFNodeByUUID(gltf.data, newParentUUID)
        if (newParentNode) {
          if (!newParentNode.children) newParentNode.children = []
          newParentChildArray = newParentNode.children
        }
      }

      //remove from old parent's child array
      const oldParentChildIndex = oldParentChildArray.findIndex((i) => {
        return i === nodeIndex
      })
      if (oldParentChildIndex >= 0) {
        oldParentChildArray.splice(oldParentChildIndex, 1)
      }

      //add to new parent's child array
      if (before) {
        const beforeUuid = getComponent(before, UUIDComponent)
        const beforeNodeIndex = gltf.data.nodes!.findIndex((n) => {
          const nUuid = n.extensions?.[UUIDComponent.jsonID]
          return nUuid === beforeUuid
        })
        const beforeIndex = newParentChildArray.findIndex((n) => {
          return n === beforeNodeIndex
        })
        newParentChildArray.splice(beforeIndex, 0, nodeIndex)
      } else {
        newParentChildArray.push(nodeIndex)
      }

      //loop through the root parent children and update the child index values
      gltf.data.scenes![0].nodes.forEach((value, index) => {
        gltf.data.scenes![0].nodes[index] = indexConvertArray.indexOf(value)
      })

      //loop through the children of the parent nodes and update the child index values
      gltf.data.nodes?.forEach((value, index) => {
        const loopParentUuid: string = String(value.extensions?.[UUIDComponent.jsonID])
        const loopParentNode = getGLTFNodeByUUID(gltf.data, loopParentUuid)
        if (loopParentNode) {
          if (loopParentNode.children) {
            loopParentNode.children?.forEach((value, index) => {
              if (loopParentNode.children) {
                loopParentNode.children[index] = indexConvertArray.indexOf(value)
              }
            })
          }
        }
      })
    }

    dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
  }
}

/** @todo - grouping currently doesnt take into account parentEntity or beforeEntity */
const groupObjects = (entities: Entity[]) => {
  /**
   * @todo how does grouping work across multiple sources?
   * - it works by modifying both sources
   */

  const scenes = getSourcesForEntities(entities)
  const newGroupUUIDs = {} as Record<number, EntityUUID>

  for (const [sceneID, entities] of Object.entries(scenes)) {
    const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

    /** 1. create new group node */
    const groupNode: GLTF.INode = {
      name: 'New Group',
      extensions: {
        [UUIDComponent.jsonID]: generateEntityUUID(),
        // TODO figure out where the new position should be
        [TransformComponent.jsonID]: componentJsonDefaults(TransformComponent),
        [VisibleComponent.jsonID]: true
      }
    }

    newGroupUUIDs[sceneID] = groupNode.extensions![UUIDComponent.jsonID]

    const groupIndex = gltf.data.nodes!.push(groupNode) - 1

    const positions = entities.map((entity) => getComponent(entity, TransformComponent).position)

    const groupPosition = positions.reduce((acc, pos) => acc.add(pos), new Vector3()).divideScalar(entities.length)
    //const groupRotation = averageQuaternions(rotations)

    const averageTransform = new Matrix4().compose(groupPosition, new Quaternion().identity(), new Vector3(1, 1, 1))

    groupNode.matrix = averageTransform.toArray()

    /** For each node being added to the group */
    for (const entity of entities) {
      const entityUUID = getComponent(entity, UUIDComponent)
      const node = getGLTFNodeByUUID(gltf.data, entityUUID)!

      const nodeMatrix = node.matrix ? new Matrix4().fromArray(node.matrix) : new Matrix4().identity()
      //subtract the average transform from the node's transform to get the relative transform
      const relativeTransform = nodeMatrix.clone().premultiply(averageTransform.clone().invert())
      node.matrix = relativeTransform.toArray()

      const nodeIndex = gltf.data.nodes!.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === entityUUID)

      /** 2. remove node from current parent */
      const isCurrentlyChildOfRoot = gltf.data.scenes![0].nodes.includes(nodeIndex)
      if (isCurrentlyChildOfRoot) {
        gltf.data.scenes![0].nodes.splice(gltf.data.scenes![0].nodes.indexOf(nodeIndex), 1)
      } else {
        const currentParentNode = getParentNodeByUUID(gltf.data, entityUUID)
        if (!currentParentNode) continue
        const currentParentNodeIndex = currentParentNode.children!.indexOf(nodeIndex)
        currentParentNode.children!.splice(currentParentNodeIndex, 1)
      }

      /** 3. add node to new group */
      const groupNode = gltf.data.nodes![groupIndex]
      if (!groupNode.children) groupNode.children = []
      groupNode.children.push(nodeIndex)
    }

    gltf.data.scenes![0].nodes.push(groupIndex)

    dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
  }
}

const removeObject = (entities: Entity[]) => {
  /** we have to manually set this here or it will cause react errors when entities are removed */
  getMutableState(SelectionState).selectedEntities.set([])

  const scenes = getSourcesForEntities(entities)

  for (const [sceneID, entities] of Object.entries(scenes)) {
    const uuidsToRemove = new Set(entities.map((entity) => getComponent(entity, UUIDComponent)))
    const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
    const gltfData = gltf.data

    ComponentDropdownState.removeEntityUUIDs([...uuidsToRemove])
    const nodesToRemove = collectNodesToRemove(gltf.data, uuidsToRemove)
    removeNodes(gltfData, nodesToRemove)
    compactNodes(gltfData)

    dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
  }
}

const collectNodesToRemove = (gltfData: GLTF.IGLTF, uuidsToRemove: Set<EntityUUID>): Set<number> => {
  const nodesToRemove = new Set<number>()

  const collectDescendants = (nodeIndex: number) => {
    nodesToRemove.add(nodeIndex)
    const node = gltfData.nodes![nodeIndex]
    node.children?.forEach(collectDescendants)
  }

  gltfData.nodes!.forEach((node, index) => {
    const nodeUUID = node.extensions?.[UUIDComponent.jsonID] as EntityUUID
    if (uuidsToRemove.has(nodeUUID)) {
      collectDescendants(index)
    }
  })

  return nodesToRemove
}

const removeNodes = (gltfData: GLTF.IGLTF, nodesToRemove: Set<number>) => {
  for (let i = gltfData.nodes!.length - 1; i >= 0; i--) {
    if (nodesToRemove.has(i)) {
      removeNodeReferences(gltfData, i)
      gltfData.nodes![i] = null as any
    }
  }
}

// removes all references to a specific node from the gltfData
const removeNodeReferences = (gltfData: GLTF.IGLTF, nodeIndex: number) => {
  gltfData.nodes!.forEach((node) => {
    if (node && node.children) {
      node.children = node.children.filter((childIndex) => childIndex !== nodeIndex)
    }
  })
  gltfData.scenes![0].nodes = gltfData.scenes![0].nodes.filter((index) => index !== nodeIndex)
}

// remove null nodes from the gltfData and update the indices of the remaining nodes
const compactNodes = (gltfData: GLTF.IGLTF) => {
  let offset = 0
  const oldToNewIndex = new Map<number, number>()

  gltfData.nodes = gltfData.nodes!.filter((node, i) => {
    if (node === null) {
      offset++
      return false
    }
    oldToNewIndex.set(i, i - offset)
    return true
  })

  // update the node references in gltfData after some nodes have been removed
  updateNodeReferences(gltfData, oldToNewIndex)
}

// ensures that all references to node indices (both in parent-child relationships and in the scene's root nodes) are updated to reflect the new, compacted structure of the nodes array
const updateNodeReferences = (gltfData: GLTF.IGLTF, oldToNewIndex: Map<number, number>) => {
  gltfData.nodes!.forEach((node) => {
    if (node.children) {
      node.children = node.children.map((childIndex) => oldToNewIndex.get(childIndex)!)
    }
  })
  gltfData.scenes![0].nodes = gltfData.scenes![0].nodes.map((index) => oldToNewIndex.get(index)!)
}

const replaceSelection = (entities: EntityUUID[]) => {
  const current = getMutableState(SelectionState).selectedEntities.value

  if (entities.length === current.length) {
    let same = true
    for (let i = 0; i < entities.length; i++) {
      if (!current.includes(entities[i])) {
        same = false
        break
      }
    }
    if (same) return
  }

  SelectionState.updateSelection(entities)
}

const toggleSelection = (entities: EntityUUID[]) => {
  const selectedEntities = getMutableState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    const index = selectedEntities.indexOf(entity)

    if (index > -1) {
      selectedEntities.splice(index, 1)
    } else {
      selectedEntities.push(entity)
    }
  }

  SelectionState.updateSelection(selectedEntities)
}

const addToSelection = (entities: EntityUUID[]) => {
  const selectedEntities = getMutableState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < entities.length; i++) {
    const object = entities[i]
    if (selectedEntities.includes(object)) continue
    selectedEntities.push(object)
  }

  SelectionState.updateSelection(entities)
}

const commitTransformSave = (entities: Entity[]) => {
  const scenes = getSourcesForEntities(entities)
  for (const sceneID of Object.keys(scenes)) {
    const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
    for (const entity of entities) {
      const entityUUID = getComponent(entity, UUIDComponent)
      const node = getGLTFNodeByUUID(gltf.data, entityUUID)
      if (!node) continue
      const transform = getComponent(entity, TransformComponent)
      const position = transform.position
      const rotation = transform.rotation
      const scale = transform.scale
      const matrix = tempMatrix4.compose(position, rotation, scale)
      node.matrix = matrix.toArray()
    }
    dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
  }
}

export const EditorControlFunctions = {
  appendToSnapshot,
  addOrRemoveComponent,
  hasComponentInAuthoringLayer,
  modifyProperty,
  modifyName,
  modifyMaterial,
  createObjectFromSceneElement,
  duplicateObject,
  positionObject,
  rotateObject,
  rotateAround,
  scaleObject,
  reparentObject,
  groupObjects,
  removeObject,
  addToSelection,
  replaceSelection,
  toggleSelection,
  commitTransformSave,
  overwriteLookdevObject
}
