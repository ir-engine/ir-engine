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

import {
  Component,
  ComponentType,
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  hasComponents,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { entityExists, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { startReactor, useForceUpdate, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import React, { useEffect, useLayoutEffect } from 'react'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { TransformComponent } from './TransformComponent'

type EntityTreeSetType = {
  parentEntity: Entity
  childIndex?: number
}

/**
 * EntityTreeComponent describes parent-child relationship between entities.
 * A root entity has it's parentEntity set to null.
 * @param {Entity} parentEntity
 * @param {Readonly<Entity[]>} children
 */
export const EntityTreeComponent = defineComponent({
  name: 'EntityTreeComponent',

  schema: S.Object({
    // api
    parentEntity: S.Entity(),
    // internal
    childIndex: S.NonSerialized(S.Optional(S.Number())),
    children: S.NonSerialized(S.Array(S.Entity()))
  }),

  onSet: (entity, component, json?: Readonly<EntityTreeSetType>) => {
    if (!json) return

    if (entity === json.parentEntity) {
      throw new Error('Entity cannot be its own parent: ' + entity)
    }

    if (typeof json.parentEntity !== 'undefined') component.parentEntity.set(json.parentEntity)
    if (typeof json.childIndex === 'number') component.childIndex.set(json.childIndex)
  },

  reactor: () => {
    const entity = useEntityContext()
    const treeComponent = useComponent(entity, EntityTreeComponent)

    useImmediateEffect(() => {
      const parentEntity = treeComponent.parentEntity.value
      const childIndex = treeComponent.childIndex.value

      if (parentEntity && entityExists(parentEntity)) {
        if (!hasComponent(parentEntity, EntityTreeComponent)) setComponent(parentEntity, EntityTreeComponent)

        const parentState = getMutableComponent(parentEntity, EntityTreeComponent)
        const parent = getComponent(parentEntity, EntityTreeComponent)
        const prevChildIndex = parent.children.indexOf(entity)

        const hasChildIndex = typeof childIndex === 'number'
        const existsInChildren = prevChildIndex !== -1
        const needsMoved = existsInChildren && hasChildIndex && childIndex !== prevChildIndex

        if (needsMoved) {
          parentState.children.set((prevChildren) => {
            prevChildren.splice(prevChildIndex, 1)
            prevChildren.splice(childIndex, 0, entity)
            return prevChildren
          })
        } else if (!existsInChildren) {
          if (hasChildIndex) {
            parentState.children.set((prevChildren) => {
              prevChildren.splice(childIndex, 0, entity)
              return prevChildren
            })
          } else {
            parentState.children.set((prevChildren) => {
              prevChildren.push(entity)
              return prevChildren
            })
          }
        }
      }

      return () => {
        // If a previous parentEntity, remove this entity from its children
        if (parentEntity && entityExists(parentEntity)) {
          const oldParent = getOptionalMutableComponent(parentEntity, EntityTreeComponent)
          if (oldParent) {
            oldParent.children.set((children) => {
              const childIndex = children.indexOf(entity)
              children.splice(childIndex, 1)
              return children
            })
          }
        }
      }
    }, [treeComponent.parentEntity, treeComponent.childIndex])

    return null
  }
})

/**
 * Recursively destroys all the children entities of the passed entity
 */
export function destroyEntityTree(entity: Entity): void {
  const children = getComponent(entity, EntityTreeComponent).children.slice()
  for (const child of children) {
    destroyEntityTree(child)
  }
  removeEntity(entity)
}

/**
 * Recursively removes all the children from the entity tree
 */
export function removeFromEntityTree(entity: Entity): void {
  const children = getComponent(entity, EntityTreeComponent).children.slice()
  for (const child of children) {
    removeFromEntityTree(child)
  }
  removeComponent(entity, EntityTreeComponent)
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
 * @description
 * Recursively call the `@param cb` function on `@param entity` and all of its children.
 * The `@param cb` function will also be called for `@param entity`
 * The tree will be traversed using the respective {@link EntityTreeComponent} of each entity found in the tree.
 * @note
 * Does not support removing the current `@param entity` node during traversal
 * @param entity Entity Node where traversal will start
 * @param cb Callback function called for every entity of the tree
 * @param index Index of the current node (relative to its parent)
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
  const entityTreeNode = getOptionalComponent(entity, EntityTreeComponent)

  if (entityTreeNode) {
    const children = [...entityTreeNode.children]
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      traverseEntityNodeChildFirst(child, cb, i)
    }
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
  snubChildren = false,
  breakOnFind = false
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
        if (breakOnFind) return result
        idx += 1
        snubChildren &&
          frontier.push(
            getOptionalComponent(item, EntityTreeComponent)?.children?.filter((x) =>
              hasComponent(x, EntityTreeComponent)
            ) ?? []
          )
      }
      !snubChildren &&
        frontier.push(
          getOptionalComponent(item, EntityTreeComponent)?.children?.filter((x) =>
            hasComponent(x, EntityTreeComponent)
          ) ?? []
        )
    }
  }
  return result
}

