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

import { render } from '@testing-library/react'
import React, { useEffect } from 'react'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'

import { EntityUUID, hasComponents, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, hasComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { createEntity, entityExists, removeEntity } from '@ir-engine/ecs/src/EntityFunctions'

import { NameComponent } from '../../common/NameComponent'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'

import { assertArray } from '../../../tests/util/assert'
import { BackgroundComponent, SceneComponent } from '../../renderer/components/SceneComponents'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import {
  EntityTreeComponent,
  findIndexOfEntityNode,
  getAncestorWithComponents,
  getChildrenWithComponents,
  getNestedChildren,
  getTreeFromChildToAncestor,
  haveCommonAncestor,
  isAncestor,
  isDeepChildOf,
  iterateEntityNode,
  removeEntityNodeRecursively,
  removeFromEntityTree,
  traverseEarlyOut,
  traverseEntityNode,
  traverseEntityNodeChildFirst,
  traverseEntityNodeParent,
  useAncestorWithComponents,
  useChildrenWithComponents,
  useChildWithComponents
} from './EntityTree'

/**
 * @description An Entity's Hierarchy is considered valid when:
 * - The entity's value is truthy
 * - The entity has an EntityTreeComponent
 * - Its parent is the given parent entity, or has no parent when omitted
 * @param name The name of the Entity used for reporting assertions to CLI
 * @param entity The entity to validate
 * @param parent The entity that the validated entity must have as a parent  _(default: UndefinedEntity)_
 */
function assertEntityHierarchy(name: string, entity: Entity, parent: Entity = UndefinedEntity): void {
  assert(entity, name + " wasn't found")
  assert.equal(true, hasComponent(entity, EntityTreeComponent), name + ' does not have an EntityTreeComponent')
  assert.equal(
    parent,
    getComponent(entity, EntityTreeComponent).parentEntity,
    parent ? name + "'s parent is not " + getComponent(parent, NameComponent) : name + ' does not have a parentEntity'
  )
}

type EntityTreeComponentData = {
  parentEntity: Entity
  childIndex?: number
  children: Entity[]
}

const EntityTreeComponentDefaults: EntityTreeComponentData = {
  parentEntity: UndefinedEntity,
  childIndex: undefined,
  children: [] as Entity[]
}

function assertEntityTreeComponentEq(A: EntityTreeComponentData, B: EntityTreeComponentData): void {
  assert.equal(A.parentEntity, B.parentEntity)
  assert.equal(A.childIndex, B.childIndex)
  assertArray.eq(A.children, B.children)
}

describe('EntityTreeComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(EntityTreeComponent.name, 'EntityTreeComponent')
    })
  }) //:: Fields

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, EntityTreeComponent)
      assertEntityTreeComponentEq(data, EntityTreeComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized EntityTreeComponent', () => {
      // Set the data as expected
      const parentEntity = createEntity()
      const children = [createEntity(), createEntity()] as Entity[]
      for (let id = 0; id < children.length; ++id) {
        const entity = children[id]
        const first = id === 0
        setComponent(entity, EntityTreeComponent, { parentEntity: first ? parentEntity : children[id - 1] })
      }
      const Expected = {
        parentEntity: parentEntity,
        childIndex: 3,
        children: [] as Entity[] // Dummy Array, won't be used by onSet. Meant to be internal/"readonly"
      }
      // Sanity check before running
      const before = getComponent(testEntity, EntityTreeComponent)
      assertEntityTreeComponentEq(before, EntityTreeComponentDefaults)
      // Run and Check the result
      setComponent(testEntity, EntityTreeComponent, Expected)
      const after = getComponent(testEntity, EntityTreeComponent)
      assertEntityTreeComponentEq(after, Expected)
    })
  }) //:: onSet

  describe('reactor', () => {
    describe('whenever entityContext.EntityTreeComponent.{parentEntity, childIndex} change', () => {
      describe('when entity.EntityTreeComponent.parentEntity is truthy, exists, and has an EntitytTreeComponent', () => {
        let testEntity = UndefinedEntity
        let parentEntity = UndefinedEntity
        let childEntity = UndefinedEntity

        beforeEach(async () => {
          createEngine()
          parentEntity = createEntity()
          childEntity = createEntity()
          testEntity = createEntity()
        })

        afterEach(() => {
          removeEntity(testEntity)
          removeEntity(childEntity)
          removeEntity(parentEntity)
          return destroyEngine()
        })

        it("should add an EntityTreeComponent to the parentEntity if it doesn't have one", () => {
          const Expected = true
          const Initial = !Expected
          // Sanity check before running
          const before = hasComponent(parentEntity, EntityTreeComponent)
          assert.equal(before, Initial)
          // Run and Check the result
          setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
          const result = hasComponent(parentEntity, EntityTreeComponent)
          assert.equal(result, Expected)
        })

        it(`should move the position of the entityContext's id on the parentEntity.EntityTreeComponent.children list
            when entityContext.EntityTreeComponent.childIndex is specified
            and the entity is already stored in the list at a different index`, () => {
          const Expected = 0
          const Initial = 1
          // Set the data as expected
          setComponent(parentEntity, EntityTreeComponent)
          setComponent(childEntity, EntityTreeComponent, { parentEntity: parentEntity })
          setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
          // Sanity check before running
          assert.equal(hasComponent(parentEntity, EntityTreeComponent), true)
          assert.equal(getComponent(testEntity, EntityTreeComponent).childIndex, undefined)
          const before = getComponent(parentEntity, EntityTreeComponent).children.indexOf(testEntity)
          assert.equal(before, Initial)
          // Run and Check the result
          setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity, childIndex: Expected })
          const result = getComponent(parentEntity, EntityTreeComponent).children.indexOf(testEntity)
          assert.equal(result, Expected)
        })

        it(`should add the entityContext's id to the end of the parentEntity.EntityTreeComponent.children list
            when the entity is not already stored in the list
            and entityContext.EntityTreeComponent.childIndex is specified`, () => {
          const Expected = 1
          const Initial = -1
          // Set the data as expected
          setComponent(parentEntity, EntityTreeComponent)
          setComponent(childEntity, EntityTreeComponent, { parentEntity: parentEntity })
          // Sanity check before running
          assert.equal(hasComponent(parentEntity, EntityTreeComponent), true)
          assert.equal(getComponent(parentEntity, EntityTreeComponent).children.length, 1)
          assert.equal(hasComponent(testEntity, EntityTreeComponent), false)
          assert.notEqual(getComponent(parentEntity, EntityTreeComponent).children.indexOf(childEntity), -1)
          const before = getComponent(parentEntity, EntityTreeComponent).children.indexOf(testEntity)
          assert.equal(before, Initial)
          // Run and Check the result
          setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity, childIndex: Expected })
          assert.notEqual(getComponent(testEntity, EntityTreeComponent).childIndex, undefined)
          const result = getComponent(parentEntity, EntityTreeComponent).children.indexOf(testEntity)
          assert.equal(result, Expected)
        })

        it(`should add the entityContext's id to the end of the parentEntity.EntityTreeComponent.children list
            when the entity is not already stored in the list
            and entityContext.EntityTreeComponent.childIndex is not specified`, () => {
          const Expected = 1
          const Initial = -1
          // Set the data as expected
          setComponent(parentEntity, EntityTreeComponent)
          setComponent(childEntity, EntityTreeComponent, { parentEntity: parentEntity })
          // Sanity check before running
          assert.equal(hasComponent(parentEntity, EntityTreeComponent), true)
          assert.equal(getComponent(parentEntity, EntityTreeComponent).children.length, 1)
          assert.equal(hasComponent(testEntity, EntityTreeComponent), false)
          assert.notEqual(getComponent(parentEntity, EntityTreeComponent).children.indexOf(childEntity), -1)
          const before = getComponent(parentEntity, EntityTreeComponent).children.indexOf(testEntity)
          assert.equal(before, Initial)
          // Run and Check the result
          setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
          assert.equal(getComponent(testEntity, EntityTreeComponent).childIndex, undefined)
          const result = getComponent(parentEntity, EntityTreeComponent).children.indexOf(testEntity)
          assert.equal(result, Expected)
        })

        it('should remove the entity, when its EntityTreeComponent unmounts, from its EntityTreeComponent.parentEntity.EntityTreeComponent.children list', () => {
          const Expected = -1
          const Initial = 1
          // Set the data as expected
          setComponent(parentEntity, EntityTreeComponent)
          setComponent(childEntity, EntityTreeComponent, { parentEntity: parentEntity })
          setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
          // Sanity check before running
          assert.equal(hasComponent(parentEntity, EntityTreeComponent), true)
          assert.equal(getComponent(parentEntity, EntityTreeComponent).children.length, 2)
          assert.equal(hasComponent(testEntity, EntityTreeComponent), true)
          assert.notEqual(getComponent(parentEntity, EntityTreeComponent).children.indexOf(childEntity), -1)
          assert.notEqual(getComponent(parentEntity, EntityTreeComponent).children.indexOf(testEntity), -1)
          const before = getComponent(parentEntity, EntityTreeComponent).children.indexOf(testEntity)
          assert.equal(before, Initial)
          // Run and Check the result
          removeComponent(testEntity, EntityTreeComponent)
          assert.equal(hasComponent(testEntity, EntityTreeComponent), false)
          const result = getComponent(parentEntity, EntityTreeComponent).children.indexOf(testEntity)
          assert.equal(result, Expected)
        })
      })
    })
  }) //:: reactor

  describe('General Purpose', () => {
    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should add default values', () => {
      const entity = createEntity()
      setComponent(entity, EntityTreeComponent)
      const node = getComponent(entity, EntityTreeComponent)
      assert.equal(node.children.length, 0)
      assert.equal(node.parentEntity, UndefinedEntity)
    })

    it('should set given values', () => {
      const rootEntity = createEntity()

      setComponent(rootEntity, EntityTreeComponent, {
        parentEntity: UndefinedEntity
      })
      setComponent(rootEntity, UUIDComponent, 'root' as EntityUUID)

      const entity = createEntity()
      const testUUID = 'test-uuid' as EntityUUID
      setComponent(entity, EntityTreeComponent, { parentEntity: rootEntity })
      setComponent(entity, UUIDComponent, testUUID)

      const node = getComponent(entity, EntityTreeComponent)

      assert.equal(node.children.length, 0)
      assert.equal(node.parentEntity, rootEntity)

      assert.equal(getComponent(entity, UUIDComponent), testUUID)
      assert.equal(UUIDComponent.getEntityByUUID(testUUID), entity)

      const parentNode = getComponent(node.parentEntity!, EntityTreeComponent)
      assert.equal(parentNode.children.length, 1)
      assert.equal(parentNode.children[0], entity)
    })

    it('should set child at a given index', () => {
      const rootEntity = createEntity()

      setComponent(rootEntity, EntityTreeComponent, {
        parentEntity: UndefinedEntity
      })
      setComponent(rootEntity, UUIDComponent, 'root' as EntityUUID)

      const child_0 = createEntity()
      setComponent(child_0, EntityTreeComponent, {
        parentEntity: rootEntity
      })
      setComponent(child_0, UUIDComponent, 'child-0' as EntityUUID)
      const child_1 = createEntity()
      setComponent(child_1, EntityTreeComponent, {
        parentEntity: rootEntity
      })
      setComponent(child_1, UUIDComponent, 'child-1' as EntityUUID)
      const child_2 = createEntity()
      setComponent(child_2, EntityTreeComponent, {
        parentEntity: rootEntity
      })
      setComponent(child_2, UUIDComponent, 'child-2' as EntityUUID)
      const child_3 = createEntity()
      setComponent(child_3, EntityTreeComponent, {
        parentEntity: rootEntity
      })
      setComponent(child_3, UUIDComponent, 'child-3' as EntityUUID)
      const child_4 = createEntity()
      setComponent(child_4, EntityTreeComponent, {
        parentEntity: rootEntity
      })
      setComponent(child_4, UUIDComponent, 'child-4' as EntityUUID)

      const entity = createEntity()
      setComponent(entity, EntityTreeComponent, {
        parentEntity: rootEntity,
        childIndex: 2
      })
      setComponent(entity, UUIDComponent, 'test-uuid' as EntityUUID)

      const sceneNode = getComponent(rootEntity, EntityTreeComponent)
      assert.equal(sceneNode.children.length, 6)
      assert.equal(sceneNode.children[0], UUIDComponent.getEntityByUUID('child-0' as EntityUUID))
      assert.equal(sceneNode.children[1], UUIDComponent.getEntityByUUID('child-1' as EntityUUID))
      assert.equal(sceneNode.children[2], entity)
      assert.equal(sceneNode.children[3], UUIDComponent.getEntityByUUID('child-2' as EntityUUID))
      assert.equal(sceneNode.children[4], UUIDComponent.getEntityByUUID('child-3' as EntityUUID))
      assert.equal(sceneNode.children[5], UUIDComponent.getEntityByUUID('child-4' as EntityUUID))
      assert.equal(sceneNode.parentEntity, UndefinedEntity)
    })

    it('should remove entity from maps', () => {
      const rootEntity = createEntity()

      setComponent(rootEntity, EntityTreeComponent, {
        parentEntity: UndefinedEntity
      })
      setComponent(rootEntity, UUIDComponent, 'root' as EntityUUID)

      const entity = createEntity()
      setComponent(entity, EntityTreeComponent, { parentEntity: rootEntity })
      setComponent(entity, UUIDComponent, 'test-uuid' as EntityUUID)
      removeComponent(entity, EntityTreeComponent)

      // UUIDComponent should remain
      assert.equal(getComponent(entity, UUIDComponent), 'test-uuid')
      assert.equal(UUIDComponent.getEntityByUUID('test-uuid' as EntityUUID), entity)

      const parentNode = getComponent(rootEntity, EntityTreeComponent)
      assert.equal(parentNode.children.length, 0)
    })

    describe('addEntityNodeChild function replacement cases', () => {
      let root: Entity

      beforeEach(() => {
        root = createEntity()
        setComponent(root, EntityTreeComponent, { parentEntity: UndefinedEntity })
        setComponent(root, UUIDComponent, 'root' as EntityUUID)
      })

      it('should not add the entity node to the parent.EntityTreeComponent.children list if it was already added', () => {
        const node = createEntity()
        setComponent(node, EntityTreeComponent, { parentEntity: root })
        const rootNode = getComponent(root, EntityTreeComponent)
        assert.equal(rootNode.children.length, 1)
        setComponent(node, EntityTreeComponent, { parentEntity: root })
        assert.equal(rootNode.children.length, 1)
      })

      it(`should update the parent.EntityTreeComponent.children list and reparent the entity node
          whenever entity.EntityTreeComponent.parentEntity changes`, () => {
        const child = createEntity()
        setComponent(child, EntityTreeComponent, { parentEntity: root })

        const parent = createEntity()
        setComponent(parent, EntityTreeComponent, { parentEntity: UndefinedEntity })
        setComponent(child, EntityTreeComponent, { parentEntity: parent })

        const parentNode = getComponent(parent, EntityTreeComponent)
        const childNode = getComponent(child, EntityTreeComponent)
        const rootNode = getComponent(root, EntityTreeComponent)

        assert.equal(rootNode.children.length, 0)
        assert.equal(parentNode.children.length, 1)
        assert.equal(parentNode.children[0], child)
        assert.equal(childNode.parentEntity, parent)
      })
    }) //:: addEntityNodeChild replacement
  }) //:: General Purpose
}) //:: EntityTreeComponent

