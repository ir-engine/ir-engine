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
import { none, startReactor, useForceUpdate, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import React, { useEffect, useLayoutEffect } from 'react'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { TransformComponent } from './TransformComponent'

type EntityTreeSetType = {
  parentEntity: Entity
  childIndex?: number
}

/**
 * @description
 * Describes parent-child relationship between entities.
 * A root entity has it's parentEntity set to null.
 *
 * @param parentEntity _(Optional)_ The entity where this entity connects to the EntityTree
 * @param childIndex _(Optional)_ The position that this entity should be found at in the `@param parentEntity`.EntityTreeComponent.children list
 * @param children _(Internal)_ The list of entities that are connected to this entity in the EntityTree
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
 * @description
 * Recursively call {@link removeComponent} with {@link EntityTreeComponent} on `@param entity` and all its children entities
 * Children entities will be traversed first
 *
 * @param entity The parent entity where traversal will start.
 */
export function removeFromEntityTree(entity: Entity): void {
  traverseEntityNodeChildFirst(entity, (nodeEntity) => {
    removeComponent(nodeEntity, EntityTreeComponent)
  })
}

/**
 * @description
 * Recursively call {@link removeEntity} on `@param entity` and all its children entities
 * Children entities will be traversed first
 *
 * @param entity The parent entity where traversal will start.
 */
export function removeEntityNodeRecursively(entity: Entity) {
  traverseEntityNodeChildFirst(entity, (nodeEntity) => {
    removeEntity(nodeEntity)
  })
}
/**
 * @deprecated Use {@link removeEntityNodeRecursively} instead */
export const destroyEntityTree = removeEntityNodeRecursively

/**
 * @description
 * Recursively call `@param cb` function on `@param entity` and all its children.
 * The tree will be traversed using the {@link EntityTreeComponent} of each entity found in the tree.
 * @note
 * Does not support removing the current `@param entity` node during traversal
 * The `@param cb` function will be called for `@param entity` first
 *
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

/**
 * @description
 * Recursively call `@param cb` function on `@param entity` and all its children.
 * The tree will be traversed using the {@link EntityTreeComponent} of each entity found in the tree.
 * @note
 * Supports removing the current `@param entity` node during traversal
 * The `@param cb` function will be called for `@param entity` at the end
 *
 * @param entity Entity Node where traversal will start
 * @param cb Callback function called for every entity of the tree
 * @param index Index of the current node (relative to its parent)
 */
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
 * @description
 * Traverse the children nodes of `@param entity` iteratively, and call `@param cb` on them when the requested conditions are matched.
 * Will return the array of all `@type R` returned by `@param cb` on each iteration.
 *
 * @param entity Entity Node where traversal will start
 * @param cb Callback function called on every entity found in the tree
 * @param pred An entity (and its children) won't be processed when the predicate function returns false for that entity
 * @param snubChildren When true: Do not traverse the children of a node when `@param pred` returns false
 * @param breakOnFind Whe true: Traversal will stop as soon as `@param pred` returns true for the first time. No children will be included in the result
 * @returns The list of `@type R` for all entities that matched the conditions.
 */
export function iterateEntityNode<R>(
  entity: Entity,
  cb: (entity: Entity, index: number) => R,
  pred: (entity: Entity) => boolean = (_e) => true,
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
 * @description
 * Recursively calls `@param cb` on every parent entity in the `@param entity`'s {@link EntityTreeComponent}
 *
 * @param entity Entity Node where traversal will start
 * @param cb
 * Callback function that will be called for every traverse
 * Returning true from the cb will early stop traversal _(no matter if the currentEntity.EntityTreeComponent.parentEntity has any parents or not)_
 */
export function traverseEntityNodeParent(entity: Entity, cb: (parent: Entity) => true | void): void {
  const entityTreeNode = getOptionalComponent(entity, EntityTreeComponent)
  if (entityTreeNode?.parentEntity) {
    const earlyReturn = cb(entityTreeNode.parentEntity)
    if (earlyReturn === true) return
    traverseEntityNodeParent(entityTreeNode.parentEntity, cb)
  }
}

/**
 * @description
 * Finds the closest ancestor of `@param entity` that has all the `@param components` by walking up the entity's {@link EntityTreeComponent}
 *
 * @param entity Entity Node from which traversal will start
 * @param components Components to search for
 * @param closest _(@default true)_ - Whether to return the closest ancestor or the furthest ancestor
 * @param includeSelf _(@default true)_ - Whether to include the `@param entity` in the search or not
 * @returns The parent entity _(or itself when relevant)_
 * */
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
 * @description
 * Returns the array index of `@param entity` inside the `@param list` of {@link Entity} IDs
 * Useful for nodes that are not contained in the array but can have the same entity as one of the array elements
 *
 * @param list The list of {@link Entity} IDs where the `@param entity` will be searched for
 * @param entity The {@link Entity} ID to search for
 * @returns
 * The index of `@param entity` inside `@param list` when the entity was found
 * `-1` when the `@param entity` wasn't found
 * */
export function findIndexOfEntityNode(list: Entity[], entity: Entity): number {
  for (let id = 0; id < list.length; ++id) {
    if (entity === list[id]) return id
  }
  return -1
}

/**
 * @description
 * Returns whether or not the `@param child` is part of the `@param parent`'s {@link EntityTreeComponent} hierarchy
 *
 * @param child The Entity Node to search for
 * @param parent The Entity Node where the search will start
 * */
export function isDeepChildOf(child: Entity, parent: Entity): boolean {
  const childTreeNode = getOptionalComponent(child, EntityTreeComponent)
  if (!childTreeNode) return false
  if (childTreeNode.parentEntity === parent) return true
  return isDeepChildOf(childTreeNode.parentEntity, parent)
}

/**
 * @description
 * Returns an {@link Entity} list that contains all children of `@param entity` and all children of those children recursively.
 * Traversal will stop early when `@param pred` returns true for an entity. The entire tree will be traversed otherwise.
 *
 * @param entity Entity Node where traversal will start
 * @param pred An entity (and its children) won't be processed when the predicate function returns false for that entity
 * @returns The resulting {@link Entity} list of children entities that matched the conditions.
 * */
export function getNestedChildren(entity: Entity, pred?: (e: Entity) => boolean): Entity[] {
  const result: Entity[] = []
  iterateEntityNode(
    entity,
    (child) => {
      result.push(child)
    },
    pred,
    true
  )
  return result
}

/**
 *
 * @param entity
 * @returns
 */
export function useTreeQuery(entity: Entity) {
  const result = useHookstate({} as Record<Entity, boolean>)

  /** @todo - maybe optimize this to a registry of some sort, deduplicate for useTreeQuery calls for the same entity? */
  /** @todo - benchmark this... */
  useLayoutEffect(() => {
    let unmounted = false
    const TreeSubReactor = (props: { entity: Entity }) => {
      const tree = useOptionalComponent(props.entity, EntityTreeComponent)

      useLayoutEffect(() => {
        if (!tree) return
        result[props.entity].set(true)
        return () => {
          if (!unmounted)
            // this is kind of a hack? we can put TreeSubReactor back in module scope if we can somehow detect that the useTreeQuery has unmounted and avoid hookstate 106
            result[props.entity].set(none)
        }
      }, [tree])

      if (!tree) return null

      return (
        <>
          {tree.children.value.map((e) => (
            <TreeSubReactor key={e} entity={e} />
          ))}
        </>
      )
    }

    const root = startReactor(function useQueryReactor() {
      return <TreeSubReactor entity={entity} />
    })
    return () => {
      unmounted = true
      root.stop()
    }
  }, [entity])

  return result.keys.map(Number) as Entity[]
}

/**
 * @description
 * React Hook that returns the closest or furthest ancestor {@link Entity} of `@param entity` that has all of the `@param components`
 *
 * @param entity The {@link Entity} whose {@link EntityTreeComponent} will be traversed during the search.
 * @param components The list of Components that the child must have in order to be considered a match.
 * @param closest _(default: true)_ - Returns the closest entity when true. Returns the furthest entity otherwise.
 * @param includeSelf _(@default true)_ - Whether to include the `@param entity` in the search or not
 * @returns The ancestor {@link Entity} of `@param entity` that matched the conditions
 * */
export function useAncestorWithComponents(
  entity: Entity,
  components: ComponentType<any>[],
  closest: boolean = true,
  includeSelf: boolean = true
): Entity {
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
 * @internal
 * @description
 * React Hook that returns the closest child {@link Entity} of `@param rootEntity` that has all of the `@param components`
 *
 * @param rootEntity The {@link Entity} whose {@link EntityTreeComponent} will be traversed during the search.
 * @param components The list of Components that the child must have in order to be considered a match.
 * @returns The closest child {@link Entity} of `@param rootEntity` that matched the conditions.
 * */
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

/**
 * @description
 * Returns an {@link Entity} array that will contain all child entities of `@param rootEntity` that have all of the `@param components`
 *
 * @param rootEntity The entity where traversal will start
 * @param components List of components that a child entity must have to be added to the result
 * @param result
 * _(optional)_
 * Array where the resulting entities will be added by `Array.push()`.
 * It will **not** be erased before traversal.
 * @returns An {@link Entity} array that contains the children that matched the condition
 * */
export function getChildrenWithComponents(
  rootEntity: Entity,
  components: ComponentType<any>[],
  result = [] as Entity[]
): Entity[] {
  const tree = getOptionalComponent(rootEntity, EntityTreeComponent)
  if (!tree?.children) return result

  // Add the current entity's children to the result
  result.push(...tree.children.filter((childEntity) => hasComponents(childEntity, components)))
  // Recurse search
  for (const childEntity of tree.children) getChildrenWithComponents(childEntity, components, result)

  return result
}

/** @todo make a query component for useTreeQuery */
// export function TreeQueryReactor (props: { Components: QueryComponents; ChildEntityReactor: FC; props?: any }) {

// }

/**
 * @description
 * Returns whether or not `@param entity1` and `@param entity2` have a parent entity in common in their EntityTrees
 * EntityTree traversal will go up the tree searching for parents, and creating the list that will be compared.
 *
 * @param entity1 The first entity that will be compared
 * @param entity2 The second entity that will be compared
 * @returns True/False depending on whether they share a parent or not
 * */
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

/**
 * @description
 * Returns the filtered list of `@param entities` that are not ancestors of any other entities in the `@param target` array.
 *
 * @param entities The list of entities that will be searched for
 * @param result _(default: [])_ {@link Entity} list used to store the resulting list during the process
 * @returns The resulting filtered {@link Entity} list. Will be the same array as `@param result`
 * */
export function findCommonAncestors(entities: Entity[], result: Entity[] = []): Entity[] {
  // Initially all entities are candidates
  for (let i = 0; i < entities.length; i++) result.push(entities[i])

  // Check if each entity is an ancestor of any of the other entities.
  // If so reject that entity and remove it from the candidates array.
  for (let i = 0; i < entities.length; ++i) {
    const entity = entities[i]
    let validCandidate = true

    for (let j = 0; j < result.length; ++j) {
      if (isAncestor(result[j], entity)) {
        validCandidate = false
        break
      }
    }

    if (!validCandidate) {
      const index = findIndexOfEntityNode(result, entity)
      if (index === -1) throw new Error('Object not found')

      result.splice(index, 1)
    }
  }

  return result
}

/**
 * @description
 * Returns whether `@param potentialChild` is part of the `@param parent`'s EntityTree or not.
 *
 * @param parent The entity whose EntityTree will be traversed during the search process.
 * @param potentialChild The child entity that will be searched for inside `@param parent`'s EntityTree.
 * @param includeSelf _(default: false)_ - Allow returning true when `@param parent` and `@param potentialChild` are the same entity.
 * */
export function isAncestor(parent: Entity, potentialChild: Entity, includeSelf = false) {
  if (!potentialChild || !parent) return false
  if (!includeSelf && parent === potentialChild) return false
  return traverseEarlyOut(parent, (child) => child === potentialChild)
}

/**
 * @description
 * Recursively call `@param cb` function on `@param entity` and all its children.
 * Traversal will stop as soon as `@param cb` returns true for the first time
 * @note The `@param cb` function will be called for `@param entity` first
 *
 * @param entity Entity Node where traversal will start
 * @param cb
 * Callback function that will be called for every traverse
 * Returning true from the cb will immediately stop traversal
 * */
export function traverseEarlyOut(entity: Entity, cb: (entity: Entity) => boolean): boolean {
  let stopTravel = cb(entity)

  if (stopTravel) return stopTravel

  const entityTreeComponent = getOptionalComponent(entity, EntityTreeComponent)
  const children = entityTreeComponent?.children
  if (!children) return stopTravel

  for (let id = 0; id < children.length; ++id) {
    const child = children[id]

    if (child) {
      stopTravel = traverseEarlyOut(child, cb)
      if (stopTravel) break
    }
  }

  return stopTravel
}

/**
 * @description
 * Filters the parent entities from the given entity list.
 * Assuming two entities have a parent child relationship _(can be any level deep)_ in a given entity list,
 * then this function will filter out the child entity.
 *
 * @param rootEntity The {@link Entity} where traversal will start
 * @param entityList List of entities to find parents from
 * @param result Resulting list of parent {@link Entity}. Will be cleared before starting the process.
 * @param filterUnremovable Whether to filter unremovable entities or not
 * @param filterUntransformable Whether to filter untransformable entities or not
 * @returns The resulting {@link Entity} list of parent entities
 */
export const filterParentEntities = (
  rootEntity: Entity,
  entityList: Entity[],
  result: Entity[] = [],
  filterUnremovable = true,
  filterUntransformable = true
): Entity[] => {
  result.length = 0

  // Recursively find the nodes in the tree with the lowest depth
  const traverseParentOnly = (entity: Entity) => {
    if (!entity) return

    const node = getOptionalComponent(entity, EntityTreeComponent)

    if (
      entityList.includes(entity) &&
      !(filterUnremovable && !node?.parentEntity) &&
      !(filterUntransformable && !hasComponent(entity, TransformComponent))
    ) {
      result.push(entity)
      return
    }

    if (node?.children) {
      for (let id = 0; id < node?.children.length; ++id) {
        traverseParentOnly(node?.children[id])
      }
    }
  }

  traverseParentOnly(rootEntity)

  return result
}
