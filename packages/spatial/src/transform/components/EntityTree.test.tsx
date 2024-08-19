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

import { act, render } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'

import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, hasComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { createEntity, removeEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { startReactor } from '@ir-engine/hyperflux'

import { NameComponent } from '../../common/NameComponent'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'

import {
  destroyEntityTree,
  EntityTreeComponent,
  findIndexOfEntityNode,
  iterateEntityNode,
  removeFromEntityTree,
  traverseEntityNode,
  traverseEntityNodeParent,
  useAncestorWithComponent,
  useChildWithComponent,
  useTreeQuery
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

      traverseEntityNodeParent(nodes[nodes.length - 1], (parent) => visited.push(parent))

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

describe('useTreeQuery', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should return complete deep list of entites for an entity tree', async () => {
    const rootEntity = createEntity()
    setComponent(rootEntity, EntityTreeComponent)

    console.log({ rootEntity })

    let ents = [] as Entity[]

    const Reactor = startReactor(() => {
      const data = useTreeQuery(rootEntity)

      console.log('render', data)

      useEffect(() => {
        console.log('effect', data)
        ents = data
      }, [data])

      return null
    })

    const tag = <Reactor.Reactor />
    const { rerender, unmount } = render(tag)

    assert.equal(ents.length, 1, 'root entity not populated')
    assert.equal(ents[0], rootEntity, 'root entity not populated')

    await act(() => rerender(tag))

    assert.equal(ents.length, 1, 'root entity not populated after re-querying')
    assert.equal(ents[0], rootEntity, 'root entity not populated')

    const childEntity = createEntity()
    setComponent(childEntity, EntityTreeComponent, { parentEntity: rootEntity })

    await act(() => rerender(tag))

    assert.equal(ents.length, 2, 'query incorrect after adding child')
    assert.equal(ents[0], rootEntity, 'root entity not populated')
    assert.equal(ents[1], childEntity, 'child entity not populated')

    const deepChildEntity = createEntity()
    setComponent(deepChildEntity, EntityTreeComponent, { parentEntity: childEntity })

    await act(() => rerender(tag))

    assert.equal(ents.length, 3, 'query incorrect after adding deep child')
    assert.equal(ents[0], rootEntity, 'root entity not populated')
    assert.equal(ents[1], childEntity, 'child entity not populated')
    assert.equal(ents[2], deepChildEntity, 'deep child entity not populated')

    const deepChildEntity2 = createEntity()
    setComponent(deepChildEntity2, EntityTreeComponent, { parentEntity: childEntity })

    await act(() => rerender(tag))

    assert.equal(ents.length, 4, 'query incorrect after adding another deep child')
    assert.equal(ents[0], rootEntity, 'root entity not populated')
    assert.equal(ents[1], childEntity, 'child entity not populated')
    assert.equal(ents[2], deepChildEntity, 'deep child entity not populated')
    assert.equal(ents[3], deepChildEntity2, 'deep child 2 entity not populated')

    console.log({ ents }, '\n')

    removeEntity(deepChildEntity2)

    await act(() => rerender(tag))

    assert.equal(ents.length, 3, 'query incorrect after adding remove second deep child')
    assert.equal(ents[0], rootEntity, 'root entity not populated')
    assert.equal(ents[1], childEntity, 'child entity not populated')
    assert.equal(ents[2], deepChildEntity, 'deep child entity not populated')
    assert.equal(ents[3], undefined, 'deep child 2 entity still populated')

    removeEntity(childEntity)

    await act(() => rerender(tag))

    assert.equal(ents.length, 1, 'query incorrect after adding removing child')
    assert.equal(ents[0], rootEntity, 'root entity not populated')
    assert.equal(ents[1], undefined, 'child entity still populated')
    assert.equal(ents[2], undefined, 'deep child entity still populated')
    assert.equal(ents[3], undefined, 'deep child 2 entity still populated')

    removeEntity(rootEntity)

    await act(() => rerender(tag))

    assert.equal(ents.length, 0, 'query incorrect after adding removing all entities')
    assert.equal(ents[0], undefined, 'root entity still populated')
    assert.equal(ents[1], undefined, 'child entity still populated')
    assert.equal(ents[2], undefined, 'deep child entity still populated')
    assert.equal(ents[3], undefined, 'deep child 2 entity still populated')

    unmount()
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

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const entity = useChildWithComponent(rootEntity, component)
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
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_1, component)
    // Case1: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assert.equal(
      true,
      hasComponent(child_1, component),
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
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_2, component)
    // Case2: Validate
    assertEntityHierarchy('rootEntity', rootEntity)
    assertEntityHierarchy('child_1', child_1, rootEntity)
    assertEntityHierarchy('child_2', child_2, child_1)
    assert.equal(
      true,
      hasComponent(child_2, component),
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
    setComponent(child_1, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(child_2, EntityTreeComponent, { parentEntity: child_1 })
    setComponent(child_1, component)
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

describe('useAncestorWithComponent', () => {
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

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const entity = useAncestorWithComponent(rootEntity, component)
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
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    setComponent(parent_1, component)
    // Case1: Validate
    assertEntityHierarchy('parent_1', parent_1)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    assert.equal(
      true,
      hasComponent(parent_1, component),
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
    setComponent(parent_2, component)
    setComponent(parent_2, EntityTreeComponent)
    setComponent(parent_1, EntityTreeComponent, { parentEntity: parent_2 })
    setComponent(rootEntity, EntityTreeComponent, { parentEntity: parent_1 })
    // Case2: Validate
    assertEntityHierarchy('parent_2', parent_2)
    assertEntityHierarchy('parent_1', parent_1, parent_2)
    assertEntityHierarchy('rootEntity', rootEntity, parent_1)
    assert.equal(
      true,
      hasComponent(parent_2, component),
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
    setComponent(parent_2, EntityTreeComponent)
    setComponent(parent_1, EntityTreeComponent, { parentEntity: parent_2 })
    setComponent(parent_1, component)
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
  })
})
