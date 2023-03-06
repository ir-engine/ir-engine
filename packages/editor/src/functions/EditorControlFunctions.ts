import { command } from 'cli'
import { Euler, Material, Matrix4, Mesh, Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { EntityJson, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import logger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  Component,
  getComponent,
  getComponentState,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  SerializedComponentType,
  setComponent,
  updateComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeChild,
  EntityOrObjectUUID,
  EntityTreeComponent,
  getAllEntitiesInTree,
  getEntityNodeArrayFromEntities,
  removeEntityNodeRecursively,
  reparentEntityNode,
  traverseEntityNode
} from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { materialFromId } from '@etherealengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import { getMaterialLibrary } from '@etherealengine/engine/src/renderer/materials/MaterialLibrary'
import { ColliderComponent } from '@etherealengine/engine/src/scene/components/ColliderComponent'
import { GLTFLoadedComponent } from '@etherealengine/engine/src/scene/components/GLTFLoadedComponent'
import { GroupComponent, Object3DWithEntity } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { TransformSpace } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getUniqueName } from '@etherealengine/engine/src/scene/functions/getUniqueName'
import { reparentObject3D } from '@etherealengine/engine/src/scene/functions/ReparentFunction'
import { serializeEntity, serializeWorld } from '@etherealengine/engine/src/scene/functions/serializeWorld'
import {
  createNewEditorNode,
  deserializeSceneEntity
} from '@etherealengine/engine/src/scene/systems/SceneLoadingSystem'
import { ScenePrefabs } from '@etherealengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import obj3dFromUuid from '@etherealengine/engine/src/scene/util/obj3dFromUuid'
import {
  LocalTransformComponent,
  TransformComponent,
  TransformComponentType
} from '@etherealengine/engine/src/transform/components/TransformComponent'
import {
  computeLocalTransformMatrix,
  computeTransformMatrix
} from '@etherealengine/engine/src/transform/systems/TransformSystem'
import { dispatchAction, getState, useState } from '@etherealengine/hyperflux'

import { EditorHistoryAction } from '../services/EditorHistory'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction, SelectionState } from '../services/SelectionServices'
import { cancelGrabOrPlacement } from './cancelGrabOrPlacement'
import { filterParentEntities } from './filterParentEntities'
import { getDetachedObjectsRoots } from './getDetachedObjectsRoots'
import { getSpaceMatrix } from './getSpaceMatrix'

/**
 *
 * @param nodes
 * @param component
 */
const addOrRemoveComponent = <C extends Component<any, any>>(
  nodes: EntityOrObjectUUID[],
  component: C,
  add: boolean
) => {
  cancelGrabOrPlacement()

  for (let i = 0; i < nodes.length; i++) {
    const entity = nodes[i]
    if (typeof entity === 'string') continue
    if (add) setComponent(entity, component)
    else removeComponent(entity, component)
  }

  /** @todo remove when all scene components migrated to reactor pattern #6892 */
  dispatchAction(EngineActions.sceneObjectUpdate({ entities: nodes as Entity[] }))
  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
  dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
}

/**
 * Updates each property specified in 'properties' on the component for each of the specified entity nodes
 * @param nodes
 * @param properties
 * @param component
 */
const modifyProperty = <C extends Component<any, any>>(
  nodes: EntityOrObjectUUID[],
  component: C,
  properties: Partial<SerializedComponentType<C>>
) => {
  cancelGrabOrPlacement()

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node === 'string') continue
    updateComponent(node, component, properties)
  }

  /** @todo remove when all scene components migrated to reactor pattern #6892 */
  dispatchAction(
    EngineActions.sceneObjectUpdate({
      entities: nodes.filter((node) => typeof node !== 'string') as Entity[]
    })
  )
  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
  dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
}

const modifyObject3d = (nodes: string[], properties: { [_: string]: any }[]) => {
  const scene = Engine.instance.currentWorld.scene
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
  /**
   * @todo #7259
   * figure out how to use history here
   */
}

