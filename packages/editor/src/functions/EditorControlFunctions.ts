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

import { getNestedObject } from '@etherealengine/common/src/utils/getNestedProperty'
import { EntityUUID, UUIDComponent, createEntity, generateEntityUUID, removeEntity } from '@etherealengine/ecs'
import {
  Component,
  ComponentJSONIDMap,
  SerializedComponentType,
  componentJsonDefaults,
  getComponent,
  hasComponent,
  removeComponent,
  serializeComponent,
  setComponent,
  updateComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { GLTFSnapshotAction } from '@etherealengine/engine/src/scene/GLTFDocumentState'
import { GLTFSnapshotState, GLTFSourceState } from '@etherealengine/engine/src/scene/GLTFState'
import { SceneSnapshotAction, SceneSnapshotState, SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { TransformSpace } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { serializeEntity } from '@etherealengine/engine/src/scene/functions/serializeWorld'
import { ComponentJsonType } from '@etherealengine/engine/src/scene/types/SceneTypes'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { getMaterial } from '@etherealengine/spatial/src/renderer/materials/materialFunctions'
import {
  EntityTreeComponent,
  findCommonAncestors,
  iterateEntityNode,
  traverseEntityNode
} from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { computeTransformMatrix } from '@etherealengine/spatial/src/transform/systems/TransformSystem'
import { GLTF } from '@gltf-transform/core'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'
import { EditorHelperState } from '../services/EditorHelperState'
import { EditorState } from '../services/EditorServices'
import { SelectionState } from '../services/SelectionServices'
import { filterParentEntities } from './filterParentEntities'

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
  if (!nodeIndex || nodeIndex < 0) return
  return gltf.nodes?.find((n) => n.children?.includes(nodeIndex))
}

const addOrRemoveComponent = <C extends Component<any, any>>(entities: Entity[], component: C, add: boolean) => {
  const sceneComponentID = component.jsonID
  if (!sceneComponentID) return

  const scenes = getSourcesForEntities(entities)

  for (const [sceneID, entities] of Object.entries(scenes)) {
    if (getState(GLTFSourceState)[sceneID]) {
      const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
      for (const entity of entities) {
        const entityUUID = getComponent(entity, UUIDComponent)
        const node = getGLTFNodeByUUID(gltf.data, entityUUID)
        if (!node) continue
        if (add) {
          node.extensions![sceneComponentID] = componentJsonDefaults(ComponentJSONIDMap.get(sceneComponentID)!)
        } else {
          delete node.extensions?.[sceneComponentID]
        }
      }
      dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
    } else {
      const newSnapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)

      for (const entity of entities) {
        const entityUUID = getComponent(entity, UUIDComponent)
        let componentData = newSnapshot.data.entities[entityUUID]?.components
        if (!componentData) continue
        if (add) {
          componentData = componentData.filter((c) => c.name !== sceneComponentID)
          componentData.push({
            name: sceneComponentID,
            props: componentJsonDefaults(ComponentJSONIDMap.get(sceneComponentID)!)
          })
        } else {
          const index = componentData.findIndex((c) => c.name === sceneComponentID)
          if (index > -1) componentData.splice(index, 1)
        }
        newSnapshot.data.entities[entityUUID].components = componentData
      }

      dispatchAction(SceneSnapshotAction.createSnapshot(newSnapshot))
    }
    /** Temporary until GLTF loader refactored */
    for (const entity of entities) {
      if (add) {
        setComponent(entity, component)
      } else {
        removeComponent(entity, component)
      }
    }
  }
}

export const testst = {
  setComponent: function () {}
}

