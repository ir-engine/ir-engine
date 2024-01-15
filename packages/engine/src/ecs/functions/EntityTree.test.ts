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

import assert from 'assert'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

import { getState } from '@etherealengine/hyperflux'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { createEngine } from '../../initializeEngine'
import { NameComponent } from '../../scene/components/NameComponent'
import { SceneTagComponent } from '../../scene/components/SceneTagComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { destroyEngine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { SceneState } from '../classes/Scene'
import { createEntity } from '../functions/EntityFunctions'
import { getComponent, hasComponent, removeComponent, setComponent } from './ComponentFunctions'
import {
  EntityTreeComponent,
  destroyEntityTree,
  findIndexOfEntityNode,
  iterateEntityNode,
  removeFromEntityTree,
  traverseEntityNode,
  traverseEntityNodeParent
} from './EntityTree'

describe('EntityTreeComponent', () => {
  beforeEach(() => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should add default values', () => {
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent)
    const node = getComponent(entity, EntityTreeComponent)
    assert.equal(node.children.length, 0)
    assert.equal(node.parentEntity, null)
  })

  it('should set given values', () => {
    const sceneEntity = SceneState.getRootEntity(getState(SceneState).activeScene!)

    const entity = createEntity()
    const testUUID = 'test-uuid' as EntityUUID
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity, uuid: testUUID })

    const node = getComponent(entity, EntityTreeComponent)

    assert.equal(node.children.length, 0)
    assert.equal(node.parentEntity, sceneEntity)

    assert.equal(getComponent(entity, UUIDComponent), testUUID)
    assert.equal(UUIDComponent.getEntityByUUID(testUUID), entity)

    const parentNode = getComponent(node.parentEntity!, EntityTreeComponent)
    assert.equal(parentNode.children.length, 1)
    assert.equal(parentNode.children[0], entity)
  })

  it('should set child at a given index', () => {
    const sceneEntity = SceneState.getRootEntity(getState(SceneState).activeScene!)

    setComponent(createEntity(), EntityTreeComponent, {
      parentEntity: sceneEntity,
      uuid: 'child-0' as EntityUUID
    })
    setComponent(createEntity(), EntityTreeComponent, {
      parentEntity: sceneEntity,
      uuid: 'child-1' as EntityUUID
    })
    setComponent(createEntity(), EntityTreeComponent, {
      parentEntity: sceneEntity,
      uuid: 'child-2' as EntityUUID
    })
    setComponent(createEntity(), EntityTreeComponent, {
      parentEntity: sceneEntity,
      uuid: 'child-3' as EntityUUID
    })
    setComponent(createEntity(), EntityTreeComponent, {
      parentEntity: sceneEntity,
      uuid: 'child-4' as EntityUUID
    })

    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, {
      parentEntity: sceneEntity,
      childIndex: 2,
      uuid: 'test-uuid' as EntityUUID
    })

    const sceneNode = getComponent(sceneEntity, EntityTreeComponent)
    assert.equal(sceneNode.children.length, 6)
    assert.equal(sceneNode.children[0], UUIDComponent.getEntityByUUID('child-0' as EntityUUID))
    assert.equal(sceneNode.children[1], UUIDComponent.getEntityByUUID('child-1' as EntityUUID))
    assert.equal(sceneNode.children[2], entity)
    assert.equal(sceneNode.children[3], UUIDComponent.getEntityByUUID('child-2' as EntityUUID))
    assert.equal(sceneNode.children[4], UUIDComponent.getEntityByUUID('child-3' as EntityUUID))
    assert.equal(sceneNode.children[5], UUIDComponent.getEntityByUUID('child-4' as EntityUUID))
    assert.equal(sceneNode.parentEntity, null)
  })

  it('should remove entity from maps', () => {
    const sceneEntity = SceneState.getRootEntity(getState(SceneState).activeScene!)

    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity, uuid: 'test-uuid' as EntityUUID })
    removeComponent(entity, EntityTreeComponent)

    // UUIDComponent should remain
    assert.equal(getComponent(entity, UUIDComponent), 'test-uuid')
    assert.equal(UUIDComponent.getEntityByUUID('test-uuid' as EntityUUID), entity)

    const parentNode = getComponent(sceneEntity, EntityTreeComponent)
    assert.equal(parentNode.children.length, 0)
  })
})

describe('EntityTreeFunctions', () => {
  let root: Entity

  beforeEach(() => {
    createEngine()
    loadEmptyScene()

    root = SceneState.getRootEntity(getState(SceneState).activeScene!)
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('initializeEntityTree function', () => {
    it('will initialize entity tree', () => {
      const sceneEntity = SceneState.getRootEntity(getState(SceneState).activeScene!)
      assert(sceneEntity)
      assert(getComponent(sceneEntity, NameComponent), 'Root')
      assert(hasComponent(sceneEntity, VisibleComponent))
      assert(hasComponent(sceneEntity, SceneTagComponent))
      assert(hasComponent(sceneEntity, TransformComponent))
      assert(hasComponent(sceneEntity, EntityTreeComponent))
      assert.equal(getComponent(sceneEntity, EntityTreeComponent).parentEntity, null)
    })
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
      setComponent(parent, EntityTreeComponent, { parentEntity: null })
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