describe('removeEntityNodeRecursively', () => {
  let parentEntity: Entity

  beforeEach(() => {
    createEngine()

    parentEntity = createEntity()
    setComponent(parentEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(parentEntity, UUIDComponent, 'root' as EntityUUID)
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should recursively call `removeEntity` on the `@param entity` and every entity in its EntityTreeComponent.children', () => {
    // Set the data as expected
    const children = [createEntity(), createEntity(), createEntity(), createEntity(), createEntity()]
    for (let id = 0; id < children.length; ++id) {
      const entity = children[id]
      const first = id === 0
      setComponent(entity, EntityTreeComponent, { parentEntity: first ? parentEntity : children[id - 1] })
    }
    // Sanity check before running
    assert.equal(hasComponent(parentEntity, EntityTreeComponent), true)
    assert.equal(entityExists(parentEntity), true)
    for (const entity of children) {
      assert.equal(hasComponent(entity, EntityTreeComponent), true)
      assert.equal(entityExists(entity), true)
    }
    // Run and Check the result
    removeEntityNodeRecursively(parentEntity)
    assert.equal(hasComponent(parentEntity, EntityTreeComponent), false)
    assert.equal(entityExists(parentEntity), false)
    for (const entity of children) {
      assert.equal(hasComponent(entity, EntityTreeComponent), false)
      assert.equal(entityExists(entity), false)
    }
  })

  it('should empty the entity tree', () => {
    // Set the data as expected
    const node_0 = createEntity()
    const node_0_0 = createEntity()
    const node_0_1 = createEntity()
    const node_0_0_0 = createEntity()
    const node_0_1_0 = createEntity()
    setComponent(node_0, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
    setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })

    // Run and Check the result
    removeEntityNodeRecursively(node_0)
    assert(hasComponent(parentEntity, EntityTreeComponent))
    assert(!hasComponent(node_0, EntityTreeComponent))
    assert(!hasComponent(node_0_0, EntityTreeComponent))
    assert(!hasComponent(node_0_1, EntityTreeComponent))
    assert(!hasComponent(node_0_0_0, EntityTreeComponent))
    assert(!hasComponent(node_0_1_0, EntityTreeComponent))
  })
}) //:: removeEntityNodeRecursively

describe('removeFromEntityTree', () => {
  let parentEntity: Entity

  beforeEach(() => {
    createEngine()

    parentEntity = createEntity()
    setComponent(parentEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(parentEntity, UUIDComponent, 'root' as EntityUUID)
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should recursively call `removeComponent` on the `@param entity` and every entity in its EntityTreeComponent.children', () => {
    // Set the data as expected
    const children = [createEntity(), createEntity(), createEntity(), createEntity(), createEntity()]
    for (let id = 0; id < children.length; ++id) {
      const entity = children[id]
      const first = id === 0
      setComponent(entity, EntityTreeComponent, { parentEntity: first ? parentEntity : children[id - 1] })
    }
    // Sanity check before running
    assert.equal(entityExists(parentEntity), true)
    assert.equal(hasComponent(parentEntity, EntityTreeComponent), true)
    for (const entity of children) {
      assert.equal(entityExists(entity), true)
      assert.equal(hasComponent(entity, EntityTreeComponent), true)
    }
    // Run and Check the result
    removeFromEntityTree(parentEntity)
    assert.equal(entityExists(parentEntity), true)
    assert.equal(hasComponent(parentEntity, EntityTreeComponent), false)
    for (const entity of children) {
      assert.equal(entityExists(entity), true)
      assert.equal(hasComponent(entity, EntityTreeComponent), false)
    }
  })

  it('should empty the entity tree', () => {
    // Set the data as expected
    const node_0 = createEntity()
    const node_0_0 = createEntity()
    const node_0_1 = createEntity()
    const node_0_0_0 = createEntity()
    const node_0_1_0 = createEntity()
    setComponent(node_0, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
    setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })

    // Run and Check the result
    removeFromEntityTree(node_0)
    assert(hasComponent(parentEntity, EntityTreeComponent))
    assert(!hasComponent(node_0, EntityTreeComponent))
    assert(!hasComponent(node_0_0, EntityTreeComponent))
    assert(!hasComponent(node_0_1, EntityTreeComponent))
    assert(!hasComponent(node_0_0_0, EntityTreeComponent))
    assert(!hasComponent(node_0_1_0, EntityTreeComponent))
  })
}) //:: removeFromEntityTree

