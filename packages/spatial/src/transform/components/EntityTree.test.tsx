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
import assert from 'assert'
import React, { useEffect } from 'react'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { EntityUUID, hasComponents, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, hasComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { createEntity } from '@ir-engine/ecs/src/EntityFunctions'

import { NameComponent } from '../../common/NameComponent'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'

import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import {
  destroyEntityTree,
  EntityTreeComponent,
  findIndexOfEntityNode,
  getAncestorWithComponents,
  getChildrenWithComponents,
  iterateEntityNode,
  removeFromEntityTree,
  traverseEntityNode,
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

describe('EntityTreeComponent', () => {
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
})

describe('EntityTreeFunctions', () => {
  let root: Entity

  beforeEach(() => {
    createEngine()

    root = createEntity()

    setComponent(root, EntityTreeComponent, {
      parentEntity: UndefinedEntity
    })
    setComponent(root, UUIDComponent, 'root' as EntityUUID)
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('addEntityNodeChild function', () => {
    it('will not add entity node if already added', () => {
      const node = createEntity()
      setComponent(node, EntityTreeComponent, { parentEntity: root })
      const rootNode = getComponent(root, EntityTreeComponent)
      assert.equal(rootNode.children.length, 1)
      setComponent(node, EntityTreeComponent, { parentEntity: root })
      assert.equal(rootNode.children.length, 1)
    })

    it('will reparent node if parent entity is different in passed node', () => {
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
  })

  describe('destroyEntityTree function', () => {
    it('will empty entity tree', () => {
      const node_0 = createEntity()
      const node_0_0 = createEntity()
      const node_0_1 = createEntity()
      const node_0_0_0 = createEntity()
      const node_0_1_0 = createEntity()

      setComponent(node_0, EntityTreeComponent, { parentEntity: root })
      setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
      setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
      setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
      setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })

      destroyEntityTree(node_0)

      assert(hasComponent(root, EntityTreeComponent))
      assert(!hasComponent(node_0, EntityTreeComponent))
      assert(!hasComponent(node_0_0, EntityTreeComponent))
      assert(!hasComponent(node_0_1, EntityTreeComponent))
      assert(!hasComponent(node_0_0_0, EntityTreeComponent))
      assert(!hasComponent(node_0_1_0, EntityTreeComponent))
    })
  })

  describe('removeFromEntityTree function', () => {
    it('will empty entity tree', () => {
      const node_0 = createEntity()
      const node_0_0 = createEntity()
      const node_0_1 = createEntity()
      const node_0_0_0 = createEntity()
      const node_0_1_0 = createEntity()

      setComponent(node_0, EntityTreeComponent, { parentEntity: root })
      setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
      setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
      setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
      setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })

      removeFromEntityTree(node_0)

      assert(hasComponent(root, EntityTreeComponent))
      assert(!hasComponent(node_0, EntityTreeComponent))
      assert(!hasComponent(node_0_0, EntityTreeComponent))
      assert(!hasComponent(node_0_1, EntityTreeComponent))
      assert(!hasComponent(node_0_0_0, EntityTreeComponent))
      assert(!hasComponent(node_0_1_0, EntityTreeComponent))
    })
  })

  describe('traverseEntityNode function', () => {
    it('will traverse the childern nodes and run the callback function on them', () => {
      const node_0 = createEntity()
      const node_0_0 = createEntity()
      const node_0_1 = createEntity()
      const node_0_0_0 = createEntity()
      const node_0_1_0 = createEntity()

      setComponent(node_0, EntityTreeComponent, { parentEntity: root })
      setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
      setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
      setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
      setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })

      const visited = [] as Entity[]

      traverseEntityNode(node_0, (node) => visited.push(node))

      assert.equal(visited.length, 5)
      assert.equal(visited[0], node_0)
      assert.equal(visited[1], node_0_0)
      assert.equal(visited[2], node_0_0_0)
      assert.equal(visited[3], node_0_1)
      assert.equal(visited[4], node_0_1_0)

      const visitedAgain = [] as Entity[]

      traverseEntityNode(node_0_0, (node) => visitedAgain.push(node))

      assert.equal(visitedAgain.length, 2)
      assert.equal(visitedAgain[0], node_0_0)
      assert.equal(visitedAgain[1], node_0_0_0)
    })
  })

  describe('iterateEntityNode function', () => {
    it('will traverse the childern nodes and run the callback function on them', () => {
      const node_0 = createEntity()
      const node_0_0 = createEntity()
      const node_0_1 = createEntity()
      const node_0_0_0 = createEntity()
      const node_0_1_0 = createEntity()

      setComponent(node_0, EntityTreeComponent, { parentEntity: root })
      setComponent(node_0_0, EntityTreeComponent, { parentEntity: node_0 })
      setComponent(node_0_1, EntityTreeComponent, { parentEntity: node_0 })
      setComponent(node_0_0_0, EntityTreeComponent, { parentEntity: node_0_0 })
      setComponent(node_0_1_0, EntityTreeComponent, { parentEntity: node_0_1 })

      const visited = [] as Entity[]

      iterateEntityNode(node_0, (node) => visited.push(node))

      assert.equal(visited.length, 5)
      assert.equal(visited[0], node_0)
      assert.equal(visited[1], node_0_0)
      assert.equal(visited[2], node_0_1)
      assert.equal(visited[3], node_0_1_0) // @todo, why is this in the wrong order?
      assert.equal(visited[4], node_0_0_0)

      const visitedAgain = [] as Entity[]

      iterateEntityNode(node_0_0, (node) => visitedAgain.push(node))

      assert.equal(visitedAgain.length, 2)
      assert.equal(visitedAgain[0], node_0_0)
      assert.equal(visitedAgain[1], node_0_0_0)
    })
  })

  describe('traverseEntityNodeParent function', () => {
    it('will traverse the parent nodes and run the callback function on them', () => {
      const nodes = [] as Entity[]
      for (let i = 0; i < 4; i++) {
        nodes[i] = createEntity()
        setComponent(nodes[i], EntityTreeComponent, { parentEntity: i === 0 ? root : nodes[i - 1] })
      }

      const visited = [] as Entity[]

      traverseEntityNodeParent(nodes[nodes.length - 1], (parent) => (visited.push(parent), undefined))

      assert.equal(visited.length, 4)
      assert.equal(visited[0], nodes[2])
      assert.equal(visited[1], nodes[1])
      assert.equal(visited[2], nodes[0])
      assert.equal(visited[3], root)
    })

    it('will not throw error if parent node does not exists', () => {
      assert.doesNotThrow(() => {
        traverseEntityNodeParent(root, () => {})
      })
    })
  })

  describe('findIndexOfEntityNode function', () => {
    it('will return index of passed entity node', () => {
      const testNode = createEntity()
      setComponent(createEntity(), EntityTreeComponent, { parentEntity: root })
      setComponent(createEntity(), EntityTreeComponent, { parentEntity: root })
      setComponent(testNode, EntityTreeComponent, { parentEntity: root })
      setComponent(createEntity(), EntityTreeComponent, { parentEntity: root })

      assert.equal(findIndexOfEntityNode(getComponent(root, EntityTreeComponent).children, testNode), 2)
    })

    it('will return -1 if it can not find the index of the passed node', () => {
      const testNode = createEntity()
      setComponent(createEntity(), EntityTreeComponent, { parentEntity: root })
      setComponent(createEntity(), EntityTreeComponent, { parentEntity: root })
      setComponent(createEntity(), EntityTreeComponent, { parentEntity: root })

      assert.equal(findIndexOfEntityNode(getComponent(root, EntityTreeComponent).children, testNode), -1)
    })
  })
})

