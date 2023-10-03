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

import { Euler, Material, MathUtils, Matrix4, Mesh, Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import logger from '@etherealengine/engine/src/common/functions/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  Component,
  getComponent,
  getOptionalComponent,
  hasComponent,
  serializeComponent,
  SerializedComponentType,
  setComponent,
  updateComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import {
  EntityOrObjectUUID,
  EntityTreeComponent,
  getEntityNodeArrayFromEntities,
  traverseEntityNode
} from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { materialFromId } from '@etherealengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import { MaterialLibraryState } from '@etherealengine/engine/src/renderer/materials/MaterialLibrary'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { TransformSpace } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { createNewEditorNode } from '@etherealengine/engine/src/scene/systems/SceneLoadingSystem'
import obj3dFromUuid from '@etherealengine/engine/src/scene/util/obj3dFromUuid'
import {
  LocalTransformComponent,
  TransformComponent
} from '@etherealengine/engine/src/transform/components/TransformComponent'
import {
  computeLocalTransformMatrix,
  computeTransformMatrix
} from '@etherealengine/engine/src/transform/systems/TransformSystem'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { getNestedObject } from '@etherealengine/common/src/utils/getNestedProperty'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { SceneObjectComponent } from '@etherealengine/engine/src/scene/components/SceneObjectComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { serializeEntity } from '@etherealengine/engine/src/scene/functions/serializeWorld'
import { EditorHistoryAction, EditorHistoryState } from '../services/EditorHistory'
import { SelectionAction, SelectionState } from '../services/SelectionServices'
import { cancelGrabOrPlacement } from './cancelGrabOrPlacement'
import { filterParentEntities } from './filterParentEntities'
import { getDetachedObjectsRoots } from './getDetachedObjectsRoots'
import { getSpaceMatrix } from './getSpaceMatrix'

const addOrRemoveComponent = <C extends Component<any, any>>(
  nodes: EntityOrObjectUUID[],
  component: C,
  add: boolean
) => {
  const sceneComponentID = component.jsonID
  if (!sceneComponentID) return

  cancelGrabOrPlacement()

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()

  for (let i = 0; i < nodes.length; i++) {
    const entity = nodes[i]
    if (typeof entity === 'string') continue
    const enttiyUUID = getComponent(entity, UUIDComponent)
    const componentData = newSnapshot.data.scene.entities[enttiyUUID].components

    if (add) {
      const tempEntity = createEntity()
      setComponent(tempEntity, component)
      componentData.push({
        name: sceneComponentID,
        props: serializeComponent(tempEntity, component)
      })
      removeEntity(tempEntity)
    } else {
      const index = componentData.findIndex((c) => c.name === sceneComponentID)
      if (index > -1) componentData.splice(index, 1)
    }
  }

  dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

const modifyName = <C extends Component<any, any>>(nodes: EntityOrObjectUUID[], name: string) => {
  cancelGrabOrPlacement()

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()

  for (const node of nodes) {
    if (typeof node === 'string') continue
    const entityUUID = getComponent(node, UUIDComponent)
    const entityData = newSnapshot.data.scene.entities[entityUUID]
    if (!entityData) continue
    entityData.name = name
  }

  dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

/**
 * Updates each property specified in 'properties' on the component for each of the specified entity nodes
 */
const modifyProperty = <C extends Component<any, any>>(
  nodes: EntityOrObjectUUID[],
  component: C,
  properties: Partial<SerializedComponentType<C>>
) => {
  cancelGrabOrPlacement()

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()

  for (const node of nodes) {
    if (typeof node === 'string') continue
    const entityUUID = getComponent(node, UUIDComponent)
    const componentData = newSnapshot.data.scene.entities[entityUUID].components.find(
      (c) => c.name === component.jsonID
    )
    if (!componentData) continue
    if (typeof properties === 'string') {
      componentData.props = properties
    } else {
      Object.entries(properties).map(([k, v]) => {
        const { result, finalProp } = getNestedObject(componentData.props, k)
        result[finalProp] = v
      })
    }
  }

  dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

const modifyObject3d = (nodes: string[], properties: { [_: string]: any }[]) => {
  const scene = Engine.instance.scene
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node !== 'string') return
    const obj3d = scene.getObjectByProperty('uuid', node)!
    const props = properties[i] ?? properties[0]
    Object.keys(props).map((k) => {
      const value = props[k]
      if (typeof value?.copy === 'function') {
        if (!obj3d[k]) obj3d[k] = new value.constructor()
        obj3d[k].copy(value)
      } else if (typeof value !== 'undefined' && typeof obj3d[k] === 'object' && typeof obj3d[k].set === 'function') {
        obj3d[k].set(value)
      } else {
        obj3d[k] = value
      }
    })
  }
}

function _getMaterial(node: string, materialId: string) {
  let material: Material | undefined
  if (getState(MaterialLibraryState).materials[materialId]) {
    material = materialFromId(materialId).material
  } else {
    const mesh = obj3dFromUuid(node) as Mesh
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    material = materials.find((material) => materialId === material.uuid)
  }
  if (typeof material === 'undefined' || !material.isMaterial) throw new Error('Material is missing from host mesh')
  return material
}

const modifyMaterial = (nodes: string[], materialId: string, properties: { [_: string]: any }[]) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node !== 'string') return
    const material = _getMaterial(node, materialId)
    const props = properties[i] ?? properties[0]
    Object.entries(props).map(([k, v]) => {
      if (!material) throw new Error('Updating properties on undefined material')
      if (typeof v?.copy === 'function') {
        if (!material[k]) material[k] = new v.constructor()
        material[k].copy(v)
      } else if (typeof v !== 'undefined' && typeof material[k] === 'object' && typeof material[k].set === 'function') {
        material[k].set(v)
      } else {
        material[k] = v
      }
    })
    material.needsUpdate = true
  }
}

