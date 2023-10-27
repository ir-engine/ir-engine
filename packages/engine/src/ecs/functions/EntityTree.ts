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

import { MathUtils } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { EntityJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { dispatchAction, getMutableState, getState, hookstate, NO_PROXY, none } from '@etherealengine/hyperflux'

import { matchesEntityUUID } from '../../common/functions/MatchesUtils'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { NetworkState } from '../../networking/NetworkState'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { serializeEntity } from '../../scene/functions/serializeWorld'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { Engine } from '../classes/Engine'
import { EngineState } from '../classes/EngineState'
import { Entity } from '../classes/Entity'
import { SceneState } from '../classes/Scene'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponentState,
  hasComponent,
  removeComponent,
  setComponent
} from '../functions/ComponentFunctions'
import { entityExists, removeEntity } from '../functions/EntityFunctions'

type EntityTreeSetType = {
  parentEntity: Entity | null
  uuid?: EntityUUID
  childIndex?: number
}

/**
 * EntityTreeComponent describes parent-child relationship between entities.
 * A root entity has it's parentEntity set to null.
 * @param {Entity} parentEntity
 * @param {string} uuid
 * @param {Readonly<Entity[]>} children
 */
export const EntityTreeComponent = defineComponent({
  name: 'EntityTreeComponent',

  onInit: (entity) => {
    return {
      // api
      parentEntity: null as Entity | null,
      // internal
      children: [] as Entity[],
      rootEntity: null as Entity | null
    }
  },

  onSet: (entity, component, json?: Readonly<EntityTreeSetType>) => {
    if (!json) return

    // If a previous parentEntity, remove this entity from its children
    if (component.parentEntity.value && component.parentEntity.value !== json.parentEntity) {
      const oldParent = getMutableComponent(component.parentEntity.value, EntityTreeComponent)
      const parentChildIndex = oldParent.children.value.findIndex((child) => child === entity)
      const children = oldParent.children.get(NO_PROXY)
      oldParent.children.set([...children.slice(0, parentChildIndex), ...children.slice(parentChildIndex + 1)])
    }

    // set new data
    if (typeof json.parentEntity !== 'undefined') component.parentEntity.set(json.parentEntity)

    if (matchesEntityUUID.test(json?.uuid)) setComponent(entity, UUIDComponent, json.uuid)

    if (component.parentEntity.value) {
      const parent = getOptionalComponentState(component.parentEntity.value, EntityTreeComponent)

      if (parent) {
        const prevChildIndex = parent?.children.value.indexOf(entity)
        const isDifferentIndex = typeof json.childIndex === 'number' ? prevChildIndex !== json.childIndex : false

        if (isDifferentIndex && prevChildIndex !== -1) {
          parent.children.set((prevChildren) => [
            ...prevChildren.slice(0, prevChildIndex),
            ...prevChildren.slice(prevChildIndex + 1)
          ])
        }

        if (isDifferentIndex || prevChildIndex === -1) {
          if (typeof json.childIndex !== 'undefined')
            parent.children.set((prevChildren) => [
              ...prevChildren.slice(0, json.childIndex),
              entity,
              ...prevChildren.slice(json.childIndex)
            ])
          else parent.children.set([...parent.children.value, entity])
        }
      }
    }

    // If parent is the world origin, then the parent entity is a tree root
    const isRoot = component.parentEntity.value === null
    if (isRoot) {
      EntityTreeComponent.roots[entity].set(true)
    } else {
      EntityTreeComponent.roots[entity].set(none)
    }

    const rootEntity = isRoot ? entity : getComponent(component.parentEntity.value, EntityTreeComponent).rootEntity
    component.rootEntity.set(rootEntity)
  },

  onRemove: (entity, component) => {
    if (entity === Engine.instance.originEntity) return

    if (component.parentEntity.value && entityExists(component.parentEntity.value)) {
      const parent = getMutableComponent(component.parentEntity.value, EntityTreeComponent)
      if (parent) {
        const parentChildIndex = parent.children.value.findIndex((child) => child === entity)
        const children = parent.children.get(NO_PROXY)
        parent.children.set([...children.slice(0, parentChildIndex), ...children.slice(parentChildIndex + 1)])
      }
    } else {
      EntityTreeComponent.roots[entity].set(none)
    }
  },

  roots: hookstate({} as Record<Entity, true>)
})

export type EntityOrObjectUUID = Entity | string

/**
 * Recursively destroys all the children entities of the passed entity
 */
export function destroyEntityTree(rootEntity: Entity): void {
  const children = getComponent(rootEntity, EntityTreeComponent).children.slice()
  for (const child of children) {
    destroyEntityTree(child)
  }
  removeEntity(rootEntity)
}

/**
 * Recursively removes all the children from the entity tree
 */
export function removeFromEntityTree(rootEntity: Entity): void {
  const children = getComponent(rootEntity, EntityTreeComponent).children.slice()
  for (const child of children) {
    removeFromEntityTree(child)
  }
  removeComponent(rootEntity, EntityTreeComponent)
}

/**
 * Adds `entity` as a child of `parentEntity`
 * @param entity Child node to be added
 * @param parentEntity Node in which child node will be added
 * @param childIndex Index at which child node will be added
 */
