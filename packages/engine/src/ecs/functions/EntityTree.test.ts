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
  addEntityNodeChild,
  destroyEntityTree,
  findIndexOfEntityNode,
  getEntityNodeArrayFromEntities,
  initializeSceneEntity,
  iterateEntityNode,
  removeFromEntityTree,
  reparentEntityNode,
  traverseEntityNode,
  traverseEntityNodeParent
} from './EntityTree'

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
    assert.equal(node.parentEntity, null)
    assert.equal(node.rootEntity, null)
  })

  it('should set given values', () => {
    const sceneEntity = getState(SceneState).sceneEntity

    const entity = createEntity()
    const testUUID = 'test-uuid' as EntityUUID
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity, uuid: testUUID })

    const node = getComponent(entity, EntityTreeComponent)

    assert.equal(node.children.length, 0)
    assert.equal(node.parentEntity, sceneEntity)
    assert.equal(node.rootEntity, sceneEntity)

    assert.equal(getComponent(entity, UUIDComponent), testUUID)
    assert.equal(UUIDComponent.entitiesByUUID[testUUID], entity)

    const parentNode = getComponent(node.parentEntity!, EntityTreeComponent)
    assert.equal(parentNode.children.length, 1)
    assert.equal(parentNode.children[0], entity)
  })

  it('should set child at a given index', () => {
    const sceneEntity = getState(SceneState).sceneEntity

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
    assert.equal(sceneNode.children[0], UUIDComponent.entitiesByUUID['child-0'])
    assert.equal(sceneNode.children[1], UUIDComponent.entitiesByUUID['child-1'])
    assert.equal(sceneNode.children[2], entity)
    assert.equal(sceneNode.children[3], UUIDComponent.entitiesByUUID['child-2'])
    assert.equal(sceneNode.children[4], UUIDComponent.entitiesByUUID['child-3'])
    assert.equal(sceneNode.children[5], UUIDComponent.entitiesByUUID['child-4'])
    assert.equal(sceneNode.parentEntity, null)
    assert.equal(sceneNode.rootEntity, sceneEntity)
  })

  it('should remove entity from maps', () => {
    const sceneEntity = getState(SceneState).sceneEntity

    const entity = createEntity()
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity, uuid: 'test-uuid' as EntityUUID })
    removeComponent(entity, EntityTreeComponent)

    // UUIDComponent should remain
    assert.equal(getComponent(entity, UUIDComponent), 'test-uuid')
    assert.equal(UUIDComponent.entitiesByUUID['test-uuid'], entity)

    const parentNode = getComponent(sceneEntity, EntityTreeComponent)
    assert.equal(parentNode.children.length, 0)
  })
})