/**
 * Traverse parent nodes for given Entity Tree Node
 * @param node Node for which traversal will occur
 * @param cb Callback function which will be called for every traverse; return true to stop traversal
 * @param tree Entity Tree
 */
export function traverseEntityNodeParent(entity: Entity, cb: (parent: Entity) => true | void): void {
  const entityTreeNode = getOptionalComponent(entity, EntityTreeComponent)
  if (entityTreeNode?.parentEntity) {
    const parent = entityTreeNode.parentEntity
    const earlyReturn = cb(parent)
    if (earlyReturn === true) return
    traverseEntityNodeParent(parent, cb)
  }
}

/**
 * Returns the closest ancestor of an entity that has the given components by walking up the entity tree
 * @param entity Entity to start from
 * @param components Components to search for
 * @param closest (default true) - whether to return the closest ancestor or the furthest ancestor
 * @param includeSelf (default true) - whether to include the entity itself in the search
 * @returns
 */
export function getAncestorWithComponents(
  entity: Entity,
  components: Component[],
  closest = true,
  includeSelf = true
): Entity {
  let result = hasComponents(entity, components) ? entity : UndefinedEntity
  if (includeSelf && closest && result) return result
  else if (!includeSelf) result = UndefinedEntity

  traverseEntityNodeParent(entity, (parentEntity: Entity) => {
    if (parentEntity === entity && !includeSelf) return
    if (hasComponents(parentEntity, components)) {
      result = parentEntity
      if (closest) return true // stop traversal
    }
  })
  return result
}

/**
 * Finds the index of an entity tree node using entity.
 * This function is useful for node which is not contained in array but can have same entity as one of array elements
 * @param arr Nodes array
 * @param node Node to find index of
 * @returns index of the node if found -1 oterhwise.
 */
export function findIndexOfEntityNode(arr: Entity[], obj: Entity): number {
  for (let i = 0; i < arr.length; i++) {
    const elt = arr[i]
    if (obj === elt) return i
  }
  return -1
}

export function isDeepChildOf(child: Entity, parent: Entity): boolean {
  const childTreeNode = getOptionalComponent(child, EntityTreeComponent)
  if (!childTreeNode) return false
  if (childTreeNode.parentEntity === parent) return true
  return isDeepChildOf(childTreeNode.parentEntity, parent)
}

export function getNestedChildren(entity: Entity, predicate?: (e: Entity) => boolean): Entity[] {
  const children: Entity[] = []
  iterateEntityNode(
    entity,
    (child) => {
      children.push(child)
    },
    predicate,
    true
  )
  return children
}

/**
 * Returns the closest ancestor of an entity that has a component
 * @param entity
 * @param components
 * @param closest
 * @param includeSelf
 * @returns
 */