describe('traverseEntityNode', () => {
  let parentEntity: Entity

  beforeEach(() => {
    createEngine()

    parentEntity = createEntity()
    setComponent(parentEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(parentEntity, UUIDComponent, 'root' as EntityUUID)
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should traverse the children nodes and run the callback function on them', () => {
    // Set the data as expected
    const node_0 = createEntity()
    const node_0_0 = createEntity()
    const node_0_1 = createEntity()
    const node_0_0_0 = createEntity()
    const node_0_1_0 = createEntity()
    setComponent(node_0, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
    setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })
    // Run and Check the result
    const visited = [] as Entity[]
    traverseEntityNode(node_0, (node) => visited.push(node))
    assert.equal(visited.length, 5)
    assert.equal(visited[0], node_0)
    assert.equal(visited[1], node_0_0)
    assert.equal(visited[2], node_0_0_0)
    assert.equal(visited[3], node_0_1)
    assert.equal(visited[4], node_0_1_0)
    // Re-run and Check the new result
    const visitedAgain = [] as Entity[]
    traverseEntityNode(node_0_0, (node) => visitedAgain.push(node))
    assert.equal(visitedAgain.length, 2)
    assert.equal(visitedAgain[0], node_0_0)
    assert.equal(visitedAgain[1], node_0_0_0)
  })
}) //:: traverseEntityNode

describe('traverseEntityNodeChildFirst', () => {
  let parentEntity: Entity

  beforeEach(() => {
    createEngine()

    parentEntity = createEntity()
    setComponent(parentEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(parentEntity, UUIDComponent, 'root' as EntityUUID)
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should traverse the children nodes and run the callback function on them', () => {
    // Set the data as expected
    const node_0 = createEntity()
    const node_0_0 = createEntity()
    const node_0_1 = createEntity()
    const node_0_0_0 = createEntity()
    const node_0_1_0 = createEntity()
    setComponent(node_0, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
    setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })
    // Run and Check the result
    const visited = [] as Entity[]
    const start1 = node_0
    traverseEntityNodeChildFirst(start1, (node) => visited.push(node))
    assert.equal(visited.length, 5)
    assert.equal(visited[0], node_0_0_0)
    assert.equal(visited[1], node_0_0)
    assert.equal(visited[2], node_0_1_0)
    assert.equal(visited[3], node_0_1)
    assert.equal(visited[visited.length - 1], start1)
    // Re-run and Check the new result
    const visitedAgain = [] as Entity[]
    const start2 = node_0_0
    traverseEntityNodeChildFirst(start2, (node) => visitedAgain.push(node))
    assert.equal(visitedAgain.length, 2)
    assert.equal(visitedAgain[0], node_0_0_0)
    assert.equal(visitedAgain[visitedAgain.length - 1], start2)
  })
}) //:: traverseEntityNodeChildFirst

describe('traverseEntityNodeParent', () => {
  let parentEntity: Entity

  beforeEach(() => {
    createEngine()

    parentEntity = createEntity()
    setComponent(parentEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(parentEntity, UUIDComponent, 'root' as EntityUUID)
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should traverse the parent nodes and run the callback function on them', () => {
    const once = false
    // Set the data as expected
    const node_0 = createEntity()
    const node_0_0 = createEntity()
    const node_0_1 = createEntity()
    const node_0_0_0 = createEntity()
    const node_0_1_0 = createEntity()
    setComponent(node_0, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
    setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })
    // Run and Check the result
    const visited = [] as Entity[]
    const start1 = node_0_0_0
    traverseEntityNodeParent(start1, (node) => {
      visited.push(node)
      if (once) return true
    })
    assert.equal(visited.length, 3)
    assert.equal(visited[0], node_0_0)
    assert.equal(visited[1], node_0)
    assert.equal(visited[2], parentEntity)
    // Re-run and Check the new result
    const visitedAgain = [] as Entity[]
    const start2 = node_0_0
    traverseEntityNodeParent(start2, (node) => {
      visitedAgain.push(node)
      if (once) return true
    })
    assert.equal(visitedAgain.length, 2)
    assert.equal(visitedAgain[0], node_0)
    assert.equal(visitedAgain[1], parentEntity)
  })

  it('should early return when the `@param cb` returns true', () => {
    const once = true
    // Set the data as expected
    const node_0 = createEntity()
    const node_0_0 = createEntity()
    const node_0_1 = createEntity()
    const node_0_0_0 = createEntity()
    const node_0_1_0 = createEntity()
    setComponent(node_0, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
    setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })
    // Run and Check the result
    const visited = [] as Entity[]
    const start1 = node_0_0_0
    traverseEntityNodeParent(start1, (node) => {
      visited.push(node)
      if (once) return true
    })
    assert.equal(visited.length, 1)
    assert.equal(visited[0], node_0_0)
    // Re-run and Check the new result
    const visitedAgain = [] as Entity[]
    const start2 = node_0_0
    traverseEntityNodeParent(start2, (node) => {
      visitedAgain.push(node)
      if (once) return true
    })
    assert.equal(visitedAgain.length, 1)
    assert.equal(visitedAgain[0], node_0)
  })

  it('should traverse the parent nodes and run the callback function on all of them', () => {
    // Set the data as expected
    const nodes = [] as Entity[]
    const entityCount = 4
    for (let id = 0; id < entityCount; ++id) {
      nodes[id] = createEntity()
      setComponent(nodes[id], EntityTreeComponent, { parentEntity: id === 0 ? parentEntity : nodes[id - 1] })
    }
    // Run and Check the result
    const visited = [] as Entity[]
    traverseEntityNodeParent(nodes[nodes.length - 1], (parent) => (visited.push(parent), undefined))
    assert.equal(visited.length, 4)
    assert.equal(visited[0], nodes[2])
    assert.equal(visited[1], nodes[1])
    assert.equal(visited[2], nodes[0])
    assert.equal(visited[3], parentEntity)
  })

  it('should not throw an error if the parent node does not exist', () => {
    /* @note Condition no longer triggerable. Kept for completion. */
    assert.doesNotThrow(() => {
      traverseEntityNodeParent(parentEntity, () => {})
    })
  })
}) //:: traverseEntityNodeParent

describe('getAncestorWithComponents', () => {
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('shoult return the closest ancestor entity that has all the requested components', async () => {
    // Initialize with dummy data for the test
    let rootEntity = createEntity()
    let child_1 = createEntity()
    let child_2 = createEntity()
    let result = UndefinedEntity
    const component1 = HighlightComponent
    const component2 = VisibleComponent
    const components = [component1, component2]

    /** @case 1:  rootEntity (with) -> child_1 (with) -> child_2 (empty) - get closest */
    // Case 1: Initialize
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    for (const component of components) setComponent(rootEntity, component)

    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')
    for (const component of components) setComponent(child_1, component)

    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')

    // Case1: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(hasComponents(child_1, components), true)
    assert.equal(hasComponents(rootEntity, components), true)
    // Case1: Check
    result = getAncestorWithComponents(child_2, components, true)
    assertEntityHierarchy('Case1: result', result, rootEntity)
    assert.equal(child_1, result, `Case1: Did not return the correct entity. result = ${result}`)
    // Case1: Terminate
    removeEntityNodeRecursively(rootEntity)

    /** @case 2:  rootEntity (with) -> child_1 (with) -> child_2 (empty) - get farthest */
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    result = UndefinedEntity

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    for (const component of components) setComponent(rootEntity, component)

    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')
    for (const component of components) setComponent(child_1, component)

    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')

    // Case2: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(hasComponents(child_1, components), true)
    assert.equal(hasComponents(rootEntity, components), true)
    // Case2: Check
    result = getAncestorWithComponents(child_2, components, false)
    assertEntityHierarchy('Case2: result', result)
    assert.equal(rootEntity, result, `Case2: Did not return the correct entity. result = ${result}`)

    // Case3: Check getAncestorWithComponents w/ closest = false where the entity is the only one with the components
    for (const component of components) setComponent(child_2, component)
    for (const component of components) removeComponent(child_1, component)
    for (const component of components) removeComponent(rootEntity, component)
    result = getAncestorWithComponents(child_2, components, false)
    assert.equal(child_2, result, `Case3: Did not return the correct entity. result = ${result}`)

    removeEntityNodeRecursively(rootEntity)
  })

  it('should only return the entity when includeSelf is set to true', async () => {
    const entity1 = createEntity()
    const entity2 = createEntity()

    setComponent(entity1, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(entity2, EntityTreeComponent, { parentEntity: entity1 })

    setComponent(entity1, NameComponent, '1')
    setComponent(entity2, NameComponent, '2')

    assert.equal(getAncestorWithComponents(entity2, [NameComponent]), entity2)
    assert.equal(getAncestorWithComponents(entity2, [NameComponent], false, false), entity1)
    assert.equal(getAncestorWithComponents(entity2, [NameComponent], true, false), entity1)
  })
}) //:: getAncestorWithComponents

describe('getTreeFromChildToAncestor', () => {
  let rootEntity: Entity
  let level1Entity: Entity
  let level2Entity: Entity
  let level3Entity: Entity
  let level4Entity: Entity

  beforeEach(() => {
    createEngine()

    // Create a hierarchy of entities
    rootEntity = createEntity()
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })

    level1Entity = createEntity()
    setComponent(level1Entity, EntityTreeComponent, { parentEntity: rootEntity })

    level2Entity = createEntity()
    setComponent(level2Entity, EntityTreeComponent, { parentEntity: level1Entity })

    level3Entity = createEntity()
    setComponent(level3Entity, EntityTreeComponent, { parentEntity: level2Entity })

    level4Entity = createEntity()
    setComponent(level4Entity, EntityTreeComponent, { parentEntity: level3Entity })
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should return an array containing all entities from level 4 to root when no ancestor is provided', () => {
    const outEntities: Entity[] = []
    const result = getTreeFromChildToAncestor(level4Entity, outEntities)

    assert.deepEqual(outEntities, [level4Entity, level3Entity, level2Entity, level1Entity, rootEntity])
    assert.equal(result, false)
  })

  it('should return an array containing entities from level 4 to level 2 when level 2 is specified as ancestor', () => {
    const outEntities: Entity[] = []
    const result = getTreeFromChildToAncestor(level4Entity, outEntities, level2Entity)

    assert.deepEqual(outEntities, [level4Entity, level3Entity, level2Entity])
    assert.equal(result, true)
  })

  it('should return false and an array containing all entities from level 4 to root when an invalid ancestor is provided', () => {
    const outEntities: Entity[] = []
    const invalidAncestor = createEntity() // Nonexistent ancestor in the hierarchy
    const result = getTreeFromChildToAncestor(level4Entity, outEntities, invalidAncestor)

    assert.deepEqual(outEntities, [level4Entity, level3Entity, level2Entity, level1Entity, rootEntity])
    assert.equal(result, false)
  })

  it('should return an array containing only the child when childEntity does not have EntityTreeComponent', () => {
    const orphan = createEntity()
    const outEntities: Entity[] = []
    const result = getTreeFromChildToAncestor(orphan, outEntities)

    assert.deepEqual(outEntities, [orphan])
    assert.equal(result, false)
  })

  it('should return true when the child is the ancestor itself', () => {
    const outEntities: Entity[] = []
    const result = getTreeFromChildToAncestor(level2Entity, outEntities, level2Entity)

    assert.deepEqual(outEntities, [level2Entity])
    assert.equal(result, true)
  })
}) //:: getTreeFromChildToAncestor