const modifyName = (entities: Entity[], name: string) => {
  const scenes = getSourcesForEntities(entities)

  for (const [sceneID, entities] of Object.entries(scenes)) {
    if (getState(GLTFSourceState)[sceneID]) {
      const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

      for (const entity of entities) {
        const entityUUID = getComponent(entity, UUIDComponent)
        const node = getGLTFNodeByUUID(gltf.data, entityUUID)
        if (!node) continue
        node.name = name
      }

      dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
    } else {
      const newSnapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)

      for (const entity of entities) {
        const entityUUID = getComponent(entity, UUIDComponent)
        const entityData = newSnapshot.data.entities[entityUUID]
        if (!entityData) continue
        entityData.name = name
      }

      dispatchAction(SceneSnapshotAction.createSnapshot(newSnapshot))
    }

    /** Temporary until GLTF loader refactored */
    for (const entity of entities) {
      setComponent(entity, NameComponent, name)
    }
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
    if (getState(GLTFSourceState)[sceneID]) {
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
    } else {
      const newSnapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)

      for (const entity of entities) {
        setComponent(entity, component, properties)
        const entityUUID = getComponent(entity, UUIDComponent)
        const componentSnapshot = newSnapshot.data.entities[entityUUID].components.find(
          (c) => c.name === component.jsonID
        )
        if (!componentSnapshot) continue
        if (typeof properties === 'string') {
          componentSnapshot.props = properties
        } else {
          Object.entries(properties).map(([k, v]) => {
            const { result, finalProp } = getNestedObject(componentSnapshot.props, k)
            result[finalProp] = v
          })
        }
      }

      dispatchAction(SceneSnapshotAction.createSnapshot(newSnapshot))
    }

    /** Temporary until GLTF loader refactored */
    for (const entity of entities) {
      setComponent(entity, component, properties)
    }
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
    material.needsUpdate = true
  }
}

const createObjectFromSceneElement = (
  componentJson: ComponentJsonType[] = [],
  parentEntity = getState(EditorState).rootEntity,
  beforeEntity?: Entity
) => {
  const scenes = getSourcesForEntities([parentEntity])
  const entityUUID =
    componentJson.find((comp) => comp.name === UUIDComponent.jsonID)?.props.uuid ?? generateEntityUUID()

  for (const [sceneID, entities] of Object.entries(scenes)) {
    // gltf loader sanitizers names...
    const name = getState(GLTFSourceState)[sceneID] ? 'New_Object' : 'New Object'
    if (getState(GLTFSourceState)[sceneID]) {
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
      if (!extensions[TransformComponent.jsonID]) {
        extensions[TransformComponent.jsonID] = componentJsonDefaults(TransformComponent)
      }
      if (!extensions[VisibleComponent.jsonID]) {
        extensions[VisibleComponent.jsonID] = true
      }

      gltf.data.nodes!.push({
        name,
        extensions
      })

      if (parentEntity === getState(EditorState).rootEntity) {
        const sceneIndex = gltf.data.scenes!.findIndex((s) => s.nodes.includes(nodeIndex))

        let beforeIndex = 0
        if (typeof beforeEntity === 'number') {
          const beforeUUID = getComponent(beforeEntity, UUIDComponent)
          const beforeNodeIndex = gltf.data.nodes?.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === beforeUUID)
          if (beforeNodeIndex && beforeNodeIndex > -1) {
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
          if (beforeNodeIndex && beforeNodeIndex > -1) {
            beforeIndex = parentNode.children.indexOf(beforeNodeIndex)
          }
        }
        parentNode.children.splice(beforeIndex, 0, nodeIndex)
      }

      dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
    } else {
      let childIndex = 0
      if (typeof beforeEntity === 'number') {
        const beforeNode = getComponent(beforeEntity, EntityTreeComponent)
        if (beforeNode?.parentEntity && hasComponent(beforeNode.parentEntity, EntityTreeComponent)) {
          childIndex = getComponent(beforeNode.parentEntity, EntityTreeComponent).children.indexOf(beforeEntity)
        }
      } else {
        const parentEntityTreeComponent = getComponent(parentEntity, EntityTreeComponent)
        childIndex = parentEntityTreeComponent.children.length
      }

      if (!componentJson.some((comp) => comp.name === TransformComponent.jsonID)) {
        componentJson.push({ name: TransformComponent.jsonID })
      }
      const fullComponentJson = [...componentJson, { name: VisibleComponent.jsonID }].map((comp) => ({
        name: comp.name,
        props: {
          ...componentJsonDefaults(ComponentJSONIDMap.get(comp.name)!),
          ...comp.props
        }
      }))

      const newSnapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)
      newSnapshot.data.entities[entityUUID] = {
        name,
        components: fullComponentJson,
        parent: getComponent(parentEntity, UUIDComponent),
        index: childIndex
      }

      dispatchAction(SceneSnapshotAction.createSnapshot(newSnapshot))
    }

    /** Temporary until GLTF loader refactored */
    const entity = createEntity()
    setComponent(entity, UUIDComponent, entityUUID)
    const parentEntityTree = getComponent(parentEntity, EntityTreeComponent)
    const childIndex = beforeEntity ? parentEntityTree.children.indexOf(beforeEntity) : parentEntityTree.children.length
    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex })
    setComponent(entity, NameComponent, name)
    setComponent(entity, VisibleComponent)
    setComponent(entity, SourceComponent, sceneID)
    for (const comp of componentJson) {
      setComponent(entity, ComponentJSONIDMap.get(comp.name)!, comp.props)
    }
  }
}

