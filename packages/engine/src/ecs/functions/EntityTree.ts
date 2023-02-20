import { MathUtils } from 'three'

import { EntityUUID } from '@xrengine/common/src/interfaces/EntityUUID'
import { getState, hookstate, NO_PROXY, none } from '@xrengine/hyperflux'

import { matchesEntity, matchesEntityUUID } from '../../common/functions/MatchesUtils'
import { NameComponent } from '../../scene/components/NameComponent'
import { SceneTagComponent } from '../../scene/components/SceneTagComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { serializeEntity } from '../../scene/functions/serializeWorld'
import {
  LocalTransformComponent,
  setLocalTransformComponent,
  setTransformComponent,
  TransformComponent
} from '../../transform/components/TransformComponent'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { Engine } from '../classes/Engine'
import { EngineState } from '../classes/EngineState'
import { Entity, UndefinedEntity } from '../classes/Entity'
import {
  defineComponent,
  getComponent,
  getComponentState,
  getOptionalComponentState,
  hasComponent,
  removeComponent,
  setComponent
} from '../functions/ComponentFunctions'
import { createEntity, entityExists, removeEntity } from '../functions/EntityFunctions'

type EntityTreeSetType = {
  parentEntity: Entity
  uuid: EntityUUID
}

/**
 * EntityTreeComponent describes parent-child relationship between entities.
 * A root entity has it's parent the world origin.
 * @param {Entity} parentEntity
 * @param {string} uuid
 * @param {Readonly<Entity[]>} children
 */
export const EntityTreeComponent = defineComponent({
  name: 'EntityTreeComponent',

  onInit: (entity, world) => {
    return {
      // api
      parentEntity: UndefinedEntity,
      /** @deprecated use UUIDComponent instead */
      uuid: MathUtils.generateUUID() as EntityUUID,
      // internal
      children: [] as Entity[],
      rootEntity: UndefinedEntity
    }
  },

  onSet: (entity, component, json: Partial<Readonly<EntityTreeSetType>>) => {
    const world = Engine.instance.currentWorld

    if (entity === world.originEntity) return

    const parent = getOptionalComponentState(component.parentEntity.value, EntityTreeComponent)

    // If a previous parentEntity, remove this entity from its children
    if (parent) {
      const parentChildIndex = parent.children.value.findIndex((child) => child === entity)
      const children = parent.children.get(NO_PROXY)
      parent.children.set([...children.slice(0, parentChildIndex - 1), ...children.slice(parentChildIndex)])
    }

    if (matchesEntity.test(json?.parentEntity)) component.parentEntity.set(json.parentEntity)
    if (matchesEntityUUID.test(json?.uuid)) component.uuid.set(json.uuid)

    // If a new parentEntity, add this entity to its children
    if (parent && !parent?.children.value.includes(entity)) parent.children.merge([entity])

    EntityTreeComponent.entitiesByUUID[component.uuid.value].set(entity)
    EntityTreeComponent.uuidByEntity[entity].set(component.uuid.value)

    if (parent) {
      // If parent is the world origin, then the parent entity is a tree root
      const isRoot = component.parentEntity.value === world.originEntity
      if (isRoot) {
        EntityTreeComponent.roots[entity].set(true)
      }

      const rootEntity = isRoot
        ? component.parentEntity.value
        : getComponent(component.parentEntity.value, EntityTreeComponent).rootEntity
      component.rootEntity.set(rootEntity)
    }

    setComponent(entity, UUIDComponent, component.uuid.value)
  },

  onRemove: (entity, component) => {
    if (entity === Engine.instance.currentWorld.originEntity) return

    const parent = getComponentState(component.parentEntity.value, EntityTreeComponent)
    const parentChildIndex = parent.children.value.findIndex((child) => child === entity)
    const children = parent.children.get(NO_PROXY)
    parent.children.set([...children.slice(0, parentChildIndex - 1), ...children.slice(parentChildIndex)])

    EntityTreeComponent.entitiesByUUID[component.uuid.value].set(UndefinedEntity)
    EntityTreeComponent.uuidByEntity[entity].set(none)
    EntityTreeComponent.roots[entity].set(none)

    removeComponent(entity, UUIDComponent)
  },

  roots: hookstate({} as Record<Entity, true>),

  entitiesByUUID: hookstate({} as Record<EntityUUID, Entity>),

  uuidByEntity: hookstate({} as Record<Entity, EntityUUID>)
})