describe('findIndexOfEntityNode', () => {
  let parentEntity: Entity

  beforeEach(() => {
    createEngine()

    parentEntity = createEntity()
    setComponent(parentEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(parentEntity, UUIDComponent, 'root' as EntityUUID)
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should return the index of the passed entity node', () => {
    const testNode = createEntity()
    setComponent(createEntity(), EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(createEntity(), EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(testNode, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(createEntity(), EntityTreeComponent, { parentEntity: parentEntity })

    assert.equal(findIndexOfEntityNode(getComponent(parentEntity, EntityTreeComponent).children, testNode), 2)
  })

  it('should return -1 if it can not find the index of the passed node', () => {
    const testNode = createEntity()
    setComponent(createEntity(), EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(createEntity(), EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(createEntity(), EntityTreeComponent, { parentEntity: parentEntity })

    assert.equal(findIndexOfEntityNode(getComponent(parentEntity, EntityTreeComponent).children, testNode), -1)
  })
}) //:: findIndexOfEntityNode

describe('isDeepChildOf', () => {
  let parentEntity: Entity

  beforeEach(() => {
    createEngine()

    parentEntity = createEntity()
    setComponent(parentEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should return false when `@param child` does not have an EntityTreeComponent', () => {
    const Expected = false
    // Set the data as expected
    const child = createEntity()
    // Sanity check before running
    assert.equal(hasComponent(child, EntityTreeComponent), false)
    // Run and Check the result
    const result1 = isDeepChildOf(child, parentEntity)
    assert.equal(result1, Expected)
    const result2 = isDeepChildOf(child, UndefinedEntity)
    assert.equal(result2, Expected)
  })

  it('should return true when `@param parent` is the same entity as its EntityTreeComponent.parentEntity', () => {
    const Expected = true
    // Set the data as expected
    const child = createEntity()
    setComponent(child, EntityTreeComponent, { parentEntity: parentEntity })
    // Sanity check before running
    assert.equal(hasComponent(child, EntityTreeComponent), true)
    assert.equal(getComponent(child, EntityTreeComponent).parentEntity, parentEntity)
    // Run and Check the result
    const result = isDeepChildOf(child, parentEntity)
    assert.equal(result, Expected)
  })

  it('should recurse when `@param parent` is not the same entity as its EntityTreeComponent.parentEntity', () => {
    const Expected = true
    // Set the data as expected
    const other1 = createEntity()
    const other2 = createEntity()
    const other3 = createEntity()
    const child = createEntity()
    setComponent(other1, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(other2, EntityTreeComponent, { parentEntity: other1 })
    setComponent(other3, EntityTreeComponent, { parentEntity: other2 })
    setComponent(child, EntityTreeComponent, { parentEntity: other3 })
    // Sanity check before running
    assert.equal(hasComponent(child, EntityTreeComponent), true)
    assert.notEqual(getComponent(child, EntityTreeComponent).parentEntity, parentEntity)
    // Run and Check the result
    const result = isDeepChildOf(child, parentEntity)
    assert.equal(result, Expected)
  })
}) //:: isDeepChildOf

describe('useAncestorWithComponents', () => {
  // Run before every test case
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('should return the closest ancestor of `@param entity` that has all of the requested `@param components`', async () => {
    // Initialize with dummy data for the test
    let rootEntity = createEntity()
    let parent_1 = createEntity()
    let parent_2 = createEntity()
    let result = UndefinedEntity
    const component1 = HighlightComponent
    const component2 = VisibleComponent
    const components = [component1, component2]

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const entity = useAncestorWithComponents(rootEntity, components)
      useEffect(() => {
        result = entity
      }, [entity])
      return null
    }
    const tag = <Reactor />

    /** @case 1:  parent_1 (with component) -> rootEntity */
    // Case 1: Initialize
    setComponent(parent_1, EntityTreeComponent)
    setComponent(parent_1, NameComponent, 'parent_1')
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    for (const component of components) setComponent(parent_1, component)
    // Case1: Validate
    assertEntityHierarchy('parent_1', parent_1)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    assert.equal(hasComponents(parent_1, components), true)
    // Case1: Check
    const R1 = render(tag)
    assertEntityHierarchy('Case1: result', result)
    assert.equal(parent_1, result, `Case1: Did not return the correct entity. result = ${result}`)
    // Case1: Terminate
    removeEntityNodeRecursively(parent_1)
    R1.unmount()

    /** @case 2:  parent_2 (with component) -> parent_1 -> rootEntity */
    // Case 2: Initialize
    rootEntity = createEntity()
    parent_1 = createEntity()
    parent_2 = createEntity()
    setComponent(parent_2, NameComponent, 'parent_2')
    for (const component of components) setComponent(parent_2, component)
    setComponent(parent_2, EntityTreeComponent)
    setComponent(parent_1, EntityTreeComponent, { parentEntity: parent_2 })
    setComponent(parent_1, NameComponent, 'parent_1')
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    // Case2: Validate
    assertEntityHierarchy('parent_2', parent_2)
    assertEntityHierarchy('parent_1', parent_1, parent_2)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    assert.equal(hasComponents(parent_2, components), true)
    // Case2: Check
    const R2 = render(tag)
    assertEntityHierarchy('Case2: result', result)
    assert.equal(parent_2, result, `Case2: Did not return the correct entity. result = ${result}`)
    // Case2: Terminate
    removeEntityNodeRecursively(rootEntity)
    R2.unmount()

    /** @case 3:  parent_2 -> parent_1 -> rootEntity    (none have the component) */
    // Case 3: Initialize
    rootEntity = createEntity()
    parent_1 = createEntity()
    parent_2 = createEntity()
    setComponent(parent_1, NameComponent, 'parent_1')
    setComponent(parent_2, NameComponent, 'parent_2')
    setComponent(parent_2, EntityTreeComponent)
    setComponent(parent_1, EntityTreeComponent, { parentEntity: parent_2 })
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    //setComponent(parent_2, component)  // The Component for the third case is not set at all
    // Case3: Validate
    assertEntityHierarchy('parent_2', parent_2)
    assertEntityHierarchy('parent_1', parent_1, parent_2)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    // Case3: Check
    const R3 = render(tag)
    assert.equal(result, UndefinedEntity)
    // Case3: Terminate
    removeEntityNodeRecursively(rootEntity)
    R3.unmount()

    /** @case 4:  parent_2 -> parent_1 (with component) -> rootEntity */
    // Case 4: Initialize
    rootEntity = createEntity()
    parent_1 = createEntity()
    parent_2 = createEntity()
    setComponent(parent_1, NameComponent, 'parent_1')
    setComponent(parent_2, NameComponent, 'parent_2')
    setComponent(parent_2, EntityTreeComponent)
    setComponent(parent_1, EntityTreeComponent, { parentEntity: parent_2 })
    for (const component of components) setComponent(parent_1, component)
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    // Case4: Validate
    assertEntityHierarchy('parent_2', parent_2)
    assertEntityHierarchy('parent_1', parent_1, parent_2)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    // Case4: Check
    const R4 = render(tag)
    assert.equal(parent_1, result, `Case4: Did not return the correct entity. result = ${result}`)
    assert.notEqual(parent_2, result, `Case4: Did not return the correct entity. result = ${result}`)
    // Case4: Terminate
    removeEntityNodeRecursively(rootEntity)
    R4.unmount()

    /** @case 5:  parent_1 (with component) -> rootEntity */
    // Case 5: Initialize
    rootEntity = createEntity()
    parent_1 = createEntity()
    setComponent(parent_1, NameComponent, 'parent_1')
    setComponent(parent_1, EntityTreeComponent)
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    setComponent(parent_1, component1)
    // Case5: Validate
    assertEntityHierarchy('parent_1', parent_1)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    assert.equal(hasComponents(parent_1, components), false)
    // Case5: Further initialization
    setComponent(parent_1, component2)
    assert.equal(hasComponents(parent_1, components), true)
    // Case5: Check
    const R5 = render(tag)
    assertEntityHierarchy('Case5: result', result)
    assert.equal(parent_1, result, `Case5: Did not return the correct entity. result = ${result}`)
    // Case5: Terminate
    removeEntityNodeRecursively(parent_1)
    R5.unmount()
  })

  // test for closest = false (furthest)
  it('should return the furthest ancestor of `@param entity` that has all of the requested `@param components`', async () => {
    // Initialize with dummy data for the test
    let result = UndefinedEntity

    const rootEntity = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')

    const child_1 = createEntity()
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')

    const child_2 = createEntity()
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')

    const Reactor = () => {
      const entity = useAncestorWithComponents(child_2, [NameComponent], false)
      result = entity
      return null
    }
    const tag = <Reactor />

    assert.equal(UndefinedEntity, result)

    const R1 = render(tag)
    assert.equal(rootEntity, result, `Case1: Did not return the correct entity. result = ${result}`)
    R1.unmount()

    removeComponent(rootEntity, NameComponent)
    const R2 = render(tag)
    assert.equal(child_1, result, `Case2: Did not return the correct entity. result = ${result}`)
    R2.unmount()

    removeEntityNodeRecursively(rootEntity)
  })

  // test for includeSelf = false
  it('should return the closest ancestor of `@param entity`, excluding self, when `@param includeSelf` is set to false', async () => {
    let result = UndefinedEntity

    const rootEntity = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')

    const child_1 = createEntity()
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')

    const child_2 = createEntity()
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')

    const Reactor = () => {
      const entity = useAncestorWithComponents(child_2, [NameComponent], true, false)
      useEffect(() => {
        result = entity
      }, [entity])
      return null
    }
    const tag = <Reactor />

    assert.equal(UndefinedEntity, result)

    const R1 = render(tag)
    assert.equal(child_1, result, `Case1: Did not return the correct entity. result = ${result}`)
    R1.unmount()

    removeComponent(child_2, NameComponent)
    const R2 = render(tag)
    assert.equal(child_1, result, `Case2: Did not return the correct entity. result = ${result}`)
    R2.unmount()

    removeComponent(child_1, NameComponent)
    const R3 = render(tag)
    assert.equal(rootEntity, result, `Case3: Did not return the correct entity. result = ${result}`)
    R3.unmount()

    removeEntityNodeRecursively(rootEntity)
  })
}) //:: useAncestorWithComponents

describe('useChildWithComponents', () => {
  // Run before every test case
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('should return the closest child of `@param entity` that has all of the requested `@param component`', async () => {
    // Initialize with dummy data for the test
    let result = UndefinedEntity
    let rootEntity = createEntity()
    let child_1 = createEntity()
    let child_2 = createEntity()
    const component1 = HighlightComponent
    const component2 = VisibleComponent
    const components = [component1, component2]

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const entity = useChildWithComponents(rootEntity, components)
      useEffect(() => {
        result = entity
      }, [entity])
      return null
    }
    const tag = <Reactor />

    /** @case 1:  rootEntity -> child_1 (with component) */
    // Case 1: Initialize
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    for (const component of components) setComponent(child_1, component)
    // Case1: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assert.equal(hasComponents(child_1, components), true)
    // Case1: Check
    const R1 = render(tag)
    assertEntityHierarchy('Case1: result', result, rootEntity)
    assert.equal(child_1, result, `Case1: Did not return the correct entity. result = ${result}`)
    // Case1: Terminate
    removeEntityNodeRecursively(rootEntity)
    R1.unmount()

    /** @case 2:  rootEntity -> child_1 -> child_2 (with component) */
    // Case 2: Initialize
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    for (const component of components) setComponent(child_2, component)
    // Case2: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(hasComponents(child_2, components), true)
    // Case2: Check
    const R2 = render(tag)
    assertEntityHierarchy('Case2: result', result, child_1)
    assert.equal(child_2, result, `Case2: Did not return the correct entity. result = ${result}`)
    // Case2: Terminate
    removeEntityNodeRecursively(rootEntity)
    R2.unmount()

    /** @case 3:  rootEntity -> child_1 -> child_2    (none have the component) */
    // Case 3: Initialize
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    //setComponent(child_2, component)  // The Component for the third case is not set at all
    // Case3: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    // Case3: Check
    const R3 = render(tag)
    assert.equal(result, UndefinedEntity, `Case3: Resulting entity is not UndefinedEntity. result = ${result}`)
    // Case3: Terminate
    removeEntityNodeRecursively(rootEntity)
    R3.unmount()

    /** @case 4:  rootEntity -> child_1 (with component) -> child_2 */
    // Case 4: Initialize
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    for (const component of components) setComponent(child_1, component)
    // Case4: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    // Case4: Check
    const R4 = render(tag)
    assert.equal(child_1, result, `Case4: Did not return the correct entity. result = ${result}`)
    assert.notEqual(child_2, result, `Case4: Did not return the correct entity. result = ${result}`)
    // Case4: Terminate
    removeEntityNodeRecursively(rootEntity)
    R4.unmount()
  })
}) //:: useChildWithComponents

describe('useChildrenWithComponents', () => {
  // Run before every test case
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('returns the closest children entities that has the requested components', async () => {
    // Initialize with dummy data for the test
    let rootEntity = createEntity()
    let child_1 = createEntity()
    let child_2 = createEntity()
    let results = [UndefinedEntity]
    const component1 = HighlightComponent
    const component2 = VisibleComponent
    const components = [component1, component2]

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const entities = useChildrenWithComponents(rootEntity, components)
      useEffect(() => {
        results = entities
      }, [entities])
      return null
    }
    const tag = <Reactor />

    /** @case 1:  rootEntity -> child_1 + child_2(with component) */
    // Case 1: Initialize
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_2, NameComponent, 'child_2')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: rootEntity })
    for (const component of components) setComponent(child_1, component)
    for (const component of components) setComponent(child_2, component)
    // Case1: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assert.equal(hasComponents(child_1, components), true)
    assertEntityHierarchy('child_2', child_2, rootEntity)
    assert.equal(hasComponents(child_2, components), true)
    // Case1: Check
    const R1 = render(tag)
    for (const rslt of results) {
      assertEntityHierarchy('Case1: result', rslt, rootEntity)
    }
    assert.ok(results.indexOf(child_1) !== -1, `Case1: Results did not contain correct entity. results = ${results}`)
    assert.ok(results.indexOf(child_2) !== -1, `Case1: Results did not contain correct entity. results = ${results}`)
    // Case1: Terminate
    removeEntityNodeRecursively(rootEntity)
    R1.unmount()

    /** @case 2:  rootEntity -> child_1 -> child_2 (with component) */
    // Case 2: Initialize
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    for (const component of components) setComponent(child_2, component)
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_2, NameComponent, 'child_2')
    // Case2: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(hasComponents(child_2, components), true)
    // Case2: Check
    const R2 = render(tag)
    const c1Index = results.indexOf(child_1)
    const c2Index = results.indexOf(child_2)
    assert.equal(c1Index, -1, `Case2: Results did not contain correct entity. results = ${results}`)
    assert.notEqual(c2Index, -1, `Case2: Results did not contain correct entity. results = ${results}`)
    assertEntityHierarchy('Case2: result', results[c2Index], child_1)
    // Case2: Terminate
    removeEntityNodeRecursively(rootEntity)
    R2.unmount()

    /** @case 3:  rootEntity -> child_1 -> child_2    (none have the component) */
    // Case 3: Initialize
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_2, NameComponent, 'child_2')
    //setComponent(child_2, component)  // The Component for the third case is not set at all
    // Case3: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    // Case3: Check
    const R3 = render(tag)
    assert.ok(
      results.indexOf(child_1) === -1,
      `Case3: Results contained an entity when there should be no valid results ([UndefinedEntity]) = ${results}`
    )
    assert.ok(
      results.indexOf(child_2) === -1,
      `Case3: Results contained an entity when there should be no valid results ([UndefinedEntity]) = ${results}`
    )
    assert.equal(
      results.length,
      0,
      `Case3: Returned a valid results content when it should return an empty array. result = ${results}`
    )
    // Case3: Terminate
    removeEntityNodeRecursively(rootEntity)
    R3.unmount()

    /** @case 4:  rootEntity -> child_1 (with component) -> child_2 */
    // Case 4: Initialize
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_2, NameComponent, 'child_2')
    setComponent(child_1, component1)
    setComponent(child_1, component2)
    // Case4: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    // Case4: Check
    const R4 = render(tag)
    assert.ok(results.indexOf(child_1) !== -1, `Case4: Results did not contain correct entity. results = ${results}`)
    assert.ok(results.indexOf(child_2) === -1, `Case4: Results did not contain correct entity. results = ${results}`)
    // Case4: Terminate
    removeEntityNodeRecursively(rootEntity)
    R4.unmount()
  })

  it('excludes entities that have components in the exclude array', async () => {
    const rootEntity = createEntity()
    const child_1 = createEntity()
    const child_2 = createEntity()
    let results = [UndefinedEntity]
    const components = [HighlightComponent, VisibleComponent]
    const exclude = [SceneComponent]

    const Reactor = () => {
      const entities = useChildrenWithComponents(rootEntity, components, exclude)
      useEffect(() => {
        results = entities
      }, [entities])
      return null
    }
    const tag = <Reactor />

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: rootEntity })

    for (const component of components) {
      setComponent(child_1, component)
      setComponent(child_2, component)
    }

    for (const component of exclude) {
      setComponent(child_2, component)
    }

    const { rerender, unmount } = render(tag)

    assert(results.includes(child_1))
    assert(!results.includes(child_2))
    unmount
  })

  it('excludes entities that has some components in the exclude array', async () => {
    const rootEntity = createEntity()
    const child_1 = createEntity()
    const child_2 = createEntity()
    let results = [UndefinedEntity]
    const components = [HighlightComponent, VisibleComponent]
    const exclude = [SceneComponent, BackgroundComponent]

    const Reactor = () => {
      const entities = useChildrenWithComponents(rootEntity, components, exclude)
      useEffect(() => {
        results = entities
      }, [entities])
      return null
    }
    const tag = <Reactor />

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: rootEntity })

    for (const component of components) {
      setComponent(child_1, component)
      setComponent(child_2, component)
    }

    setComponent(child_2, exclude[0])

    const { rerender, unmount } = render(tag)

    assert(results.includes(child_1))
    assert(!results.includes(child_2))
    unmount
  })

  it('includes entities that have no components in the exclude array', async () => {
    const rootEntity = createEntity()
    const child_1 = createEntity()
    const child_2 = createEntity()
    let results = [UndefinedEntity]
    const components = [HighlightComponent, VisibleComponent]
    const exclude = [SceneComponent]

    const Reactor = () => {
      const entities = useChildrenWithComponents(rootEntity, components, exclude)
      useEffect(() => {
        results = entities
      }, [entities])
      return null
    }
    const tag = <Reactor />

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: rootEntity })

    for (const component of components) {
      setComponent(child_1, component)
      setComponent(child_2, component)
    }

    const { rerender, unmount } = render(tag)

    assert(results.includes(child_1))
    assert(results.includes(child_2))
    unmount
  })
})

