import { command } from 'cli'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@xrengine/common/src/interfaces/EntityUUID'
import { EntityJson, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import logger from '@xrengine/common/src/logger'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  Component,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  SerializedComponentType,
  setComponent,
  updateComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeChild,
  cloneEntityNode,
  createEntityNode,
  EntityTreeNode,
  getEntityNodeArrayFromEntities,
  removeEntityNodeFromParent,
  reparentEntityNode,
  traverseEntityNode
} from '@xrengine/engine/src/ecs/functions/EntityTree'
import { ColliderComponent } from '@xrengine/engine/src/scene/components/ColliderComponent'
import { GLTFLoadedComponent } from '@xrengine/engine/src/scene/components/GLTFLoadedComponent'
import { GroupComponent } from '@xrengine/engine/src/scene/components/GroupComponent'
import { Object3DWithEntity } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { updateCollider, updateModelColliders } from '@xrengine/engine/src/scene/functions/loaders/ColliderFunctions'
import { reparentObject3D } from '@xrengine/engine/src/scene/functions/ReparentFunction'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'
import { createNewEditorNode, deserializeSceneEntity } from '@xrengine/engine/src/scene/systems/SceneLoadingSystem'
import { ScenePrefabs } from '@xrengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import {
  LocalTransformComponent,
  TransformComponent
} from '@xrengine/engine/src/transform/components/TransformComponent'
import { updateEntityTransform } from '@xrengine/engine/src/transform/systems/TransformSystem'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { EditorHistoryAction } from '../services/EditorHistory'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction, SelectionState } from '../services/SelectionServices'
import { cancelGrabOrPlacement } from './cancelGrabOrPlacement'
import { filterParentEntities } from './filterParentEntities'
import { getDetachedObjectsRoots } from './getDetachedObjectsRoots'
import { getSpaceMatrix } from './getSpaceMatrix'
import makeUniqueName from './makeUniqueName'

/**
 *
 * @param nodes
 * @param component
 */
const addOrRemoveComponentToSelection = <C extends Component<any, any>>(component: C, add: boolean) => {
  cancelGrabOrPlacement()

  const entities = getState(SelectionState).selectedEntities.value

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    if (typeof entity === 'string') continue
    if (add) setComponent(entity, component)
    else removeComponent(entity, component)
  }

  /** @todo remove when all scene components migrated to reactor pattern */
  dispatchAction(
    EngineActions.sceneObjectUpdate({
      entities: entities as Entity[]
    })
  )
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
  nodes: EntityTreeNode[],
  component: C,
  properties: Partial<SerializedComponentType<C>>
) => {
  cancelGrabOrPlacement()

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node === 'string') continue
    const entity = node.entity
    updateComponent(entity, component, properties)
  }

  /** @todo remove when all scene components migrated to reactor pattern */
  dispatchAction(
    EngineActions.sceneObjectUpdate({
      entities: nodes.filter((node) => typeof node !== 'string').map((node: EntityTreeNode) => node.entity)
    })
  )
  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
  dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
}

/**
 *
 * @param nodes
 * @returns
 */
const addObject = (
  nodes: (EntityTreeNode | string)[],
  parents: (string | EntityTreeNode)[],
  befores: (string | EntityTreeNode)[],
  prefabTypes: string[],
  sceneData: SceneJson[],
  updateSelection = true
) => {
  cancelGrabOrPlacement()

  const rootObjects = getDetachedObjectsRoots(nodes)
  const world = Engine.instance.currentWorld

  for (let i = 0; i < rootObjects.length; i++) {
    const object = rootObjects[i]
    if (typeof object !== 'string') {
      if (prefabTypes?.length) {
        createNewEditorNode(object, prefabTypes[i] ?? prefabTypes[0])
      } else if (sceneData?.length) {
        const data = sceneData[i] ?? sceneData[0]

        traverseEntityNode(object, (node) => {
          if (!data.entities[node.uuid]) return
          node.entity = createEntity()
          deserializeSceneEntity(node, data.entities[node.uuid])

          if (node.parentEntity && node.uuid !== data.root)
            reparentObject3D(node, node.parentEntity, undefined, world.entityTree)
        })
      }
    }

    let parent = parents.length ? parents[i] ?? parents[0] : world.entityTree.rootNode
    let before = befores.length ? befores[i] ?? befores[0] : undefined

    let index
    if (typeof parent !== 'string') {
      if (before && typeof before === 'string' && !hasComponent(parent.entity, GroupComponent)) {
        addComponent(parent.entity, GroupComponent, [])
      }
      index =
        before && parent.children
          ? typeof before === 'string'
            ? getComponent(parent.entity, GroupComponent).indexOf(obj3dFromUuid(before) as Object3DWithEntity)
            : parent.children.indexOf(before.entity)
          : undefined
    } else {
      const pObj3d = obj3dFromUuid(parent)
      index =
        before && pObj3d.children && typeof before === 'string'
          ? pObj3d.children.indexOf(obj3dFromUuid(before))
          : undefined
    }
    if (typeof parent !== 'string' && typeof object !== 'string') {
      addEntityNodeChild(object, parent, index)

      reparentObject3D(object, parent, typeof before === 'string' ? undefined : before, world.entityTree)

      traverseEntityNode(object, (node) => makeUniqueName(node))
    }
  }

  if (updateSelection) {
    EditorControlFunctions.replaceSelection(nodes)
  }

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
  dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
}