export function useAncestorWithComponents(
  entity: Entity,
  components: ComponentType<any>[],
  closest: boolean = true,
  includeSelf: boolean = true
) {
  const result = getAncestorWithComponents(entity, components, closest, includeSelf)
  const forceUpdate = useForceUpdate()

  const parentEntity = useOptionalComponent(entity, EntityTreeComponent)?.parentEntity
  const componentsString = components.map((component) => component.name).join()

  // hook into reactive changes up the tree to trigger a re-render of the parent when necessary
  useImmediateEffect(() => {
    let unmounted = false
    const ParentSubReactor = React.memo((props: { entity: Entity }) => {
      const tree = useOptionalComponent(props.entity, EntityTreeComponent)
      const matchesQuery = components.every((component) => !!useOptionalComponent(props.entity, component))
      useEffect(() => {
        if (!unmounted) forceUpdate()
      }, [tree?.parentEntity?.value, matchesQuery])
      if (matchesQuery && closest) return null
      if (!tree?.parentEntity?.value) return null
      return <ParentSubReactor key={tree.parentEntity.value} entity={tree.parentEntity.value} />
    })

    const startEntity = includeSelf ? entity : parentEntity?.value ?? UndefinedEntity

    const root = startEntity
      ? startReactor(function useQueryReactor() {
          return <ParentSubReactor entity={startEntity} key={startEntity} />
        })
      : null

    return () => {
      unmounted = true
      root?.stop()
    }
  }, [entity, componentsString, includeSelf, parentEntity?.value])

  return result
}

/**
 * internal
 */
const _useHasAllComponents = (entity: Entity, components: ComponentType<any>[]) => {
  let result = true
  for (const component of components) {
    if (!useOptionalComponent(entity, component)) {
      result = false
    }
  }
  return result
}

/**
 * Returns the closest child of an entity that has a component
 * @param rootEntity
 * @param components
 */
export function useChildWithComponents(rootEntity: Entity, components: ComponentType<any>[]) {
  const result = useHookstate(UndefinedEntity)
  const componentsString = components.map((component) => component.name).join()
  useLayoutEffect(() => {
    let unmounted = false
    const ChildSubReactor = (props: { entity: Entity }) => {
      const tree = useOptionalComponent(props.entity, EntityTreeComponent)
      const matchesQuery = _useHasAllComponents(props.entity, components)

      useLayoutEffect(() => {
        if (!matchesQuery) return
        result.set(props.entity)
        return () => {
          if (!unmounted) result.set(UndefinedEntity)
        }
      }, [tree?.children?.value, matchesQuery])

      if (matchesQuery) return null

      if (!tree?.children?.value) return null

      return (
        <>
          {tree.children.value.map((e) => (
            <ChildSubReactor key={e} entity={e} />
          ))}
        </>
      )
    }

    const root = startReactor(function useQueryReactor() {
      return <ChildSubReactor entity={rootEntity} key={rootEntity} />
    })
    return () => {
      unmounted = true
      root.stop()
    }
  }, [rootEntity, componentsString])

  return result.value
}

export function useChildrenWithComponents(rootEntity: Entity, components: ComponentType<any>[]): Entity[] {
  const children = useHookstate([] as Entity[])
  const componentsString = components.map((component) => component.name).join()
  useLayoutEffect(() => {
    let unmounted = false
    const ChildSubReactor = (props: { entity: Entity }) => {
      const tree = useOptionalComponent(props.entity, EntityTreeComponent)
      const matchesQuery = _useHasAllComponents(props.entity, components)

      useLayoutEffect(() => {
        if (!matchesQuery) return
        children.set((prev) => {
          if (prev.indexOf(props.entity) < 0) prev.push(props.entity)
          return prev
        })
        return () => {
          if (!unmounted) {
            children.set((prev) => {
              const index = prev.indexOf(props.entity)
              prev.splice(index, 1)
              return prev
            })
          }
        }
      }, [matchesQuery])

      if (!tree?.children?.value) return null
      return (
        <>
          {tree.children.value.map((e) => (
            <ChildSubReactor key={e} entity={e} />
          ))}
        </>
      )
    }

    const root = startReactor(function useQueryReactor() {
      return <ChildSubReactor entity={rootEntity} key={rootEntity} />
    })
    return () => {
      unmounted = true
      root.stop()
    }
  }, [rootEntity, componentsString])

  return children.value as Entity[]
}