const createObjectFromSceneElement = (
  componentName: string,
  parentEntity = getState(SceneState).sceneEntity as Entity,
  beforeEntity = null as Entity | null,
  updateSelection = true
) => {
  cancelGrabOrPlacement()

  const newEntity = createEntity()
  let childIndex = undefined as undefined | number
  if (beforeEntity) {
    const beforeNode = getComponent(beforeEntity, EntityTreeComponent)
    if (beforeNode?.parentEntity && hasComponent(beforeNode.parentEntity, EntityTreeComponent)) {
      childIndex = getComponent(beforeNode.parentEntity, EntityTreeComponent).children.indexOf(beforeEntity)
    }
  }

  const entityUUID = MathUtils.generateUUID() as EntityUUID
  setComponent(newEntity, EntityTreeComponent, { parentEntity, childIndex })
  setComponent(newEntity, UUIDComponent, entityUUID)
  setComponent(newEntity, SceneObjectComponent)

  createNewEditorNode(newEntity, componentName)

  const serializedEntity = serializeEntity(newEntity)

  removeEntity(newEntity)

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()
  if (updateSelection) newSnapshot.selectedEntities = [entityUUID]
  newSnapshot.data.scene.entities[getComponent(newEntity, UUIDComponent)] = {
    name: getComponent(newEntity, NameComponent),
    components: serializedEntity,
    parent: getComponent(parentEntity, UUIDComponent),
    index: childIndex
  }

  dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))

  return newEntity
}

/**
 * @todo copying an object should be rooted to which object is currently selected
 */