const duplicateObject = (nodes: (EntityTreeNode | string)[]) => {
  cancelGrabOrPlacement()

  const roots = getDetachedObjectsRoots(nodes.filter((o) => typeof o !== 'string'))
  const duplicatedObjects = roots.map((object) =>
    typeof object === 'string' ? obj3dFromUuid(object).clone().uuid : cloneEntityNode(object)
  )

  const parents = [] as (EntityTreeNode | string)[]
  const tree = Engine.instance.currentWorld.entityTree

  for (const o of duplicatedObjects) {
    if (typeof o === 'string') {
      const obj3d = obj3dFromUuid(o)
      if (!obj3d.parent) throw new Error('Parent is not defined')
      const parent = obj3d.parent
      parents.push(parent.uuid)
    } else {
      if (!o.parentEntity) throw new Error('Parent is not defined')
      const parent = tree.entityNodeMap.get(o.parentEntity)

      if (!parent) throw new Error('Parent is not defined')
      parents.push(parent)
    }
  }

  const sceneData = duplicatedObjects.map((obj) =>
    typeof obj === 'string'
      ? {
          entities: {} as { [uuid: EntityUUID]: EntityJson },
          root: '' as EntityUUID,
          version: 0,
          metadata: {}
        }
      : serializeWorld(obj, true)
  )

  EditorControlFunctions.addObject(duplicatedObjects, parents, [], [], sceneData, true)
}

const tempMatrix = new Matrix4()
const tempVector = new Vector3()

const positionObject = (
  nodes: (EntityTreeNode | string)[],
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
      const transform = getComponent(node.entity, TransformComponent)
      const localTransform = getOptionalComponent(node.entity, LocalTransformComponent) ?? transform

      if (space === TransformSpace.Local) {
        if (addToPosition) localTransform.position.add(pos)
        else localTransform.position.copy(pos)
      } else {
        const parentTransform = node.parentEntity ? getComponent(node.parentEntity, TransformComponent) : transform

        if (addToPosition) {
          tempVector.setFromMatrixPosition(transform.matrix)
          tempVector.add(pos)
        }

        const _spaceMatrix = space === TransformSpace.World ? parentTransform.matrix : getSpaceMatrix()
        tempMatrix.copy(_spaceMatrix).invert()
        tempVector.applyMatrix4(tempMatrix)
        localTransform.position.copy(tempVector)
      }
    }
  }
}

const T_QUAT_1 = new Quaternion()
const T_QUAT_2 = new Quaternion()

const rotateObject = (
  nodes: (EntityTreeNode | string)[],
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
      const transform = getComponent(node.entity, TransformComponent)
      const localTransform = getComponent(node.entity, LocalTransformComponent) || transform

      T_QUAT_1.setFromEuler(rotations[i] ?? rotations[0])

      if (space === TransformSpace.Local) {
        localTransform.rotation.copy(T_QUAT_1)
      } else {
        const parentTransform = node.parentEntity ? getComponent(node.parentEntity, TransformComponent) : transform

        const _spaceMatrix = space === TransformSpace.World ? parentTransform.matrix : getSpaceMatrix()

        const inverseParentWorldQuaternion = T_QUAT_2.setFromRotationMatrix(_spaceMatrix).invert()
        const newLocalQuaternion = inverseParentWorldQuaternion.multiply(T_QUAT_1)

        localTransform.rotation.copy(newLocalQuaternion)
        updateEntityTransform(node.entity)
      }
    }
  }
}

const rotateAround = (nodes: (EntityTreeNode | string)[], axis: Vector3, angle: number, pivot: Vector3) => {
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
      const transform = getComponent(node.entity, TransformComponent)
      const localTransform = getComponent(node.entity, LocalTransformComponent) || transform
      const parentTransform = node.parentEntity ? getComponent(node.parentEntity, TransformComponent) : transform

      new Matrix4()
        .copy(transform.matrix)
        .premultiply(pivotToOriginMatrix)
        .premultiply(rotationMatrix)
        .premultiply(originToPivotMatrix)
        .premultiply(parentTransform.matrixInverse)
        .decompose(localTransform.position, localTransform.rotation, localTransform.scale)
    }
  }
}