export function addEntityNodeChild(entity: Entity, parentEntity: Entity, childIndex?: number, uuid?: EntityUUID): void {
  const entityTreeComponent = getComponent(entity, EntityTreeComponent)
  if (
    !hasComponent(entity, EntityTreeComponent) ||
    parentEntity !== entityTreeComponent.parentEntity ||
    (typeof childIndex !== 'undefined' &&
      childIndex !== findIndexOfEntityNode(getComponent(parentEntity, EntityTreeComponent).children, entity))
  ) {
    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex })
    setComponent(entity, UUIDComponent, uuid || (MathUtils.generateUUID() as EntityUUID))
  }
  setComponent(entity, LocalTransformComponent)
  const parentTransform = getComponent(parentEntity, TransformComponent)
  const childTransform = getComponent(entity, TransformComponent)
  getMutableState(EngineState).transformsNeedSorting.set(true)
  if (parentTransform && childTransform) {
    const childLocalMatrix = parentTransform.matrix.clone().invert().multiply(childTransform.matrix)
    const localTransform = getComponent(entity, LocalTransformComponent)
    childLocalMatrix.decompose(localTransform.position, localTransform.rotation, localTransform.scale)
  }

  if (NetworkState.worldNetwork?.isHosting) {
    const uuid = getComponent(entity, UUIDComponent)
    dispatchAction(
      WorldNetworkAction.spawnObject({
        entityUUID: uuid,
        prefab: ''
      })
    )
  }
}

export function serializeNodeToWorld(entity: Entity) {
  const entityTreeNode = getComponent(entity, EntityTreeComponent)
  const nodeUUID = getComponent(entity, UUIDComponent)
  const jsonEntity = getState(SceneState).sceneData!.scene.entities[nodeUUID] as EntityJson
  if (jsonEntity) {
    jsonEntity.components = serializeEntity(entity)
    if (entityTreeNode.parentEntity && entityTreeNode.parentEntity !== getState(SceneState).sceneEntity) {
      const parentNodeUUID = getComponent(entityTreeNode.parentEntity, UUIDComponent)
      jsonEntity.parent = parentNodeUUID
    }
  }
}

/**
 * Removes an entity node from it's parent, and remove it's entity and all it's children nodes and entities
 * @param node
 * @param tree
 */
export function removeEntityNodeRecursively(entity: Entity) {
  traverseEntityNodeChildFirst(entity, (childEntity) => {
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
export function reparentEntityNode(entity: Entity, parentEntity: Entity | null, index?: number): void {
  if (parentEntity) addEntityNodeChild(entity, parentEntity, index)
  else setComponent(entity, EntityTreeComponent, { parentEntity: null, childIndex: index })
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
 * note - does not support removing the current node during traversal
 * @param entity Node to be traverse
 * @param cb Callback function which will be called for every traverse
 * @param index index of the curren node in it's parent
 * @param tree Entity Tree
 */
export function traverseEntityNode(entity: Entity, cb: (entity: Entity, index: number) => void, index = 0): void {
  const entityTreeNode = getComponent(entity, EntityTreeComponent)

  if (!entityTreeNode) return

  cb(entity, index)

  if (!entityTreeNode.children.length) return

  for (let i = 0; i < entityTreeNode.children.length; i++) {
    const child = entityTreeNode.children[i]
    traverseEntityNode(child, cb, i)
  }
}

export function traverseEntityNodeChildFirst(
  entity: Entity,
  cb: (entity: Entity, index: number) => void,
  index = 0
): void {
  const entityTreeNode = getComponent(entity, EntityTreeComponent)

  if (!entityTreeNode) return

  const children = [...entityTreeNode.children]

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    traverseEntityNodeChildFirst(child, cb, i)
  }

  cb(entity, index)
}

/**
 * Iteratively traverse parent nodes for given Entity Tree Node
 * @param node Node for which traversal will occur
 * @param cb Callback function which will be called for every traverse
 * @param pred Predicate function which will not process a node or its children if return false
 * @param snubChildren If true, will not traverse children of a node if pred returns false
 */
export function iterateEntityNode<R>(
  entity: Entity,
  cb: (entity: Entity, index: number) => R,
  pred: (entity: Entity) => boolean = (x) => true,
  snubChildren = false
): R[] {
  const frontier = [[entity]]
  const result: R[] = []
  while (frontier.length > 0) {
    const items = frontier.pop()!
    let idx = 0
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (pred(item)) {
        result.push(cb(item, idx))
        idx += 1
        snubChildren &&
          frontier.push(
            getComponent(item, EntityTreeComponent).children?.filter((x) => hasComponent(x, EntityTreeComponent)) ?? []
          )
      }
      !snubChildren &&
        frontier.push(
          getComponent(item, EntityTreeComponent).children?.filter((x) => hasComponent(x, EntityTreeComponent)) ?? []
        )
    }
  }
  return result
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
export function getEntityNodeArrayFromEntities(entities: EntityOrObjectUUID[]) {
  const arr = [] as EntityOrObjectUUID[]
  const scene = Engine.instance.scene
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
export function findIndexOfEntityNode(arr: EntityOrObjectUUID[], obj: EntityOrObjectUUID): number {
  for (let i = 0; i < arr.length; i++) {
    const elt = arr[i]
    if (typeof elt !== typeof obj) continue
    if (typeof obj === 'string' || (typeof obj === 'number' && obj === elt)) return i
  }

  return -1
}