describe('getAncestorWithComponents', () => {
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
    let child_1 = createEntity()
    let child_2 = createEntity()
    let result = UndefinedEntity
    const component = HighlightComponent
    const component2 = VisibleComponent

    /**
     * @description Case 1:  rootEntity (with) -> child_1 (with) -> child_2 (empty) - get closest
     */
    // Case 1: Initialize

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(rootEntity, component)
    setComponent(rootEntity, component2)

    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_1, component)
    setComponent(child_1, component2)

    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')

    result = getAncestorWithComponents(child_2, [component, component2], true)

    // Case1: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(
      true,
      hasComponents(child_1, [component, component2]),
      'Case1: The parent entity did not get its test component set correctly'
    )
    assert.equal(
      true,
      hasComponents(rootEntity, [component, component2]),
      'Case1: The parent entity did not get its test component set correctly'
    )
    // Case1: Check
    assertEntityHierarchy('Case1: result', result, rootEntity)
    assert.equal(child_1, result, `Case1: Did not return the correct entity. result = ${result}`)
    // Case1: Terminate
    destroyEntityTree(rootEntity)

    /**
     * @description Case 2:  rootEntity (with) -> child_1 (with) -> child_2 (empty) - get farthest
     */
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    result = UndefinedEntity

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(rootEntity, component)
    setComponent(rootEntity, component2)

    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_1, component)
    setComponent(child_1, component2)

    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')

    result = getAncestorWithComponents(child_2, [component, component2], false)

    // Case2: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(
      true,
      hasComponents(child_1, [component, component2]),
      'Case2: The parent entity did not get its test component set correctly'
    )
    assert.equal(
      true,
      hasComponents(rootEntity, [component, component2]),
      'Case2: The parent entity did not get its test component set correctly'
    )
    // Case2: Check
    assertEntityHierarchy('Case2: result', result)
    assert.equal(rootEntity, result, `Case2: Did not return the correct entity. result = ${result}`)

    // Case3: Check getAncestorWithComponents w/ closest = false where the entity is the only one with the components
    setComponent(child_2, component)
    setComponent(child_2, component2)
    removeComponent(child_1, component)
    removeComponent(child_1, component2)
    removeComponent(rootEntity, component)
    removeComponent(rootEntity, component2)
    result = getAncestorWithComponents(child_2, [component, component2], false)
    assert.equal(child_2, result, `Case3: Did not return the correct entity. result = ${result}`)

    destroyEntityTree(rootEntity)
  })

  it('only returns the self entity if the includeSelf flag is set', async () => {
    const entity1 = createEntity()
    const entity2 = createEntity()

    setComponent(entity1, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(entity2, EntityTreeComponent, { parentEntity: entity1 })

    setComponent(entity1, NameComponent, '1')
    setComponent(entity2, NameComponent, '2')

    assert(getAncestorWithComponents(entity2, [NameComponent]) === entity2)
    assert(getAncestorWithComponents(entity2, [NameComponent], false, false) === entity1)
    assert(getAncestorWithComponents(entity2, [NameComponent], true, false) === entity1)
  })
})