const scaleObject = (
  nodes: (EntityTreeNode | string)[],
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
        : getComponent(node.entity, LocalTransformComponent) ?? getComponent(node.entity, TransformComponent)

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

    if (typeof node !== 'string' && hasComponent(node.entity, ColliderComponent)) {
      if (hasComponent(node.entity, GLTFLoadedComponent)) {
        updateModelColliders(node.entity)
      } else {
        updateCollider(node.entity)
      }
    }
  }
}

const reparentObject = (
  nodes: (EntityTreeNode | string)[],
  parents: (string | EntityTreeNode)[] = [],
  befores: (string | EntityTreeNode)[] = [],
  updateSelection = true
) => {
  cancelGrabOrPlacement()

  for (let i = 0; i < nodes.length; i++) {
    const parent = parents[i] ?? parents[0]
    if (!parent) continue

    const node = nodes[i]
    const before = befores ? befores[i] ?? befores[0] : undefined
    if (typeof node !== 'string') {
      const _parent = parent as EntityTreeNode
      if (node.entity === _parent.entity) continue
      const _before = before as EntityTreeNode | undefined
      const index = _before && _parent.children ? _parent.children.indexOf(_before.entity) : undefined
      reparentEntityNode(node, _parent, index)
      reparentObject3D(node, _parent, _before)
    } else {
      const _parent =
        typeof parent === 'string' ? obj3dFromUuid(parent) : getComponent(parent.entity, GroupComponent)[0]

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

const groupObjects = (
  nodes: (EntityTreeNode | string)[],
  parents: (string | EntityTreeNode)[] = [],
  befores: (string | EntityTreeNode)[] = [],
  updateSelection = true
) => {
  cancelGrabOrPlacement()

  const groupNode = createEntityNode(createEntity())
  EditorControlFunctions.addObject([groupNode], parents!, befores!, [ScenePrefabs.group], [], false)

  EditorControlFunctions.reparentObject(nodes, [groupNode], [], false)

  if (updateSelection) {
    EditorControlFunctions.replaceSelection([groupNode])
  }
}

/**
 *
 * @param nodes
 * @returns
 */
const removeObject = (nodes: (EntityTreeNode | string)[], updateSelection = true) => {
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
  const removedParentNodes = getEntityNodeArrayFromEntities(
    filterParentEntities(
      nodes.map((node: EntityTreeNode | string): Entity | string => {
        return typeof node === 'string' ? node : node.entity
      }),
      undefined,
      true,
      false
    )
  )
  const scene = Engine.instance.currentWorld.scene
  for (let i = 0; i < removedParentNodes.length; i++) {
    const node = removedParentNodes[i]
    if (typeof node === 'string') {
      const obj = scene.getObjectByProperty('uuid', node)
      obj?.removeFromParent()
    } else {
      if (!node.parentEntity) continue
      traverseEntityNode(node, (node) => removeEntity(node.entity, true))
      removeEntityNodeFromParent(node)
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
const replaceSelection = (nodes: (EntityTreeNode | string)[]) => {
  const current = getState(SelectionState).selectedEntities.value
  const selectedEntities = nodes.map((n) => (typeof n === 'string' ? n : n.entity))

  if (selectedEntities.length === current.length) {
    let same = true
    for (let i = 0; i < selectedEntities.length; i++) {
      if (!current.includes(selectedEntities[i])) {
        same = false
        break
      }
    }
    if (same) return
  }

  dispatchAction(SelectionAction.updateSelection({ selectedEntities }))
  dispatchAction(EditorHistoryAction.createSnapshot({ selectedEntities }))
}

/**
 *
 * @param nodes
 * @returns
 */
const toggleSelection = (nodes: (EntityTreeNode | string)[]) => {
  const selectedEntities = getState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    let index = selectedEntities.indexOf(typeof node === 'string' ? node : node.entity)

    if (index > -1) {
      selectedEntities.splice(index, 1)
    } else {
      selectedEntities.push(typeof node === 'string' ? node : node.entity)
    }
  }
  dispatchAction(SelectionAction.updateSelection({ selectedEntities }))
  dispatchAction(EditorHistoryAction.createSnapshot({ selectedEntities }))
}

const addToSelection = (nodes: (EntityTreeNode | string)[]) => {
  const selectedEntities = getState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < nodes.length; i++) {
    const object = nodes[i]
    if (selectedEntities.includes(typeof object === 'string' ? object : object.entity)) continue
    if (typeof object === 'string') {
      selectedEntities.push(object)
    } else {
      selectedEntities.push(object.entity)
    }
  }

  dispatchAction(SelectionAction.updateSelection({ selectedEntities }))
  dispatchAction(EditorHistoryAction.createSnapshot({ selectedEntities }))
}

export const EditorControlFunctions = {
  addOrRemoveComponentToSelection,
  modifyProperty,
  addObject,
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