/**
 * @todo copying an object should be rooted to which object is currently selected
 */
const duplicateObject = (entities: Entity[]) => {
  const scenes = getSourcesForEntities(entities)
  const copyMap = {} as { [entityUUID: EntityUUID]: EntityUUID }

  for (const [sceneID, entities] of Object.entries(scenes)) {
    const rootEntities = findCommonAncestors(entities)

    if (getState(GLTFSourceState)[sceneID]) {
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

        const entityDataClone = JSON.parse(JSON.stringify(node))
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
          const parentNode = getParentNodeByUUID(gltf.data, parentEntityUUID)
          if (!parentNode) throw new Error('Parent node not found')
          if (!parentNode.children) parentNode.children = []
          parentNode.children.push(newIndex)
        }
      }

      dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
    } else {
      const newSnapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)

      for (const rootEntity of rootEntities) {
        traverseEntityNode(rootEntity, (entity) => {
          const entityUUID = getComponent(entity, UUIDComponent)
          const entityData = newSnapshot.data.entities[entityUUID]
          if (!entityData) return /** @todo entity may be loaded in via GLTF **/

          const entityDataClone = JSON.parse(JSON.stringify(entityData))
          const newUUID = generateEntityUUID()
          copyMap[entityUUID] = newUUID

          const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity!
          const parentEntityUUID = getComponent(parentEntity, UUIDComponent)

          if (copyMap[parentEntityUUID]) {
            entityDataClone.parent = copyMap[parentEntityUUID]
          }

          newSnapshot.data.entities[newUUID] = entityDataClone

          if (rootEntity === entity) {
            /** update index of parent with new entity */
            const parentEntityTreeComponent = getComponent(parentEntity, EntityTreeComponent)
            const index = parentEntityTreeComponent.children.indexOf(entity)
            if (index) {
              for (const [entityUUID, data] of Object.entries(newSnapshot.data.entities)) {
                if (typeof data.index !== 'number') continue
                if (data.parent === parentEntityUUID) {
                  if (data.index > index) data.index++
                }
              }
            }
          }
        })
      }

      dispatchAction(SceneSnapshotAction.createSnapshot(newSnapshot))
    }
  }

  /** Temporary until GLTF loader refactored */
  for (const [oldEntityUUID, newEntityUUID] of Object.entries(copyMap)) {
    const oldEntity = UUIDComponent.getEntityByUUID(oldEntityUUID as EntityUUID)
    const data = serializeEntity(oldEntity)
    const newEntity = createEntity()
    setComponent(newEntity, SourceComponent, getComponent(oldEntity, SourceComponent))
    setComponent(newEntity, UUIDComponent, newEntityUUID)
    const parent = getComponent(oldEntity, EntityTreeComponent).parentEntity
    setComponent(newEntity, EntityTreeComponent, { parentEntity: parent })
    for (const comp of data) {
      if (comp.name === UUIDComponent.jsonID) continue
      setComponent(newEntity, ComponentJSONIDMap.get(comp.name)!, comp.props)
    }
  }
}

const tempMatrix = new Matrix4()
const tempVector = new Vector3()

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
      tempMatrix.copy(_spaceMatrix).invert()
      tempVector.applyMatrix4(tempMatrix)

      transform.position.copy(tempVector)
    }

    updateComponent(entity, TransformComponent, { position: transform.position })

    iterateEntityNode(entity, (entity) => {
      computeTransformMatrix(entity)
      TransformComponent.dirtyTransforms[entity] = true
    })
  }
}