const duplicateObject = (nodes: EntityOrObjectUUID[]) => {
  cancelGrabOrPlacement()

  const parents = [] as EntityOrObjectUUID[]

  for (const o of nodes) {
    if (typeof o === 'string') {
      const obj3d = obj3dFromUuid(o)
      if (!obj3d.parent) throw new Error('Parent is not defined')
      const parent = obj3d.parent
      parents.push(parent.uuid)
    } else {
      if (!hasComponent(o, EntityTreeComponent)) throw new Error('Parent is not defined')
      const parent = getComponent(o, EntityTreeComponent).parentEntity
      if (!parent) throw new Error('Parent is not defined')
      parents.push(parent)
    }
  }

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()

  const rootObjects = getDetachedObjectsRoots(nodes)

  const copyMap = {} as { [entityUUID: EntityUUID | string]: EntityUUID | string }

  for (let i = 0; i < rootObjects.length; i++) {
    const object = rootObjects[i]
    if (typeof object !== 'string') {
      traverseEntityNode(object, (entity) => {
        const entityUUID = getComponent(entity, UUIDComponent)
        const entityData = newSnapshot.data.scene.entities[entityUUID]
        if (!entityData) return /** @todo entity may be loaded in via GLTF **/

        const entityDataClone = JSON.parse(JSON.stringify(entityData))
        const newUUID = MathUtils.generateUUID() as EntityUUID
        copyMap[entityUUID] = newUUID

        const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity!
        const parentEntityUUID = getComponent(parentEntity, UUIDComponent)

        if (copyMap[parentEntityUUID]) {
          entityDataClone.parent = copyMap[parentEntityUUID]
        }

        newSnapshot.data.scene.entities[newUUID] = entityDataClone

        if (object === entity) {
          /** update index of parent with new entity */
          const parentEntityTreeComponent = getComponent(parentEntity, EntityTreeComponent)
          const index = parentEntityTreeComponent.children.indexOf(entity)
          if (index) {
            for (const [entityUUID, data] of Object.entries(newSnapshot.data.scene.entities)) {
              if (typeof data.index !== 'number') continue
              if (data.parent === parentEntityUUID) {
                if (data.index > index) data.index++
              }
            }
          }
        }
      })
    } else {
      // @todo check this is implemented correctly
      const parent = (parents.length ? parents[i] ?? parents[0] : Engine.instance.scene.uuid) as string
      // let before = befores.length ? befores[i] ?? befores[0] : undefined

      const pObj3d = obj3dFromUuid(parent)

      const newObject = obj3dFromUuid(object).clone()
      copyMap[object] = newObject.uuid

      newObject.parent = copyMap[parent] ? obj3dFromUuid(copyMap[parent] as string) : pObj3d
    }
  }

  dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

const tempMatrix = new Matrix4()
const tempVector = new Vector3()

const positionObject = (
  nodes: EntityOrObjectUUID[],
  positions: Vector3[],
  space: TransformSpace = TransformSpace.Local,
  addToPosition?: boolean
) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const pos = positions[i] ?? positions[0]

    const isObj3d = typeof node === 'string'

    if (isObj3d) {
      const obj3d = obj3dFromUuid(node)
      if (space === TransformSpace.Local) {
        if (addToPosition) obj3d.position.add(pos)
        else obj3d.position.copy(pos)
      } else {
        obj3d.updateMatrixWorld()
        if (addToPosition) {
          tempVector.setFromMatrixPosition(obj3d.matrixWorld)
          tempVector.add(pos)
        }

        const _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : getSpaceMatrix()
        tempMatrix.copy(_spaceMatrix).invert()
        tempVector.applyMatrix4(tempMatrix)
        obj3d.position.copy(tempVector)
      }
      obj3d.updateMatrix()
    } else {
      const transform = getComponent(node, TransformComponent)
      const localTransform = getOptionalComponent(node, LocalTransformComponent) ?? transform
      const targetComponent = hasComponent(node, LocalTransformComponent) ? LocalTransformComponent : TransformComponent

      if (space === TransformSpace.Local) {
        if (addToPosition) localTransform.position.add(pos)
        else localTransform.position.copy(pos)
      } else {
        const entityTreeComponent = getComponent(node, EntityTreeComponent)
        const parentTransform = entityTreeComponent.parentEntity
          ? getComponent(entityTreeComponent.parentEntity, TransformComponent)
          : transform

        if (addToPosition) {
          tempVector.setFromMatrixPosition(transform.matrix)
          tempVector.add(pos)
        }

        const _spaceMatrix = space === TransformSpace.World ? parentTransform.matrix : getSpaceMatrix()
        tempMatrix.copy(_spaceMatrix).invert()
        tempVector.applyMatrix4(tempMatrix)

        localTransform.position.copy(tempVector)
        updateComponent(node, targetComponent, { position: localTransform.position })
      }
    }
  }
}