describe('useAncestorWithComponents', () => {
  // Run before every test case
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('returns the closest ancestor entity that has the requested component', async () => {
    // Initialize with dummy data for the test
    let rootEntity = createEntity()
    let parent_1 = createEntity()
    let parent_2 = createEntity()
    let result = UndefinedEntity
    const component = HighlightComponent
    const component2 = VisibleComponent

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const entity = useAncestorWithComponents(rootEntity, [component, component2])
      useEffect(() => {
        result = entity
      }, [entity])
      return null
    }
    const tag = <Reactor />

    /**
     * @description Case 1:  parent_1 (with component) -> rootEntity
     */
    // Case 1: Initialize
    setComponent(parent_1, EntityTreeComponent)
    setComponent(parent_1, NameComponent, 'parent_1')
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    setComponent(parent_1, component)
    setComponent(parent_1, component2)
    // Case1: Validate
    assertEntityHierarchy('parent_1', parent_1)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    assert.equal(
      true,
      hasComponents(parent_1, [component, component2]),
      'Case1: The parent entity did not get its test component set correctly'
    )
    // Case1: Check
    const R1 = render(tag)
    assertEntityHierarchy('Case1: result', result)
    assert.equal(parent_1, result, `Case1: Did not return the correct entity. result = ${result}`)
    // Case1: Terminate
    removeEntityNodeRecursively(parent_1)
    R1.unmount()

    /**
     * @description Case 2:  parent_2 (with component) -> parent_1 -> rootEntity
     */
    // Case 2: Initialize
    rootEntity = createEntity()
    parent_1 = createEntity()
    parent_2 = createEntity()
    setComponent(parent_2, NameComponent, 'parent_2')
    setComponent(parent_2, component)
    setComponent(parent_2, component2)
    setComponent(parent_2, EntityTreeComponent)
    setComponent(parent_1, EntityTreeComponent, { parentEntity: parent_2 })
    setComponent(parent_1, NameComponent, 'parent_1')
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    // Case2: Validate
    assertEntityHierarchy('parent_2', parent_2)
    assertEntityHierarchy('parent_1', parent_1, parent_2)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    assert.equal(
      true,
      hasComponents(parent_2, [component, component2]),
      'Case2: The parent entity did not get its test component set correctly'
    )
    // Case2: Check
    const R2 = render(tag)
    assertEntityHierarchy('Case2: result', result)
    assert.equal(parent_2, result, `Case2: Did not return the correct entity. result = ${result}`)
    // Case2: Terminate
    removeEntityNodeRecursively(rootEntity)
    R2.unmount()

    /**
     * @description Case 3:  parent_2 -> parent_1 -> rootEntity    (none have the component)
     */
    // Case 3: Initialize
    rootEntity = createEntity()
    parent_1 = createEntity()
    parent_2 = createEntity()
    setComponent(parent_1, NameComponent, 'parent_1')
    setComponent(parent_2, NameComponent, 'parent_2')
    setComponent(parent_2, EntityTreeComponent)
    setComponent(parent_1, EntityTreeComponent, { parentEntity: parent_2 })
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    //setComponent(parent_2, component)  // The Component for the third case is not set at all
    // Case3: Validate
    assertEntityHierarchy('parent_2', parent_2)
    assertEntityHierarchy('parent_1', parent_1, parent_2)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    // Case3: Check
    const R3 = render(tag)
    assert.equal(
      result,
      UndefinedEntity,
      `Case3: Returned a valid entity, but should return UndefinedEntity. result = ${result}`
    )
    // Case3: Terminate
    removeEntityNodeRecursively(rootEntity)
    R3.unmount()

    /**
     * @description Case 4:  parent_2 -> parent_1 (with component) -> rootEntity
     */
    // Case 4: Initialize
    rootEntity = createEntity()
    parent_1 = createEntity()
    parent_2 = createEntity()
    setComponent(parent_1, NameComponent, 'parent_1')
    setComponent(parent_2, NameComponent, 'parent_2')
    setComponent(parent_2, EntityTreeComponent)
    setComponent(parent_1, EntityTreeComponent, { parentEntity: parent_2 })
    setComponent(parent_1, component)
    setComponent(parent_1, component2)
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    // Case4: Validate
    assertEntityHierarchy('parent_2', parent_2)
    assertEntityHierarchy('parent_1', parent_1, parent_2)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    // Case4: Check
    const R4 = render(tag)
    assert.equal(parent_1, result, `Case4: Did not return the correct entity. result = ${result}`)
    assert.notEqual(parent_2, result, `Case4: Did not return the correct entity. result = ${result}`)
    // Case4: Terminate
    removeEntityNodeRecursively(rootEntity)
    R4.unmount()

    /**
     * @description Case 5:  parent_1 (with component) -> rootEntity
     */
    // Case 5: Initialize
    rootEntity = createEntity()
    parent_1 = createEntity()
    setComponent(parent_1, NameComponent, 'parent_1')
    setComponent(parent_1, EntityTreeComponent)
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    setComponent(parent_1, component)
    // Case5: Validate
    assertEntityHierarchy('parent_1', parent_1)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    assert.equal(
      false,
      hasComponents(parent_1, [component, component2]),
      'Case1: The parent entity did not get its test component set correctly'
    )
    // Case5 further initialization

    setComponent(parent_1, component2)
    assert.equal(
      true,
      hasComponents(parent_1, [component, component2]),
      'Case1: The parent entity did not get its test component set correctly'
    )
    // Case1: Check
    const R5 = render(tag)
    assertEntityHierarchy('Case5: result', result)
    assert.equal(parent_1, result, `Case5: Did not return the correct entity. result = ${result}`)
    // Case1: Terminate
    removeEntityNodeRecursively(parent_1)
    R5.unmount()
  })

  // test for closest = false (furthst)
  it('returns the further ancestor entity', async () => {
    // Initialize with dummy data for the test
    const rootEntity = createEntity()
    const child_1 = createEntity()
    const child_2 = createEntity()
    let result = UndefinedEntity

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')

    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')

    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')

    const Reactor = () => {
      const entity = useAncestorWithComponents(child_2, [NameComponent], false)
      result = entity
      return null
    }

    const tag = <Reactor />

    assert.equal(UndefinedEntity, result)

    const R1 = render(tag)
    assert.equal(rootEntity, result, `Case1: Did not return the correct entity. result = ${result}`)
    R1.unmount()

    removeComponent(rootEntity, NameComponent)
    const R2 = render(tag)
    assert.equal(child_1, result, `Case2: Did not return the correct entity. result = ${result}`)
    R2.unmount()

    removeEntityNodeRecursively(rootEntity)
  })

  // test for includeSelf = false
  it('returns the closest ancestor entity excluding self', async () => {
    const rootEntity = createEntity()
    const child_1 = createEntity()
    const child_2 = createEntity()
    let result = UndefinedEntity

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')

    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')

    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')

    const Reactor = () => {
      const entity = useAncestorWithComponents(child_2, [NameComponent], true, false)
      useEffect(() => {}, [entity])
      result = entity
      return null
    }

    const tag = <Reactor />

    assert.equal(UndefinedEntity, result)

    const R1 = render(tag)
    assert.equal(child_1, result, `Case1: Did not return the correct entity. result = ${result}`)
    R1.unmount()

    removeComponent(child_2, NameComponent)
    const R2 = render(tag)
    assert.equal(child_1, result, `Case2: Did not return the correct entity. result = ${result}`)
    R2.unmount()

    removeComponent(child_1, NameComponent)
    const R3 = render(tag)
    assert.equal(rootEntity, result, `Case3: Did not return the correct entity. result = ${result}`)
    R3.unmount()

    removeEntityNodeRecursively(rootEntity)
  })
}) //:: useChildrenWithComponents