export function getChildrenWithComponents(rootEntity: Entity, components: ComponentType<any>[]): Entity[] {
  const children = [] as Entity[]

  const tree = getOptionalComponent(rootEntity, EntityTreeComponent)
  if (!tree?.children) return children

  const results = tree.children.filter((childEntity) => hasComponents(childEntity, components))
  children.push(...results)

  for (const childEntity of tree.children) {
    children.push(...getChildrenWithComponents(childEntity, components))
  }

  return children
}

export function haveCommonAncestor(entity1: Entity, entity2: Entity): boolean {
  const entity1Ancestors: Entity[] = []
  const entity2Ancestors: Entity[] = []

  traverseEntityNodeParent(entity1, (parent) => {
    entity1Ancestors.push(parent)
  })

  traverseEntityNodeParent(entity2, (parent) => {
    entity2Ancestors.push(parent)
  })

  for (const entity of entity1Ancestors) {
    if (entity2Ancestors.includes(entity)) return true
  }

  return false
}

// Returns an array of objects that are not ancestors of any other objects in the array.
export function findCommonAncestors(objects: Entity[], target: Entity[] = []): Entity[] {
  // Initially all objects are candidates
  for (let i = 0; i < objects.length; i++) target.push(objects[i])

  // For each object check if it is an ancestor of any of the other objects.
  // If so reject that object and remove it from the candidate array.
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i]
    let validCandidate = true

    for (let j = 0; j < target.length; j++) {
      if (isAncestor(target[j], object)) {
        validCandidate = false
        break
      }
    }

    if (!validCandidate) {
      const index = findIndexOfEntityNode(target, object)
      if (index === -1) throw new Error('Object not found')

      target.splice(index, 1)
    }
  }

  return target
}

export function isAncestor(parent: Entity, potentialChild: Entity, includeSelf = false) {
  if (!potentialChild || !parent) return false
  if (!includeSelf && parent === potentialChild) return false
  return traverseEarlyOut(parent, (child) => child === potentialChild)
}

export function traverseEarlyOut(entity: Entity, cb: (entity: Entity) => boolean): boolean {
  let stopTravel = cb(entity)

  if (stopTravel) return stopTravel

  const entityTreeComponent = getComponent(entity, EntityTreeComponent)

  const children = entityTreeComponent.children
  if (!children) return stopTravel

  for (let i = 0; i < children.length; i++) {
    const child = children[i]

    if (child) {
      stopTravel = traverseEarlyOut(child, cb)
      if (stopTravel) break
    }
  }

  return stopTravel
}

/**
 * Filters the parent entities from the given entity list.
 * In a given entity list, suppose 2 entities has parent child relation (can be any level deep) then this function will
 * filter out the child entity.
 * @param nodeList List of entities to find parents from
 * @param parentNodeList Resulter parent list
 * @param filterUnremovable Whether to filter unremovable entities
 * @param filterUntransformable Whether to filter untransformable entities
 * @returns List of parent entities
 */
export const filterParentEntities = (
  rootEntity: Entity,
  entityList: Entity[],
  parentEntityList: Entity[] = [],
  filterUnremovable = true,
  filterUntransformable = true
): Entity[] => {
  parentEntityList.length = 0

  // Recursively find the nodes in the tree with the lowest depth
  const traverseParentOnly = (entity: Entity) => {
    if (!entity) return

    const node = getComponent(entity, EntityTreeComponent)

    if (
      entityList.includes(entity) &&
      !(filterUnremovable && !node.parentEntity) &&
      !(filterUntransformable && !hasComponent(entity, TransformComponent))
    ) {
      parentEntityList.push(entity)
      return
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        traverseParentOnly(node.children[i])
      }
    }
  }

  traverseParentOnly(rootEntity)

  return parentEntityList
}