const T_QUAT_1 = new Quaternion()
const T_QUAT_2 = new Quaternion()

const rotateObject = (
  nodes: EntityOrObjectUUID[],
  rotations: Euler[],
  space: TransformSpace = TransformSpace.Local
) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    if (typeof node === 'string') {
      const obj3d = obj3dFromUuid(node)
      T_QUAT_1.setFromEuler(rotations[i] ?? rotations[0])
      if (space === TransformSpace.Local) {
        obj3d.quaternion.copy(T_QUAT_1)
        obj3d.updateMatrix()
      } else {
        obj3d.updateMatrixWorld()
        const _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : getSpaceMatrix()

        const inverseParentWorldQuaternion = T_QUAT_2.setFromRotationMatrix(_spaceMatrix).invert()
        const newLocalQuaternion = inverseParentWorldQuaternion.multiply(T_QUAT_1)
        obj3d.quaternion.copy(newLocalQuaternion)
      }
    } else {
      const transform = getComponent(node, TransformComponent)
      const localTransform = getComponent(node, LocalTransformComponent) || transform
      const targetComponent = getComponent(node, LocalTransformComponent) ? TransformComponent : LocalTransformComponent

      T_QUAT_1.setFromEuler(rotations[i] ?? rotations[0])

      if (space === TransformSpace.Local) {
        localTransform.rotation.copy(T_QUAT_1)
      } else {
        const entityTreeComponent = getComponent(node, EntityTreeComponent)
        const parentTransform = entityTreeComponent.parentEntity
          ? getComponent(entityTreeComponent.parentEntity, TransformComponent)
          : transform

        const _spaceMatrix = space === TransformSpace.World ? parentTransform.matrix : getSpaceMatrix()

        const inverseParentWorldQuaternion = T_QUAT_2.setFromRotationMatrix(_spaceMatrix).invert()
        const newLocalQuaternion = inverseParentWorldQuaternion.multiply(T_QUAT_1)

        updateComponent(node, targetComponent, { rotation: newLocalQuaternion })
        computeLocalTransformMatrix(node)
        computeTransformMatrix(node)
      }
    }
  }
}

const rotateAround = (nodes: EntityOrObjectUUID[], axis: Vector3, angle: number, pivot: Vector3) => {
  const pivotToOriginMatrix = new Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z)
  const originToPivotMatrix = new Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z)
  const rotationMatrix = new Matrix4().makeRotationAxis(axis, angle)

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node === 'string') {
      const obj3d = obj3dFromUuid(node)
      const matrixWorld = new Matrix4()
        .copy(obj3d.matrixWorld)
        .premultiply(pivotToOriginMatrix)
        .premultiply(rotationMatrix)
        .premultiply(originToPivotMatrix)
        .premultiply(obj3d.parent!.matrixWorld.clone().invert())
      obj3d.matrixWorld.copy(matrixWorld)
    } else {
      const transform = getComponent(node, TransformComponent)
      const localTransform = getComponent(node, LocalTransformComponent) || transform
      const entityTreeComponent = getComponent(node, EntityTreeComponent)
      const parentTransform = entityTreeComponent.parentEntity
        ? getComponent(entityTreeComponent.parentEntity, TransformComponent)
        : transform
      const targetComponent = hasComponent(node, LocalTransformComponent) ? LocalTransformComponent : TransformComponent

      new Matrix4()
        .copy(transform.matrix)
        .premultiply(pivotToOriginMatrix)
        .premultiply(rotationMatrix)
        .premultiply(originToPivotMatrix)
        .premultiply(parentTransform.matrixInverse)
        .decompose(localTransform.position, localTransform.rotation, localTransform.scale)

      updateComponent(node, targetComponent, { rotation: localTransform.rotation })
    }
  }
}