describe('getChildrenWithComponents', () => {
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('should return the expected children entities only when they have the requested `@param components`', async () => {
    // Initialize with dummy data for the test
    let rootEntity = createEntity()
    let child_1 = createEntity()
    let child_2 = createEntity()
    let results = [] as Entity[]
    const component1 = HighlightComponent
    const component2 = VisibleComponent
    const components = [component1, component2]

    /** @case 1:  rootEntity (empty) -> child_1 (with) -> child_2 (with) */
    // Case 1: Initialize
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_2, NameComponent, 'child_2')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    for (const component of components) setComponent(child_1, component)
    for (const component of components) setComponent(child_2, component)
    // Case1: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(hasComponents(child_1, components), true)
    assert.equal(hasComponents(child_2, components), true)
    // Case1: Check
    results = getChildrenWithComponents(rootEntity, components)
    assert.equal(true, results.includes(child_1), 'Case1: The child1 entity was not found correctly')
    assert.equal(true, results.includes(child_2), 'Case1: The child2 entity was not found correctly')
    // Case1: Terminate
    removeEntityNodeRecursively(rootEntity)

    /** @case 2:  rootEntity (with) -> child_1 (with) -> child_2 (empty) */
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    results = [] as Entity[]

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_2, NameComponent, 'child_2')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    for (const component of components) setComponent(child_1, component)

    // Case2: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(hasComponents(child_1, components), true)
    assert.equal(hasComponents(child_2, components), false)
    // Case2: Check
    results = getChildrenWithComponents(rootEntity, components)
    assert.equal(results.includes(child_1), true, 'Case2: The child1 entity was not found')
    assert.equal(results.includes(child_2), false, "Case2: The child2 entity was returned, but shouldn't have")
    // Case2: Terminate
    removeEntityNodeRecursively(rootEntity)
  })
}) //:: getChildrenWithComponents