function _getMaterial(node: string, materialId: string) {
  let material: Material | undefined
  if (!!getMaterialLibrary().materials[materialId].value) {
    material = materialFromId(node).material
  } else {
    const mesh = obj3dFromUuid(node) as Mesh
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    material = materials.find((material) => material.uuid === materialId)
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
  /**
   * @todo #7259
   * figure out how to use history here
   */
}

const createObjectFromPrefab = (
  prefab: string,
  parentEntity = Engine.instance.currentWorld.sceneEntity as Entity | null,
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
  setComponent(newEntity, EntityTreeComponent, { parentEntity, childIndex })

  createNewEditorNode(newEntity, prefab)

  if (updateSelection) {
    EditorControlFunctions.replaceSelection([newEntity])
  }

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
  dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))

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

  const sceneData = nodes.map((obj) => {
    const data = null!
    if (typeof obj === 'number') {
      return serializeWorld(obj)
    }
    return data
  })

  const rootObjects = getDetachedObjectsRoots(nodes)
  const world = Engine.instance.currentWorld

  const copyMap = {} as { [eid: EntityOrObjectUUID]: EntityOrObjectUUID }

  // @todo insert children order
  for (let i = 0; i < rootObjects.length; i++) {
    const object = rootObjects[i]
    if (typeof object !== 'string') {
      const data = sceneData[i] ?? sceneData[0]

      traverseEntityNode(object, (entity) => {
        const node = getComponent(entity, EntityTreeComponent)
        const nodeUUID = getComponent(entity, UUIDComponent)
        if (!data.entities[nodeUUID]) return
        const newEntity = createEntity()
        setComponent(newEntity, EntityTreeComponent, {
          parentEntity: (node.parentEntity && (copyMap[node.parentEntity] as Entity)) ?? node.parentEntity
        })
        deserializeSceneEntity(newEntity, data.entities[nodeUUID])
        copyMap[entity] = newEntity
      })
    } else {
      // @todo check this is implemented correctly
      const parent = (parents.length ? parents[i] ?? parents[0] : world.scene.uuid) as string
      // let before = befores.length ? befores[i] ?? befores[0] : undefined

      const pObj3d = obj3dFromUuid(parent)

      const newObject = obj3dFromUuid(object).clone()
      copyMap[object] = newObject.uuid

      newObject.parent = copyMap[parent] ? obj3dFromUuid(copyMap[parent] as string) : pObj3d
    }
  }

  EditorControlFunctions.replaceSelection(Object.values(copyMap))

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
  dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
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
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const scale = scales[i] ?? scales[0]

    if (space === TransformSpace.World && (scale.x !== scale.y || scale.x !== scale.z || scale.y !== scale.z)) {
      logger.warn('Scaling an object in world space with a non-uniform scale is not supported')
    }

    const transformComponent =
      typeof node === 'string'
        ? obj3dFromUuid(node)
        : getComponent(node, LocalTransformComponent) ?? getComponent(node, TransformComponent)

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

    updateComponent(node as Entity, LocalTransformComponent, { scale: transformComponent.scale })
  }
}

const reparentObject = (
  nodes: EntityOrObjectUUID[],
  parent = Engine.instance.currentWorld.sceneEntity,
  before?: Entity | null,
  updateSelection = true
) => {
  cancelGrabOrPlacement()

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node !== 'string') {
      if (node === parent) continue
      const entityTreeComponent = getComponent(node, EntityTreeComponent)
      const index = before ? entityTreeComponent.children.indexOf(before as Entity) : undefined
      reparentEntityNode(node, parent as Entity, index)
      reparentObject3D(node, parent as Entity, before as Entity)
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

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
  dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
}

/** @todo - grouping currently doesnt take into account parentEntity or beforeEntity */
const groupObjects = (
  nodes: EntityOrObjectUUID[],
  parents: EntityOrObjectUUID[] = [],
  befores: EntityOrObjectUUID[] = [],
  updateSelection = true
) => {
  cancelGrabOrPlacement()

  const groupNode = EditorControlFunctions.createObjectFromPrefab(ScenePrefabs.group, null, null, false)

  EditorControlFunctions.reparentObject(nodes, groupNode, null, false)

  if (updateSelection) {
    EditorControlFunctions.replaceSelection([groupNode])
  }
}

/**
 *
 * @param nodes
 * @returns
 */
const removeObject = (nodes: EntityOrObjectUUID[], updateSelection = true) => {
  cancelGrabOrPlacement()

  if (updateSelection) {
    // TEMPORARY - this is to stop a crash
    getState(SelectionState).set({
      selectedEntities: [],
      selectedParentEntities: [],
      selectionCounter: 1,
      objectChangeCounter: 1,
      sceneGraphChangeCounter: 1,
      propertyName: '',
      transformPropertyChanged: false
    })
  }
  const removedParentNodes = getEntityNodeArrayFromEntities(filterParentEntities(nodes, undefined, true, false))
  const scene = Engine.instance.currentWorld.scene
  for (let i = 0; i < removedParentNodes.length; i++) {
    const node = removedParentNodes[i]
    if (typeof node === 'string') {
      const obj = scene.getObjectByProperty('uuid', node)
      obj?.removeFromParent()
    } else {
      const entityTreeComponent = getComponent(node, EntityTreeComponent)
      if (!entityTreeComponent.parentEntity) continue
      removeEntityNodeRecursively(node, false)
    }
  }

  dispatchAction(SelectionAction.updateSelection({ selectedEntities: [] }))
  dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
}
/**
 *
 * @param nodes
 * @returns
 */
const replaceSelection = (nodes: EntityOrObjectUUID[]) => {
  const current = getState(SelectionState).selectedEntities.value

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

  dispatchAction(SelectionAction.updateSelection({ selectedEntities: nodes }))
  dispatchAction(EditorHistoryAction.createSnapshot({ selectedEntities: nodes }))
}

/**
 *
 * @param nodes
 * @returns
 */
const toggleSelection = (nodes: EntityOrObjectUUID[]) => {
  const selectedEntities = getState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    let index = selectedEntities.indexOf(node)

    if (index > -1) {
      selectedEntities.splice(index, 1)
    } else {
      selectedEntities.push(node)
    }
  }
  dispatchAction(SelectionAction.updateSelection({ selectedEntities }))
  dispatchAction(EditorHistoryAction.createSnapshot({ selectedEntities }))
}

const addToSelection = (nodes: EntityOrObjectUUID[]) => {
  const selectedEntities = getState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < nodes.length; i++) {
    const object = nodes[i]
    if (selectedEntities.includes(object)) continue
    selectedEntities.push(object)
  }

  dispatchAction(SelectionAction.updateSelection({ selectedEntities }))
  dispatchAction(EditorHistoryAction.createSnapshot({ selectedEntities }))
}

export const EditorControlFunctions = {
  addOrRemoveComponent,
  modifyProperty,
  modifyObject3d,
  modifyMaterial,
  createObjectFromPrefab,
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
  toggleSelection
}