const scaleObject = (
  nodes: EntityOrObjectUUID[],
  scales: Vector3[],
  space: TransformSpace = TransformSpace.Local,
  overrideScale = false
) => {
  if (space === TransformSpace.World) {
    logger.warn('Scaling an object in world space with a non-uniform scale is not supported')
    return
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const scale = scales[i] ?? scales[0]

    const transformComponent =
      typeof node === 'string'
        ? obj3dFromUuid(node)
        : getComponent(node, LocalTransformComponent) ?? getComponent(node, TransformComponent)

    const componentType =
      typeof node != 'string' && getComponent(node, LocalTransformComponent)
        ? LocalTransformComponent
        : TransformComponent

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

    updateComponent(node as Entity, componentType, { scale: transformComponent.scale })
  }
}

const reparentObject = (
  nodes: EntityOrObjectUUID[],
  before?: Entity | null,
  parent = getState(SceneState).sceneEntity,
  updateSelection = true
) => {
  cancelGrabOrPlacement()

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node !== 'string') {
      if (node === parent) continue

      const currentParentEntity = getComponent(node, EntityTreeComponent).parentEntity!
      const currentParentEntityUUID = getComponent(currentParentEntity, UUIDComponent)
      const parentEntityTreeComponent = getComponent(currentParentEntity, EntityTreeComponent)
      const currentIndex = parentEntityTreeComponent.children.indexOf(node)

      const newParentEntityTreeComponent = getComponent(parent, EntityTreeComponent)
      const newIndex = before
        ? newParentEntityTreeComponent.children.indexOf(before as Entity)
        : newParentEntityTreeComponent.children.length

      const entityData = newSnapshot.data.scene.entities[getComponent(node, UUIDComponent)]
      entityData.parent = getComponent(parent, UUIDComponent)
      entityData.index = newIndex

      for (const [entityUUID, data] of Object.entries(newSnapshot.data.scene.entities)) {
        if (typeof data.index !== 'number') continue
        if (entityUUID === getComponent(node, UUIDComponent)) continue

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
    } else {
      const _parent = typeof parent === 'string' ? obj3dFromUuid(parent) : getComponent(parent, GroupComponent)[0]

      const obj3d = obj3dFromUuid(node)
      const oldWorldTransform = obj3d.parent?.matrixWorld ?? new Matrix4()
      obj3d.removeFromParent()
      _parent.add(obj3d)
      obj3d.applyMatrix4(_parent.matrixWorld.clone().invert().multiply(oldWorldTransform))
    }
  }

  if (updateSelection) {
    EditorControlFunctions.replaceSelection(nodes)
  }

  dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

/** @todo - grouping currently doesnt take into account parentEntity or beforeEntity */
const groupObjects = (nodes: EntityOrObjectUUID[]) => {
  cancelGrabOrPlacement()

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()

  const parentEntity = getState(SceneState).sceneEntity
  const parentEntityTreeComponent = getComponent(parentEntity, EntityTreeComponent)
  const childIndex = parentEntityTreeComponent.children.length
  const parentEntityUUID = getComponent(parentEntity, UUIDComponent)

  const groupEntity = createEntity()

  const groupEntityUUID = MathUtils.generateUUID() as EntityUUID

  removeEntity(groupEntity)
  newSnapshot.data.scene.entities[groupEntityUUID] = {
    name: 'New Group',
    components: [
      {
        name: LocalTransformComponent.jsonID,
        props: {} // todo figure out where the new position should be
      },
      {
        name: VisibleComponent.jsonID,
        props: {}
      }
    ],
    parent: parentEntityUUID,
    index: childIndex
  }

  let count = 0

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node === 'string') continue

    const currentParentEntity = getComponent(node, EntityTreeComponent).parentEntity!
    const currentParentEntityUUID = getComponent(currentParentEntity, UUIDComponent)

    const parentEntityTreeComponent = getComponent(currentParentEntity, EntityTreeComponent)
    const currentIndex = parentEntityTreeComponent.children.indexOf(node)

    const entityData = newSnapshot.data.scene.entities[getComponent(node, UUIDComponent)]
    entityData.parent = groupEntityUUID
    entityData.index = count++

    for (const [entityUUID, data] of Object.entries(newSnapshot.data.scene.entities)) {
      if (typeof data.index !== 'number') continue
      if (entityUUID === getComponent(node, UUIDComponent)) continue

      /** update indexes for old sibling entities */
      if (data.parent === currentParentEntityUUID) {
        if (data.index > currentIndex) data.index--
      }
    }
  }

  newSnapshot.selectedEntities = [groupEntityUUID]

  dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