describe('haveCommonAncestor', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it("should return false if none of the entities of `@param entity1`'s EntityTree is also part of `@param entity2`'s EntityTree", () => {
    const Expected = false
    // Set the data as expected
    const entity1 = createEntity()
    const entity11 = createEntity()
    const entity12 = createEntity()
    const entity13 = createEntity()
    const entity2 = createEntity()
    const entity21 = createEntity()
    const entity22 = createEntity()
    const entity23 = createEntity()
    setComponent(entity1, EntityTreeComponent)
    setComponent(entity11, EntityTreeComponent, { parentEntity: entity1 })
    setComponent(entity12, EntityTreeComponent, { parentEntity: entity11 })
    setComponent(entity13, EntityTreeComponent, { parentEntity: entity12 })
    setComponent(entity2, EntityTreeComponent)
    setComponent(entity21, EntityTreeComponent, { parentEntity: entity2 })
    setComponent(entity22, EntityTreeComponent, { parentEntity: entity21 })
    setComponent(entity23, EntityTreeComponent, { parentEntity: entity22 })
    // Sanity check before running
    assert.equal(hasComponent(entity1, EntityTreeComponent), true)
    assert.equal(hasComponent(entity2, EntityTreeComponent), true)
    // Run and Check the result
    const result = haveCommonAncestor(entity13, entity23)
    assert.equal(result, Expected)
  })

  it("should return true if one of the entities of `@param entity1`'s EntityTree is also part of `@param entity2`'s EntityTree", () => {
    const Expected = true
    // Set the data as expected
    const entity1 = createEntity()
    const entity11 = createEntity()
    const entity2 = createEntity()
    const entity21 = createEntity()
    const common = createEntity()
    setComponent(entity1, EntityTreeComponent, { parentEntity: common })
    setComponent(entity11, EntityTreeComponent, { parentEntity: entity1 })
    setComponent(entity2, EntityTreeComponent, { parentEntity: common })
    setComponent(entity21, EntityTreeComponent, { parentEntity: entity2 })
    // Sanity check before running
    assert.equal(hasComponent(entity1, EntityTreeComponent), true)
    assert.equal(hasComponent(entity2, EntityTreeComponent), true)
    // Run and Check the result
    const result = haveCommonAncestor(entity11, entity21)
    assert.equal(result, Expected)
  })
}) //:: haveCommonAncestor

describe('isAncestor', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should return false when `@param potentialChild` is falsy', () => {
    const Expected = false
    // Set the data as expected
    const parent = createEntity()
    const child = UndefinedEntity
    setComponent(parent, EntityTreeComponent)
    // Sanity check before running
    assert.equal(Boolean(parent), true)
    assert.equal(Boolean(child), false)
    assert.equal(hasComponent(parent, EntityTreeComponent), true)
    assert.equal(hasComponent(child, EntityTreeComponent), false)
    // Run and Check the result
    const result = isAncestor(parent, child)
    assert.equal(result, Expected)
  })

  it('should return false when `@param parent` is falsy', () => {
    const Expected = false
    // Set the data as expected
    const parent = UndefinedEntity
    const child = createEntity()
    setComponent(child, EntityTreeComponent)
    // Sanity check before running
    assert.equal(Boolean(parent), false)
    assert.equal(Boolean(child), true)
    assert.equal(hasComponent(parent, EntityTreeComponent), false)
    assert.equal(hasComponent(child, EntityTreeComponent), true)
    // Run and Check the result
    const result = isAncestor(parent, child)
    assert.equal(result, Expected)
  })

  it('should return false when `@param includeSelf` is false and `@param parent` is the same entity as `@param potentialChild`', () => {
    const Expected = false
    // Set the data as expected
    const includeSelf = false
    const parent = createEntity()
    const child = parent
    setComponent(parent, EntityTreeComponent)
    // Sanity check before running
    assert.equal(Boolean(parent), true)
    assert.equal(Boolean(child), true)
    assert.equal(parent, child)
    assert.equal(hasComponent(parent, EntityTreeComponent), true)
    assert.equal(hasComponent(child, EntityTreeComponent), true)
    // Run and Check the result
    const result = isAncestor(parent, child, includeSelf)
    assert.equal(result, Expected)
  })

  it('should return true when `@param includeSelf` is true and `@param parent` is the same entity as `@param potentialChild`', () => {
    const Expected = true
    // Set the data as expected
    const includeSelf = true
    const parent = createEntity()
    const child = parent
    setComponent(parent, EntityTreeComponent)
    // Sanity check before running
    assert.equal(Boolean(parent), true)
    assert.equal(Boolean(child), true)
    assert.equal(parent, child)
    assert.equal(hasComponent(parent, EntityTreeComponent), true)
    assert.equal(hasComponent(child, EntityTreeComponent), true)
    // Run and Check the result
    const result = isAncestor(parent, child, includeSelf)
    assert.equal(result, Expected)
  })

  it("should traverse the `@param parent`'s EntityTree and return true if `@param potentialChild` is found during traversal", () => {
    const Expected = true
    // Set the data as expected
    const includeSelf = false
    const parent = createEntity()
    const child = createEntity()
    setComponent(parent, EntityTreeComponent)
    setComponent(child, EntityTreeComponent, { parentEntity: parent })
    // Sanity check before running
    assert.equal(Boolean(parent), true)
    assert.equal(Boolean(child), true)
    assert.notEqual(parent, child)
    assert.equal(hasComponent(parent, EntityTreeComponent), true)
    assert.equal(hasComponent(child, EntityTreeComponent), true)
    // Run and Check the result
    const result = isAncestor(parent, child, includeSelf)
    assert.equal(result, Expected)
  })

  it("should traverse the `@param parent`'s EntityTree and return false if `@param potentialChild` is not found during traversal", () => {
    const Expected = false
    // Set the data as expected
    const parent = createEntity()
    const child = createEntity()
    setComponent(parent, EntityTreeComponent)
    setComponent(child, EntityTreeComponent)
    // Sanity check before running
    assert.equal(Boolean(parent), true)
    assert.equal(Boolean(child), true)
    assert.notEqual(parent, child)
    assert.equal(hasComponent(parent, EntityTreeComponent), true)
    assert.equal(hasComponent(child, EntityTreeComponent), true)
    // Run and Check the result
    const result = isAncestor(parent, child)
    assert.equal(result, Expected)
  })
}) //:: isAncestor