describe('EntityTreeFunctions', () => {
  let root: Entity

  beforeEach(() => {
    createEngine()

    root = getState(SceneState).sceneEntity
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('initializeEntityTree function', () => {
    it('will initialize entity tree', () => {
      initializeSceneEntity()
      const sceneEntity = getState(SceneState).sceneEntity
      assert(sceneEntity)
      assert(getComponent(sceneEntity, NameComponent), 'scene')
      assert(hasComponent(sceneEntity, VisibleComponent))
      assert(hasComponent(sceneEntity, SceneTagComponent))
      assert(hasComponent(sceneEntity, TransformComponent))
      assert(hasComponent(sceneEntity, EntityTreeComponent))
      assert.equal(getComponent(sceneEntity, EntityTreeComponent).parentEntity, null)
      assert.equal(getComponent(sceneEntity, EntityTreeComponent).rootEntity, sceneEntity)
    })
  })

  describe('addEntityNodeChild function', () => {
    it('will not add entity node if already added', () => {
      const node = createEntity()
      addEntityNodeChild(node, root)
      const rootNode = getComponent(root, EntityTreeComponent)
      assert.equal(rootNode.children.length, 1)
      addEntityNodeChild(node, root)
      assert.equal(rootNode.children.length, 1)
    })

    it('will reparent node if parent entity is different in passed node', () => {
      const child = createEntity()
      addEntityNodeChild(child, root)

      const parent = createEntity()
      setComponent(parent, EntityTreeComponent, { parentEntity: null })
      addEntityNodeChild(child, parent)

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

      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_0_0, node_0)
      addEntityNodeChild(node_0_1, node_0)
      addEntityNodeChild(node_0_0_0, node_0_0)
      addEntityNodeChild(node_0_1_0, node_0_1)

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

      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_0_0, node_0)
      addEntityNodeChild(node_0_1, node_0)
      addEntityNodeChild(node_0_0_0, node_0_0)
      addEntityNodeChild(node_0_1_0, node_0_1)

      removeFromEntityTree(node_0)

      assert(hasComponent(root, EntityTreeComponent))
      assert(!hasComponent(node_0, EntityTreeComponent))
      assert(!hasComponent(node_0_0, EntityTreeComponent))
      assert(!hasComponent(node_0_1, EntityTreeComponent))
      assert(!hasComponent(node_0_0_0, EntityTreeComponent))
      assert(!hasComponent(node_0_1_0, EntityTreeComponent))
    })
  })

  describe('reparentEntityNode function', () => {
    it('will reparent passed entity node to new parent', () => {
      const node_0 = createEntity()
      const node_1 = createEntity()
      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_1, root)

      reparentEntityNode(node_0, node_1)

      const node0 = getComponent(node_0, EntityTreeComponent)
      const node1 = getComponent(node_1, EntityTreeComponent)

      assert.equal(node0.parentEntity, node_1)
      assert.equal(node1.children.length, 1)
      assert.equal(node1.children[0], node_0)
    })
  })

  describe('traverseEntityNode function', () => {
    it('will traverse the childern nodes and run the callback function on them', () => {
      const node_0 = createEntity()
      const node_0_0 = createEntity()
      const node_0_1 = createEntity()
      const node_0_0_0 = createEntity()
      const node_0_1_0 = createEntity()

      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_0_0, node_0)
      addEntityNodeChild(node_0_1, node_0)
      addEntityNodeChild(node_0_0_0, node_0_0)
      addEntityNodeChild(node_0_1_0, node_0_1)

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

      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_0_0, node_0)
      addEntityNodeChild(node_0_1, node_0)
      addEntityNodeChild(node_0_0_0, node_0_0)
      addEntityNodeChild(node_0_1_0, node_0_1)

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
        addEntityNodeChild(nodes[i], i === 0 ? root : nodes[i - 1])
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

  describe('getEntityNodeArrayFromEntities function', () => {
    it('will return entity node array from passed entities', () => {
      const nodes = [] as Entity[]
      for (let i = 0; i < 4; i++) {
        nodes[i] = createEntity()
        addEntityNodeChild(nodes[i], root)
      }

      const entities = [nodes[0], nodes[2]]

      const retrivedNodes = getEntityNodeArrayFromEntities(entities) as Entity[]

      retrivedNodes.forEach((node) => assert(entities.includes(node)))
    })

    it('will remove entity for which there is no node', () => {
      const nodes = [] as Entity[]
      for (let i = 0; i < 4; i++) {
        nodes[i] = createEntity()
        addEntityNodeChild(nodes[i], root)
      }

      const fakeEntity = createEntity()
      const entities = [nodes[0], nodes[2], fakeEntity]

      const retrivedNodes = getEntityNodeArrayFromEntities(entities)

      retrivedNodes.forEach((node) => assert.notEqual(node, fakeEntity))
    })
  })

  describe('findIndexOfEntityNode function', () => {
    it('will return index of passed entity node', () => {
      const testNode = createEntity()
      addEntityNodeChild(createEntity(), root)
      addEntityNodeChild(createEntity(), root)
      addEntityNodeChild(testNode, root)
      addEntityNodeChild(createEntity(), root)

      assert.equal(
        findIndexOfEntityNode(
          getEntityNodeArrayFromEntities(getComponent(root, EntityTreeComponent).children),
          testNode
        ),
        2
      )
    })

    it('will return -1 if it can not find the index of the passed node', () => {
      const testNode = createEntity()
      addEntityNodeChild(createEntity(), root)
      addEntityNodeChild(createEntity(), root)
      addEntityNodeChild(createEntity(), root)

      assert.equal(
        findIndexOfEntityNode(
          getEntityNodeArrayFromEntities(getComponent(root, EntityTreeComponent).children),
          testNode
        ),
        -1
      )
    })
  })
})