const removeObject = (nodes: EntityOrObjectUUID[]) => {
  cancelGrabOrPlacement()

  /** we have to manually set this here or it will cause react errors when entities are removed */
  getMutableState(SelectionState).selectedEntities.set([])

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()

  const removedParentNodes = getEntityNodeArrayFromEntities(filterParentEntities(nodes, undefined, true, false))
  const scene = Engine.instance.scene
  for (let i = 0; i < removedParentNodes.length; i++) {
    const node = removedParentNodes[i]
    if (typeof node === 'string') {
      const obj = scene.getObjectByProperty('uuid', node)
      obj?.removeFromParent()
    } else {
      const entityTreeComponent = getComponent(node, EntityTreeComponent)
      if (!entityTreeComponent.parentEntity) continue
      delete newSnapshot.data.scene.entities[getComponent(node, UUIDComponent)]
    }
  }

  newSnapshot.selectedEntities = []

  dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

const replaceSelection = (nodes: EntityOrObjectUUID[]) => {
  const current = getMutableState(SelectionState).selectedEntities.value

  if (nodes.length === current.length) {
    let same = true
    for (let i = 0; i < nodes.length; i++) {
      if (!current.includes(nodes[i])) {
        same = false
        break
      }
    }
    if (same) return
  }

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()
  newSnapshot.selectedEntities = nodes
    .map((node) => {
      if (typeof node === 'string') return
      return getComponent(node, UUIDComponent)
    })
    .filter(Boolean) as EntityUUID[]

  dispatchAction(
    SelectionAction.updateSelection({
      selectedEntities: nodes
    })
  )
  // dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

const toggleSelection = (nodes: EntityOrObjectUUID[]) => {
  const selectedEntities = getMutableState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    let index = selectedEntities.indexOf(node)

    if (index > -1) {
      selectedEntities.splice(index, 1)
    } else {
      selectedEntities.push(node)
    }
  }

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()
  newSnapshot.selectedEntities = selectedEntities
    .map((node) => {
      if (typeof node === 'string') return
      return getComponent(node, UUIDComponent)
    })
    .filter(Boolean) as EntityUUID[]

  dispatchAction(
    SelectionAction.updateSelection({
      selectedEntities
    })
  )
  // dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

const addToSelection = (nodes: EntityOrObjectUUID[]) => {
  const selectedEntities = getMutableState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < nodes.length; i++) {
    const object = nodes[i]
    if (selectedEntities.includes(object)) continue
    selectedEntities.push(object)
  }

  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()
  newSnapshot.selectedEntities = selectedEntities
    .map((node) => {
      if (typeof node === 'string') return
      return getComponent(node, UUIDComponent)
    })
    .filter(Boolean) as EntityUUID[]

  dispatchAction(
    SelectionAction.updateSelection({
      selectedEntities
    })
  )
  // dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

const commitTransformSave = (entity: Entity) => {
  const newSnapshot = EditorHistoryState.cloneCurrentSnapshot()
  LocalTransformComponent.stateMap[entity]!.set(LocalTransformComponent.valueMap[entity])

  const entityData = newSnapshot.data.scene.entities[getComponent(entity, UUIDComponent)]
  const component = entityData.components.find((c) => c.name === LocalTransformComponent.jsonID)!
  component.props = serializeComponent(entity, LocalTransformComponent)

  dispatchAction(EditorHistoryAction.createSnapshot(newSnapshot))
}

export const EditorControlFunctions = {
  addOrRemoveComponent,
  modifyProperty,
  modifyName,
  modifyObject3d,
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