describe('useChildWithComponent', () => {
  // Run before every test case
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('returns the closest child entity that has the requested component', async () => {
    // Initialize with dummy data for the test
    let rootEntity = createEntity()
    let child_1 = createEntity()
    let child_2 = createEntity()
    let result = UndefinedEntity
    const component = HighlightComponent
    const component2 = VisibleComponent

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const entity = useChildWithComponents(rootEntity, [component, component2])
      console.log('render', entity)
      useEffect(() => {
        console.log('effect', entity)
        result = entity
      }, [entity])
      return null
    }
    const tag = <Reactor />

    /**
     * @description Case 1:  rootEntity -> child_1 (with component)
     */
    // Case 1: Initialize
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, component)
    setComponent(child_1, component2)
    // Case1: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assert.equal(
      true,
      hasComponents(child_1, [component, component2]),
      'Case1: The child entity did not get its test component set correctly'
    )
    // Case1: Check
    const R1 = render(tag)
    assertEntityHierarchy('Case1: result', result, rootEntity)
    assert.equal(child_1, result, `Case1: Did not return the correct entity. result = ${result}`)
    // Case1: Terminate
    destroyEntityTree(rootEntity)
    R1.unmount()

    /**
     * @description Case 2:  rootEntity -> child_1 -> child_2 (with component)
     */
    // Case 2: Initialize
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, component)
    setComponent(child_2, component2)
    // Case2: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(
      true,
      hasComponents(child_2, [component, component2]),
      'Case2: The child entity did not get its test component set correctly'
    )
    // Case2: Check
    const R2 = render(tag)
    assertEntityHierarchy('Case2: result', result, child_1)
    assert.equal(child_2, result, `Case2: Did not return the correct entity. result = ${result}`)
    // Case2: Terminate
    destroyEntityTree(rootEntity)
    R2.unmount()

    /**
     * @description Case 3:  rootEntity -> child_1 -> child_2    (none have the component)
     */
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
    assert.equal(
      result,
      UndefinedEntity,
      `Case3: Returned a valid entity, but should return UndefinedEntity. result = ${result}`
    )
    // Case3: Terminate
    destroyEntityTree(rootEntity)
    R3.unmount()

    /**
     * @description Case 4:  rootEntity -> child_1 (with component) -> child_2
     */
    // Case 4: Initialize
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_1, component)
    setComponent(child_1, component2)
    // Case4: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    // Case4: Check
    const R4 = render(tag)
    assert.equal(child_1, result, `Case4: Did not return the correct entity. result = ${result}`)
    assert.notEqual(child_2, result, `Case4: Did not return the correct entity. result = ${result}`)
    // Case4: Terminate
    destroyEntityTree(rootEntity)
    R4.unmount()
  })
})