export type EntityOrObjectUUID = Entity | string

/**
 * Initialize the world with enity tree
 * @param world World
 */
export function initializeSceneEntity(world = Engine.instance.currentWorld): void {
  if (entityExists(world.sceneEntity)) removeEntity(world.sceneEntity, true)

  world.sceneEntity = createEntity()
  setComponent(world.sceneEntity, NameComponent, 'scene')
  setComponent(world.sceneEntity, VisibleComponent, true)
  setComponent(world.sceneEntity, SceneTagComponent, true)
  setTransformComponent(world.sceneEntity)
  setComponent(world.sceneEntity, EntityTreeComponent, { parentEntity: world.originEntity })
}

/**
 * Recursively destroys all the children entities of the passed entity
 */
export function removeEntityTree(rootEntity: Entity): void {
  const children = getComponent(rootEntity, EntityTreeComponent).children.slice()
  for (const child of children) {
    removeEntityTree(child)
    removeEntity(child)
  }
}

/**
 * Recursively removes all the children from the entity tree
 */
export function removeFromEntityTree(rootEntity: Entity): void {
  const children = getComponent(rootEntity, EntityTreeComponent).children.slice()
  for (const child of children) {
    removeEntityTree(child)
  }
}

// ========== Entity Tree Functions ========== //

// ========== Entity Tree Node Functions ========== //
/**
 * Adds entity node as a child of passed node
 * @param parent Node in which child node will be added
 * @param node Child node to be added
 * @param index Index at which child node will be added
 */
export function addEntityNodeChild(entity: Entity, parentEntity: Entity, uuid?: EntityUUID): void {
  if (
    !hasComponent(entity, EntityTreeComponent) ||
    parentEntity !== getComponent(entity, EntityTreeComponent).parentEntity
  ) {
    setComponent(entity, EntityTreeComponent, { parentEntity, uuid })
  }

  const parentTransform = getComponent(parentEntity, TransformComponent)
  const childTransform = getComponent(entity, TransformComponent)
  getState(EngineState).transformsNeedSorting.set(true)
  if (parentTransform && childTransform) {
    computeTransformMatrix(parentEntity)
    computeTransformMatrix(entity)
    const childLocalMatrix = parentTransform.matrix.clone().invert().multiply(childTransform.matrix)
    setLocalTransformComponent(entity, parentEntity)
    const localTransform = getComponent(entity, LocalTransformComponent)
    childLocalMatrix.decompose(localTransform.position, localTransform.rotation, localTransform.scale)
  }

  /** @todo networking all objects breaks portals currently - need to implement checks with connecting to instance server to ensure it's the same scene */
  // if (Engine.instance.currentWorld.worldNetwork?.isHosting) {
  //   dispatchAction(
  //     WorldNetworkAction.registerSceneObject({
  //       objectUuid: node.uuid
  //     })
  //   )
  // }
}

export function serializeNodeToWorld(entity: Entity, world = Engine.instance.currentWorld) {
  const entityTreeNode = getComponent(entity, EntityTreeComponent)
  const jsonEntity = world.sceneJson.entities[entityTreeNode.uuid]
  if (jsonEntity) {
    jsonEntity.components = serializeEntity(entity)
    if (entityTreeNode.parentEntity !== world.sceneEntity) {
      const parentNode = getComponent(entityTreeNode.parentEntity, EntityTreeComponent)
      jsonEntity.parent = parentNode.uuid
    }
  }
}

/**
 * Removes an entity node from it's parent, and remove it's entity and all it's children nodes and entities
 * @param node
 * @param tree
 */
export function removeEntityNodeRecursively(entity: Entity, serialize = false) {
  traverseEntityNode(entity, (childEntity) => {
    if (serialize) serializeNodeToWorld(childEntity)
    removeEntity(childEntity)
  })
}

/**
 * Removes an entity node from it's parent, and remove it's entity and all it's children nodes and entities
 * @param entity
 * @param tree
 */
export function removeEntityNode(entity: Entity, serialize = false) {
  const entityTreeNode = getComponent(entity, EntityTreeComponent)

  for (const childEntity of entityTreeNode.children) {
    reparentEntityNode(childEntity, entityTreeNode.parentEntity)
  }
  if (serialize) serializeNodeToWorld(entity)
  removeEntity(entity)
}