const T_QUAT_1 = new Quaternion()
const T_QUAT_2 = new Quaternion()

const rotateObject = (nodes: Entity[], rotations: Euler[], space = getState(EditorHelperState).transformSpace) => {
  for (let i = 0; i < nodes.length; i++) {
    const entity = nodes[i]

    T_QUAT_1.setFromEuler(rotations[i] ?? rotations[0])

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

      transform.rotation.copy(newLocalQuaternion)
    }

    updateComponent(entity, TransformComponent, { rotation: transform.rotation })

    iterateEntityNode(entity, (entity) => {
      computeTransformMatrix(entity)
      TransformComponent.dirtyTransforms[entity] = true
    })
  }
}

const mat4 = new Matrix4()

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

    new Matrix4()
      .copy(transform.matrixWorld)
      .premultiply(pivotToOriginMatrix)
      .premultiply(rotationMatrix)
      .premultiply(originToPivotMatrix)
      .premultiply(mat4.copy(parentTransform.matrixWorld).invert())
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

const reparentObject = (entities: Entity[], before?: Entity | null, parent = getState(EditorState).rootEntity) => {
  const scenes = getSourcesForEntities(entities)

  for (const [sceneID, entities] of Object.entries(scenes)) {
    if (getState(GLTFSourceState)[sceneID]) {
      const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

      for (const entity of entities) {
        if (entity === parent) continue

        const entityUUID = getComponent(entity, UUIDComponent)
        const nodeIndex = gltf.data.nodes!.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === entityUUID)
        const isCurrentlyChildOfRoot = gltf.data.scenes![0].nodes.includes(nodeIndex)

        if (isCurrentlyChildOfRoot) {
          gltf.data.scenes![0].nodes.splice(gltf.data.scenes![0].nodes.indexOf(nodeIndex), 1)
        } else {
          const currentParentNode = getParentNodeByUUID(gltf.data, entityUUID)
          if (!currentParentNode) continue
          const currentParentNodeIndex = currentParentNode.children!.indexOf(nodeIndex)
          currentParentNode.children!.splice(currentParentNodeIndex, 1)
        }

        const newParentUUID = getComponent(parent, UUIDComponent)
        const newParentIndex = gltf.data.nodes!.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === newParentUUID)
        const isParentRoot = gltf.data.scenes![0].nodes.includes(newParentIndex)

        if (isParentRoot) {
          if (before) {
            const beforeIndex = gltf.data.nodes!.findIndex(
              (n) => n.extensions?.[UUIDComponent.jsonID] === getComponent(before, UUIDComponent)
            )
            gltf.data.scenes![0].nodes.splice(beforeIndex, 0, nodeIndex)
          } else {
            gltf.data.scenes![0].nodes.push(nodeIndex)
          }
        } else {
          const newParentNode = getGLTFNodeByUUID(gltf.data, newParentUUID)
          if (!newParentNode) continue
          if (!newParentNode.children) newParentNode.children = []
          if (before) {
            const beforeIndex = newParentNode.children.findIndex(
              (n) =>
                n ===
                gltf.data.nodes!.find(
                  (n) => n.extensions?.[UUIDComponent.jsonID] === getComponent(before, UUIDComponent)
                )
            )
            newParentNode.children.splice(beforeIndex, 0, nodeIndex)
          } else {
            newParentNode.children.push(nodeIndex)
          }
        }
      }

      dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
    } else {
      const newSnapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)
      for (const entity of entities) {
        if (entity === parent) continue

        const currentParentEntity = getComponent(entity, EntityTreeComponent).parentEntity!
        const currentParentEntityUUID = getComponent(currentParentEntity, UUIDComponent)
        const parentEntityTreeComponent = getComponent(currentParentEntity, EntityTreeComponent)
        const currentIndex = parentEntityTreeComponent.children.indexOf(entity)

        const newParentEntityTreeComponent = getComponent(parent, EntityTreeComponent)
        const newIndex = before
          ? newParentEntityTreeComponent.children.indexOf(before as Entity)
          : newParentEntityTreeComponent.children.length

        const entityData = newSnapshot.data.entities[getComponent(entity, UUIDComponent)]
        entityData.parent = getComponent(parent, UUIDComponent)
        entityData.index = newIndex

        for (const [entityUUID, data] of Object.entries(newSnapshot.data.entities)) {
          if (typeof data.index !== 'number') continue
          if (entityUUID === getComponent(entity, UUIDComponent)) continue

          /** update indexes for old sibling entities */
          if (data.parent === currentParentEntityUUID) {
            if (data.index > currentIndex) data.index--
          }

          /** update indexes for new sibling entities */
          if (newIndex) {
            if (data.parent === getComponent(parent, UUIDComponent)) {
              if (data.index >= newIndex) data.index++
            }
          }
        }
      }
      dispatchAction(SceneSnapshotAction.createSnapshot(newSnapshot))
    }
  }

  /** Temporary until GLTF loader refactored */
  for (const entity of entities) {
    const entityTreeComponent = getComponent(entity, EntityTreeComponent)
    const parentEntity = entityTreeComponent.parentEntity
    const parentEntityTreeComponent = getComponent(parentEntity, EntityTreeComponent)

    if (before) {
      setComponent(entity, EntityTreeComponent, {
        parentEntity,
        childIndex: parentEntityTreeComponent.children.indexOf(before)
      })
    } else {
      setComponent(entity, EntityTreeComponent, { parentEntity })
    }
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
    if (getState(GLTFSourceState)[sceneID]) {
      const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

      /** 1. create new group node */
      const groupNode = {
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

      /** For each node being added to the group */
      for (const entity of entities) {
        const entityUUID = getComponent(entity, UUIDComponent)
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
    } else {
      const newSnapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)

      const parentEntity = getState(EditorState).rootEntity
      const parentEntityTreeComponent = getComponent(parentEntity, EntityTreeComponent)
      const childIndex = parentEntityTreeComponent.children.length
      const parentEntityUUID = getComponent(parentEntity, UUIDComponent)

      const groupEntityUUID = generateEntityUUID()
      newGroupUUIDs[sceneID] = groupEntityUUID

      newSnapshot.data.entities[groupEntityUUID] = {
        name: 'New Group',
        components: [
          {
            name: TransformComponent.jsonID,
            props: {
              // todo figure out where the new position should be
              ...componentJsonDefaults(TransformComponent)
            }
          },
          {
            name: VisibleComponent.jsonID,
            props: true
          }
        ],
        parent: parentEntityUUID,
        index: childIndex
      }

      let count = 0

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        const currentParentEntity = getComponent(entity, EntityTreeComponent).parentEntity!
        const currentParentEntityUUID = getComponent(currentParentEntity, UUIDComponent)

        const parentEntityTreeComponent = getComponent(currentParentEntity, EntityTreeComponent)
        const currentIndex = parentEntityTreeComponent.children.indexOf(entity)

        const entityData = newSnapshot.data.entities[getComponent(entity, UUIDComponent)]
        entityData.parent = groupEntityUUID
        entityData.index = count++

        for (const [entityUUID, data] of Object.entries(newSnapshot.data.entities)) {
          if (typeof data.index !== 'number') continue
          if (entityUUID === getComponent(entity, UUIDComponent)) continue

          /** update indexes for old sibling entities */
          if (data.parent === currentParentEntityUUID) {
            if (data.index > currentIndex) data.index--
          }
        }
      }

      dispatchAction(SceneSnapshotAction.createSnapshot(newSnapshot))
    }
  }

  /** Temporary until GLTF loader refactored */
  for (const [sceneID, groupUUID] of Object.entries(newGroupUUIDs)) {
    const entity = createEntity()
    setComponent(entity, UUIDComponent, groupUUID)
    setComponent(entity, NameComponent, 'New Group')
    setComponent(entity, TransformComponent)
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, EntityTreeComponent, { parentEntity: getState(EditorState).rootEntity })
    setComponent(entity, SourceComponent, sceneID)
  }
}