describe('useChildrenWithComponent', () => {
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
    const component = HighlightComponent
    const component2 = VisibleComponent

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      //TODO pick up here where i left off in tests, need to properly convert result/entity to an array
      //DO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT
      //MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT
      // MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT MEDO NOT COMMIT ME

      const entities = useChildrenWithComponents(rootEntity, [component, component2])
      console.log('render', entities)
      useEffect(() => {
        console.log('effect', entities)
        results = entities
      }, [entities])
      return null
    }
    const tag = <Reactor />

    /**
     * @description Case 1:  rootEntity -> child_1 + child_2(with component)
     */
    // Case 1: Initialize
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, component)
    setComponent(child_1, component2)
    setComponent(child_2, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, component)
    setComponent(child_2, component2)
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_2, NameComponent, 'child_2')
    // Case1: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assert.equal(
      true,
      hasComponents(child_1, [component, component2]),
      'Case1: The child entity did not get its test component set correctly'
    )
    assertEntityHierarchy('child_2', child_2, rootEntity)
    assert.equal(
      true,
      hasComponents(child_2, [component, component2]),
      'Case1: The child entity did not get its test component set correctly'
    )
    // Case1: Check
    const R1 = render(tag)
    for (const rslt of results) {
      assertEntityHierarchy('Case1: result', rslt, rootEntity)
    }
    assert.ok(results.indexOf(child_1) !== -1, `Case1: Results did not contain correct entity. results = ${results}`)
    assert.ok(results.indexOf(child_2) !== -1, `Case1: Results did not contain correct entity. results = ${results}`)
    // Case1: Terminate
    destroyEntityTree(rootEntity)
    R1.unmount()

    /**
     * @description Case 2:  rootEntity -> child_1 -> child_2 (with component)
     */
    // Case 2: Initialize
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, component)
    setComponent(child_2, component2)
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_2, NameComponent, 'child_2')
    // Case2: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(
      true,
      hasComponents(child_2, [component, component2]),
      'Case2: The child entity did not get its test component set correctly'
    )
    // Case2: Check
    const R2 = render(tag)
    const c1Index = results.indexOf(child_1)
    const c2Index = results.indexOf(child_2)

    assert.ok(c1Index === -1, `Case2: Results did not contain correct entity. results = ${results}`)
    assert.ok(c2Index !== -1, `Case2: Results did not contain correct entity. results = ${results}`)

    assertEntityHierarchy('Case2: result', results[c2Index], child_1)
    // Case2: Terminate
    destroyEntityTree(rootEntity)
    R2.unmount()

    /**
     * @description Case 3:  rootEntity -> child_1 -> child_2    (none have the component)
     */
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
    destroyEntityTree(rootEntity)
    R3.unmount()

    /**
     * @description Case 4:  rootEntity -> child_1 (with component) -> child_2
     */
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
    setComponent(child_1, component)
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
    destroyEntityTree(rootEntity)
    R4.unmount()
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
      console.log('render', entity)
      useEffect(() => {
        console.log('effect', entity)
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
    destroyEntityTree(parent_1)
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
    destroyEntityTree(rootEntity)
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
    destroyEntityTree(rootEntity)
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
    destroyEntityTree(rootEntity)
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
    destroyEntityTree(parent_1)
    R5.unmount()
  })

  // test for closest = false (furthst)
  it('returns the further ancestor entity', async () => {
    // Initialize with dummy data for the test
    let rootEntity = createEntity()
    let child_1 = createEntity()
    let child_2 = createEntity()
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

    destroyEntityTree(rootEntity)
  })

  // test for includeSelf = false
  it('returns the closest ancestor entity excluding self', async () => {
    let rootEntity = createEntity()
    let child_1 = createEntity()
    let child_2 = createEntity()
    let result = UndefinedEntity

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')

    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')

    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')

    const Reactor = () => {
      const entity = useAncestorWithComponents(child_2, [NameComponent], true, false)
      console.log('render', entity)
      useEffect(() => {
        console.log('effect', entity)
      }, [entity])
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

    destroyEntityTree(rootEntity)
  })
})