/**
 * Reparent passed entity tree node to new parent node
 * @param node Node to be reparented
 * @param newParent Parent node
 * @param index Index at which passed node will be set as child in parent node's children arrays
 */
export function reparentEntityNode(entity: Entity, parentEntity: Entity, index?: number): void {
  const entityTreeNode = getComponent(entity, EntityTreeComponent)
  if (entityTreeNode.parentEntity === parentEntity) return
  removeComponent(entity, EntityTreeComponent)
  addEntityNodeChild(entity, parentEntity)
}

/**
 * Returns all entities in the tree
 */
export function getAllEntitiesInTree(entity: Entity) {
  const entities = [] as Entity[]
  traverseEntityNode(entity, (childEntity) => {
    entities.push(childEntity)
  })
  return entities
}

/**
 * Traverse child nodes of the given node. Traversal will start from the passed node
 * @param entity Node to be traverse
 * @param cb Callback function which will be called for every traverse
 * @param index index of the curren node in it's parent
 * @param tree Entity Tree
 */
export function traverseEntityNode(entity: Entity, cb: (entity: Entity, index: number) => void, index = 0): void {
  const entityTreeNode = getComponent(entity, EntityTreeComponent)

  cb(entity, index)

  if (!entityTreeNode.children.length) return

  for (let i = 0; i < entityTreeNode.children.length; i++) {
    const child = entityTreeNode.children[i]
    if (child) traverseEntityNode(child, cb, i)
  }
}

/**
 * Iteratively traverse parent nodes for given Entity Tree Node
 * @param node Node for which traversal will occur
 * @param cb Callback function which will be called for every traverse
 * @param pred Predicate function which will not process a node or its children if return false
 * @param tree Entity Tree
 */
export function iterateEntityNode(
  entity: Entity,
  cb: (entity: Entity, index: number) => void,
  pred: (entity: Entity) => boolean = (x) => true,
  snubChildren: boolean = false
): void {
  const frontier = [[entity]]
  while (frontier.length > 0) {
    const items = frontier.pop()!
    let idx = 0
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]
      if (pred(item)) {
        cb(item, idx)
        idx += 1
        if (snubChildren)
          frontier.push(
            getComponent(item, EntityTreeComponent).children?.filter((x) => hasComponent(x, EntityTreeComponent)) ?? []
          )
      }
      if (!snubChildren) {
        frontier.push(
          getComponent(item, EntityTreeComponent).children?.filter((x) => hasComponent(x, EntityTreeComponent)) ?? []
        )
      }
    }
  }
}

/**
 * Traverse parent nodes for given Entity Tree Node
 * @param node Node for which traversal will occur
 * @param cb Callback function which will be called for every traverse
 * @param tree Entity Tree
 */
export function traverseEntityNodeParent(entity: Entity, cb: (parent: Entity) => void): void {
  const entityTreeNode = getComponent(entity, EntityTreeComponent)
  if (entityTreeNode.parentEntity) {
    const parent = entityTreeNode.parentEntity
    cb(parent)
    traverseEntityNodeParent(parent, cb)
  }
}

/**
 * Creates Entity Tree Node array from passed Entity array
 * @param entities Entity Array to get Entity node from
 * @param tree Entity Tree object
 * @returns Entity Tree node array obtained from passed Entities.
 */
export function getEntityNodeArrayFromEntities(entities: (Entity | string)[]) {
  const arr = [] as (Entity | string)[]
  const scene = Engine.instance.currentWorld.scene
  for (const entity of entities) {
    if (typeof entity === 'string') {
      scene.getObjectByProperty('uuid', entity) && arr.push(entity)
      continue
    }
    if (hasComponent(entity, EntityTreeComponent)) arr.push(entity)
  }
  return arr
}

/**
 * Finds the index of an entity tree node using entity.
 * This function is useful for node which is not contained in array but can have same entity as one of array elements
 * @param arr Nodes array
 * @param node Node to find index of
 * @returns index of the node if found -1 oterhwise.
 */
export function findIndexOfEntityNode(arr: (Entity | string)[], obj: string | Entity): number {
  for (let i = 0; i < arr.length; i++) {
    const elt = arr[i]
    if (typeof elt !== typeof obj) continue
    if (typeof obj === 'string' || (typeof obj === 'number' && obj === elt)) return i
  }

  return -1
}
