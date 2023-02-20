import { command } from 'cli'
import { Euler, Material, Matrix4, Mesh, Quaternion, Vector3 } from 'three'

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
  getComponentState,
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
  EntityOrObjectUUID,
  EntityTreeComponent,
  getAllEntitiesInTree,
  getEntityNodeArrayFromEntities,
  removeEntityNodeRecursively,
  reparentEntityNode,
  traverseEntityNode
} from '@xrengine/engine/src/ecs/functions/EntityTree'
import { materialFromId } from '@xrengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import { getMaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { ColliderComponent } from '@xrengine/engine/src/scene/components/ColliderComponent'
import { GLTFLoadedComponent } from '@xrengine/engine/src/scene/components/GLTFLoadedComponent'
import { GroupComponent, Object3DWithEntity } from '@xrengine/engine/src/scene/components/GroupComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { reparentObject3D } from '@xrengine/engine/src/scene/functions/ReparentFunction'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'
import { createNewEditorNode, deserializeSceneEntity } from '@xrengine/engine/src/scene/systems/SceneLoadingSystem'
import { ScenePrefabs } from '@xrengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import {
  LocalTransformComponent,
  TransformComponent
} from '@xrengine/engine/src/transform/components/TransformComponent'
import {
  computeLocalTransformMatrix,
  computeTransformMatrix
} from '@xrengine/engine/src/transform/systems/TransformSystem'
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

/**
 *
 * @param nodes
 * @returns
 */
const addObject = (
  nodes: EntityOrObjectUUID[],
  parents: EntityOrObjectUUID[],
  befores: EntityOrObjectUUID[],
  prefabTypes: string[] = [],
  sceneData: SceneJson[] = [],
  updateSelection = true
) => {
  cancelGrabOrPlacement()

  const rootObjects = getDetachedObjectsRoots(nodes)
  const world = Engine.instance.currentWorld

  for (let i = 0; i < rootObjects.length; i++) {
    const object = rootObjects[i]
    if (typeof object !== 'string') {
      if (prefabTypes.length) {
        createNewEditorNode(object, prefabTypes[i] ?? prefabTypes[0])
      } else if (sceneData.length) {
        const data = sceneData[i] ?? sceneData[0]

        traverseEntityNode(object, (entity) => {
          const node = getComponent(entity, EntityTreeComponent)
          if (!data.entities[node.uuid]) return
          const newEntity = createEntity()
          setComponent(newEntity, EntityTreeComponent, { parentEntity: node.parentEntity, uuid: node.uuid })
          getComponentState(newEntity, EntityTreeComponent).children.merge([...node.children])
          deserializeSceneEntity(node, data.entities[node.uuid])
        })
      }
    }

    let parent = parents.length ? parents[i] ?? parents[0] : world.sceneEntity
    let before = befores.length ? befores[i] ?? befores[0] : undefined

    if (typeof parent !== 'string') {
      if (before && typeof before === 'string' && !hasComponent(parent, GroupComponent)) {
        addComponent(parent, GroupComponent, [])
      }
    }
    if (typeof parent !== 'string' && typeof object !== 'string') {
      addEntityNodeChild(object, parent)

      reparentObject3D(object, parent, typeof before === 'string' ? undefined : before)

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

const duplicateObject = (nodes: EntityOrObjectUUID[]) => {
  cancelGrabOrPlacement()

  const roots = getDetachedObjectsRoots(nodes.filter((o) => typeof o !== 'string'))
  const duplicatedObjects = roots
    .map((object) => (typeof object === 'string' ? obj3dFromUuid(object).clone().uuid : getAllEntitiesInTree(object)))
    .flat()

  const parents = [] as EntityOrObjectUUID[]

  for (const o of duplicatedObjects) {
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

        localTransform.rotation.copy(newLocalQuaternion)
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

    setComponent(node as Entity, TransformComponent, { scale: transformComponent.scale })
  }
}

const reparentObject = (
  nodes: EntityOrObjectUUID[],
  parents: EntityOrObjectUUID[] = [],
  befores: EntityOrObjectUUID[] = [],
  updateSelection = true
) => {
  cancelGrabOrPlacement()

  for (let i = 0; i < nodes.length; i++) {
    const parent = parents[i] ?? parents[0]
    if (!parent) continue

    const node = nodes[i]
    const before = befores ? befores[i] ?? befores[0] : undefined
    if (typeof node !== 'string') {
      if (node === parent) continue
      const entityTreeComponent = getComponent(node, EntityTreeComponent)
      const index =
        before && entityTreeComponent.children ? entityTreeComponent.children.indexOf(before as Entity) : undefined
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

const groupObjects = (
  nodes: EntityOrObjectUUID[],
  parents: EntityOrObjectUUID[] = [],
  befores: EntityOrObjectUUID[] = [],
  updateSelection = true
) => {
  cancelGrabOrPlacement()

  const groupNode = createEntity()
  setComponent(groupNode, EntityTreeComponent)
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