const removeObject = (entities: Entity[]) => {
  /** we have to manually set this here or it will cause react errors when entities are removed */
  getMutableState(SelectionState).selectedEntities.set([])

  const scenes = getSourcesForEntities(entities)
  const entityUUIDsToDelete = [] as EntityUUID[]

  for (const [sceneID, entities] of Object.entries(scenes)) {
    const rootEntity = SceneState.getRootEntity(sceneID)
    const removedParentNodes = filterParentEntities(rootEntity, entities, undefined, true, false)

    if (getState(GLTFSourceState)[sceneID]) {
      const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)

      for (let i = 0; i < removedParentNodes.length; i++) {
        const entity = removedParentNodes[i]
        const entityTreeComponent = getComponent(entity, EntityTreeComponent)
        if (!entityTreeComponent.parentEntity) continue
        const uuidsToDelete = iterateEntityNode(
          entity,
          (entity) => getComponent(entity, UUIDComponent),
          (entity) => hasComponent(entity, SourceComponent) && hasComponent(entity, UUIDComponent),
          false,
          false
        )
        for (const entityUUID of uuidsToDelete) {
          const nodeIndex = gltf.data.nodes!.findIndex((n) => n.extensions?.[UUIDComponent.jsonID] === entityUUID)
          const isCurrentlyChildOfRoot = gltf.data.scenes![0].nodes.includes(nodeIndex)

          if (isCurrentlyChildOfRoot) {
            gltf.data.scenes![0].nodes.splice(gltf.data.scenes![0].nodes.indexOf(nodeIndex), 1)
          } else {
            const currentParentNode = getParentNodeByUUID(gltf.data, entityUUID)!
            if (!currentParentNode) continue
            const currentParentNodeIndex = currentParentNode.children!.indexOf(nodeIndex)
            currentParentNode.children!.splice(currentParentNodeIndex, 1)
          }

          gltf.data.nodes!.splice(nodeIndex, 1)
        }
        entityUUIDsToDelete.push(...uuidsToDelete)
      }

      dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
    } else {
      const newSnapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)

      for (let i = 0; i < removedParentNodes.length; i++) {
        const entity = removedParentNodes[i]
        const entityTreeComponent = getComponent(entity, EntityTreeComponent)
        if (!entityTreeComponent.parentEntity) continue
        const uuidsToDelete = iterateEntityNode(
          entity,
          (entity) => getComponent(entity, UUIDComponent),
          (entity) => hasComponent(entity, SourceComponent) && hasComponent(entity, UUIDComponent),
          false,
          false
        )
        for (const uuid of uuidsToDelete) {
          delete newSnapshot.data.entities[uuid]
        }
        entityUUIDsToDelete.push(...uuidsToDelete)
      }

      dispatchAction(SceneSnapshotAction.createSnapshot(newSnapshot))
    }
  }

  /** Temporary until GLTF loader refactored */
  for (const entityUUID of entityUUIDsToDelete) {
    const entity = UUIDComponent.getEntityByUUID(entityUUID)
    removeEntity(entity)
  }
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

  SelectionState.updateSelection(entities)
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
    if (getState(GLTFSourceState)[sceneID]) {
      const gltf = GLTFSnapshotState.cloneCurrentSnapshot(sceneID)
      for (const entity of entities) {
        const entityUUID = getComponent(entity, UUIDComponent)
        const node = getGLTFNodeByUUID(gltf.data, entityUUID)
        if (!node) continue
        const transform = getComponent(entity, TransformComponent)
        const position = transform.position
        const rotation = transform.rotation
        const scale = transform.scale
        const matrix = new Matrix4().compose(position, rotation, scale)
        node.matrix = matrix.toArray()
      }
      dispatchAction(GLTFSnapshotAction.createSnapshot(gltf))
    } else {
      const newSnapshot = SceneSnapshotState.cloneCurrentSnapshot(sceneID)
      const sceneEntities = scenes[sceneID]
      for (const sceneEntity of sceneEntities) {
        TransformComponent.stateMap[sceneEntity]!.set((v) => v)
        const entityData = newSnapshot.data.entities[getComponent(sceneEntity, UUIDComponent)]
        const component = entityData.components.find((c) => c.name === TransformComponent.jsonID)!
        component.props = serializeComponent(sceneEntity, TransformComponent)
      }
      dispatchAction(SceneSnapshotAction.createSnapshot(newSnapshot))
    }
  }
}

export const EditorControlFunctions = {
  addOrRemoveComponent,
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
  commitTransformSave
}