describe('getChildrenWithComponents', () => {
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
    let child_1 = createEntity()
    let child_2 = createEntity()
    let results = [] as Entity[]
    const component = HighlightComponent
    const component2 = VisibleComponent

    /**
     * @description Case 1:  rootEntity (empty) -> child_1 (with) -> child_2 (with) - get closest
     */
    // Case 1: Initialize

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')

    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_1, component)
    setComponent(child_1, component2)

    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')
    setComponent(child_2, component)
    setComponent(child_2, component2)

    results = getChildrenWithComponents(rootEntity, [component, component2])

    // Case1: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(
      true,
      hasComponents(child_1, [component, component2]),
      'Case1: The child1 entity did not get its test component set correctly'
    )
    assert.equal(
      true,
      hasComponents(child_2, [component, component2]),
      'Case1: The child2 entity did not get its test component set correctly'
    )
    // Case1: Check

    assert.equal(true, results.includes(child_1), 'Case1: The child1 entity was not found correctly')
    assert.equal(true, results.includes(child_2), 'Case1: The child2 entity was not found correctly')

    // Case1: Terminate
    destroyEntityTree(rootEntity)

    /**
     * @description Case 2:  rootEntity (with) -> child_1 (with) -> child_2 (empty) - get farthest
     */
    rootEntity = createEntity()
    child_1 = createEntity()
    child_2 = createEntity()
    results = [] as Entity[]

    setComponent(rootEntity, EntityTreeComponent)
    setComponent(rootEntity, NameComponent, 'rootEntity')

    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, NameComponent, 'child_1')
    setComponent(child_1, component)
    setComponent(child_1, component2)

    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, NameComponent, 'child_2')

    results = getChildrenWithComponents(rootEntity, [component, component2])

    // Case2: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(
      true,
      hasComponents(child_1, [component, component2]),
      'Case2: The child_1 entity did not get its test component set correctly'
    )
    assert.equal(
      false,
      hasComponents(child_2, [component, component2]),
      'Case2: The child_2 entity did not get its test component set correctly'
    )
    // Case2: Check
    assert.equal(true, results.includes(child_1), 'Case1: The child1 entity was not found correctly')
    assert.equal(false, results.includes(child_2), 'Case1: The child2 entity was not found correctly')
    // Case2: Terminate
    destroyEntityTree(rootEntity)
  })
})