describe('traverseEarlyOut', () => {
  let parentEntity: Entity

  beforeEach(() => {
    createEngine()
    parentEntity = createEntity()
    setComponent(parentEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('should recursively call `@param cb` function on `@param entity` and all its children', () => {
    const node_0 = createEntity()
    const node_0_0 = createEntity()
    const node_0_1 = createEntity()
    const node_0_0_0 = createEntity()
    const node_0_1_0 = createEntity()

    // Set the data as expected
    setComponent(node_0, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
    setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })

    // Run and Check the result
    const visited = [] as Entity[]
    traverseEarlyOut(node_0, (node) => {
      visited.push(node)
      return false
    })
    assert.equal(visited.length, 5)
    assert.equal(visited[0], node_0)
    assert.equal(visited[1], node_0_0)
    assert.equal(visited[2], node_0_0_0)
    assert.equal(visited[3], node_0_1)
    assert.equal(visited[4], node_0_1_0)

    // Re-run and Check the new result
    const visitedAgain = [] as Entity[]
    traverseEarlyOut(node_0_0, (node) => {
      visitedAgain.push(node)
      return false
    })
    assert.equal(visitedAgain.length, 2)
    assert.equal(visitedAgain[0], node_0_0)
    assert.equal(visitedAgain[1], node_0_0_0)
  })

  it('should stop traversal as soon as `@param cb` returns true for the first time', () => {
    const node_0 = createEntity()
    const node_0_0 = createEntity()
    const node_0_1 = createEntity()
    const node_0_0_0 = createEntity()
    const node_0_1_0 = createEntity()

    // Set the data as expected
    setComponent(node_0, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
    setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })

    // Run and Check the result
    const visited = [] as Entity[]
    traverseEarlyOut(node_0, (node) => {
      visited.push(node)
      return node === node_0_0
    })
    assert.equal(visited.length, 2)
    assert.equal(visited[0], node_0)
    assert.equal(visited[1], node_0_0)
  })
}) //:: traverseEarlyOut

describe('getNestedChildren', () => {
  let parentEntity: Entity

  beforeEach(() => {
    createEngine()
    parentEntity = createEntity()
    setComponent(parentEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should not process the children of an entity when `@param pred` returns false for that entity', () => {
    const Expected: Entity[] = []
    // Set the data as expected
    const entities: Entity[] = [createEntity(), createEntity(), createEntity(), createEntity()]
    const predicate = (entity: Entity) => {
      return entity !== parentEntity
    }
    // .. Set the children
    for (let id = 0; id < entities.length; ++id) {
      const entity = entities[id]
      setComponent(entity, EntityTreeComponent, { parentEntity: id === 0 ? parentEntity : entities[id - 1] })
    }
    // Sanity check before running
    for (const entity of entities) assert.equal(hasComponents(entity, [EntityTreeComponent]), true)
    assert.equal(Expected.includes(parentEntity), false)
    // Run and Check the result
    const result = getNestedChildren(parentEntity, predicate)
    assertArray.eq(result, Expected)
  })

  it('should return all children of an entity when `@param pred` never returns false for any entity', () => {
    const Expected: Entity[] = []
    // Set the data as expected
    const entities: Entity[] = [createEntity(), createEntity(), createEntity(), createEntity()]
    const predicate = (_entity: Entity) => true
    Expected.push(parentEntity)
    for (let id = 0; id < entities.length; ++id) {
      const entity = entities[id]
      setComponent(entity, EntityTreeComponent, { parentEntity: id === 0 ? parentEntity : entities[id - 1] })
      Expected.push(entity)
    }
    // Sanity check before running
    assert.equal(Expected.includes(parentEntity), true)
    for (const entity of entities) {
      assert.equal(hasComponents(entity, [EntityTreeComponent]), true)
      assert.equal(Expected.includes(entity), true)
    }
    // Run and Check the result
    const result = getNestedChildren(parentEntity, predicate)
    assertArray.eq(result, Expected)
  })
}) //:: getNestedChildren

/*
// @todo Only used in one place. Might be removed.
describe('findRootAncestors', () => { }) //:: findRootAncestors
*/

describe('iterateEntityNode', () => {
  let parentEntity: Entity

  beforeEach(() => {
    createEngine()

    parentEntity = createEntity()
    setComponent(parentEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(parentEntity, UUIDComponent, 'root' as EntityUUID)
    setComponent(parentEntity, NameComponent, 'parentEntity-' + parentEntity)
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should traverse the children nodes and run the callback function on all of them', () => {
    const node_0 = createEntity()
    const node_0_0 = createEntity()
    const node_0_1 = createEntity()
    const node_0_0_0 = createEntity()
    const node_0_1_0 = createEntity()

    // Set the data as expected
    setComponent(node_0, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
    setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
    setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })

    // Run and Check the result
    const visited = [] as Entity[]
    iterateEntityNode(node_0, (node) => visited.push(node))
    assert.equal(visited.length, 5)
    assert.equal(visited[0], node_0)
    assert.equal(visited[1], node_0_0)
    assert.equal(visited[2], node_0_1)
    assert.equal(visited[3], node_0_1_0)
    assert.equal(visited[4], node_0_0_0)

    // Re-run and Check the new result
    const visitedAgain = [] as Entity[]
    iterateEntityNode(node_0_0, (node) => visitedAgain.push(node))
    assert.equal(visitedAgain.length, 2)
    assert.equal(visitedAgain[0], node_0_0)
    assert.equal(visitedAgain[1], node_0_0_0)
  })

  it('should return the expected array of data returned by `@param cb` on every step', () => {
    const Expected: string[] = []
    // Set the data as expected
    const entities: Entity[] = [createEntity(), createEntity(), createEntity(), createEntity()]
    // .. Add the parent to the expected list
    const parentName = 'parent-' + parentEntity
    Expected.push(parentName)
    setComponent(parentEntity, NameComponent, parentName)
    // .. Add the children to the expected list
    for (let id = 0; id < entities.length; ++id) {
      const entity = entities[id]
      const name = 'entity-' + entity
      Expected.push(name)
      setComponent(entity, NameComponent, name)
      setComponent(entity, EntityTreeComponent, { parentEntity: id === 0 ? parentEntity : entities[id - 1] })
    }
    // Sanity check before running
    for (const entity of entities) {
      assert.equal(hasComponents(entity, [NameComponent, EntityTreeComponent]), true)
      assert.equal(Expected.includes(getComponent(entity, NameComponent)), true)
    }
    // Run and Check the result
    const callback = (entity: Entity) => {
      return getComponent(entity, NameComponent)
    }
    const result = iterateEntityNode(parentEntity, callback)
    assertArray.eq(result, Expected)
  })

  it('should not process an entity when `@param pred` is specified and returns false for that entity', () => {
    const Expected: string[] = [getComponent(parentEntity, NameComponent)]
    function getName(entity: Entity): string {
      return 'entity-' + entity
    }
    // Set the data as expected
    const entities: Entity[] = [createEntity(), createEntity(), createEntity(), createEntity()]
    const callback = (entity: Entity) => {
      return getComponent(entity, NameComponent)
    }
    const predicate = (entity: Entity) => {
      return entity !== entities[entities.length - 2]
    }
    // .. Set the children
    for (let id = 0; id < entities.length; ++id) {
      const entity = entities[id]
      setComponent(entity, NameComponent, getName(entity))
      setComponent(entity, EntityTreeComponent, { parentEntity: id === 0 ? parentEntity : entities[id - 1] })
      if (predicate(entity)) Expected.push(getComponent(entity, NameComponent))
    }
    // Sanity check before running
    for (const entity of entities) assert.equal(hasComponents(entity, [NameComponent, EntityTreeComponent]), true)
    // Run and Check the result
    const result = iterateEntityNode(parentEntity, callback, predicate)
    assertArray.eq(result, Expected)
  })

  it('should not process the children of an entity when `@param pred` is specified, it returns false for that entity and snubChildren is true', () => {
    const snubChildren = true
    const Expected: string[] = []
    function getName(entity: Entity): string {
      return 'entity-' + entity
    }
    // Set the data as expected
    const entities: Entity[] = [createEntity(), createEntity(), createEntity(), createEntity()]
    const callback = (entity: Entity) => {
      return getComponent(entity, NameComponent)
    }
    const predicate = (entity: Entity) => {
      return entity !== parentEntity
    }
    // .. Set the parent
    const parentName = 'parent-' + parentEntity
    // Expected.push(parentName)
    setComponent(parentEntity, NameComponent, parentName)
    // .. Set the children
    for (let id = 0; id < entities.length; ++id) {
      const entity = entities[id]
      setComponent(entity, NameComponent, getName(entity))
      setComponent(entity, EntityTreeComponent, { parentEntity: id === 0 ? parentEntity : entities[id - 1] })
    }
    // Sanity check before running
    for (const entity of entities) assert.equal(hasComponents(entity, [NameComponent, EntityTreeComponent]), true)
    assert.equal(Expected.includes(getComponent(parentEntity, NameComponent)), false)
    // Run and Check the result
    const result = iterateEntityNode(parentEntity, callback, predicate, snubChildren)
    assertArray.eq(result, Expected)
  })

  it('should stop traversing as soon as `@param pred` returns true for the first time when `@param breakOnFind` is set to true', () => {
    const breakOnFind = true
    const snubChildren = false
    const Expected: string[] = []
    function getName(entity: Entity): string {
      return 'entity-' + entity
    }
    // Set the data as expected
    const entities: Entity[] = [createEntity(), createEntity(), createEntity(), createEntity()]
    const callback = (entity: Entity) => {
      return getComponent(entity, NameComponent)
    }
    const predicate = (entity: Entity) => {
      return entity === parentEntity
    }
    // .. Set the parent
    const parentName = 'parent-' + parentEntity
    Expected.push(parentName)
    setComponent(parentEntity, NameComponent, parentName)
    // .. Set the children
    for (let id = 0; id < entities.length; ++id) {
      const entity = entities[id]
      setComponent(entity, NameComponent, getName(entity))
      setComponent(entity, EntityTreeComponent, { parentEntity: id === 0 ? parentEntity : entities[id - 1] })
    }
    // Sanity check before running
    for (const entity of entities) assert.equal(hasComponents(entity, [NameComponent, EntityTreeComponent]), true)
    assert.equal(Expected.includes(getComponent(parentEntity, NameComponent)), true)
    // Run and Check the result
    const result = iterateEntityNode(parentEntity, callback, predicate, snubChildren, breakOnFind)
    assertArray.eq(result, Expected)
  })
}) //:: iterateEntityNode
