import assert from 'assert'
import { MathUtils } from 'three'

import { createEngine } from '../../initializeEngine'
import { Engine } from '../classes/Engine'
import { World } from '../classes/World'
import { createEntity } from '../functions/EntityFunctions'
import { EntityTreeNode } from './EntityTree'
import {
  addEntityNodeChild,
  addToEntityTreeMaps,
  cloneEntityNode,
  createEntityNode,
  emptyEntityTree,
  findIndexOfEntityNode,
  getEntityNodeArrayFromEntities,
  initializeEntityTree,
  isEntityNode,
  iterateEntityNode,
  removeEntityNodeChild,
  removeEntityNodeFromParent,
  removeFromEntityTreeMaps,
  reparentEntityNode,
  traverseEntityNode,
  traverseEntityNodeParent
} from './EntityTree'

describe('EntityTree', () => {
  let world: World
  let root: EntityTreeNode

  beforeEach(() => {
    createEngine()
    world = Engine.instance.currentWorld

    root = world.entityTree.rootNode
  })

  describe('addToEntityTreeMaps function', () => {
    it('will add entity from maps', () => {
      const node = createEntityNode(createEntity())
      addToEntityTreeMaps(node)
      assert(world.entityTree.entityNodeMap.get(node.entity))
      assert(world.entityTree.uuidNodeMap.get(node.uuid))
    })
  })

  describe('removeFromEntityTreeMaps function', () => {
    it('will remove entity from maps', () => {
      const node = createEntityNode(createEntity())
      addEntityNodeChild(node, root)
      removeFromEntityTreeMaps(node)
      assert(!world.entityTree.entityNodeMap.get(node.entity))
      assert(!world.entityTree.uuidNodeMap.get(node.uuid))
    })
  })

  describe('initializeEntityTree function', () => {
    it('will initialize entity tree', () => {
      initializeEntityTree()
      assert(world.entityTree.entityNodeMap)
      assert(world.entityTree.uuidNodeMap)
      assert.equal(world.entityTree.entityNodeMap.size, 1)
      assert.equal(world.entityTree.uuidNodeMap.size, 1)
    })
  })

  describe('addEntityNodeChild function', () => {
    it('will not add entity node if already added', () => {
      const node = createEntityNode(createEntity())
      addEntityNodeChild(node, root)
      addEntityNodeChild(node, root)
      assert.equal(root.children?.length, 1)
    })

    it('will not add entity node if already added and reparent it if parent entity is different in passed node', () => {
      const node = createEntityNode(createEntity())
      const node_1 = createEntityNode(createEntity())
      addEntityNodeChild(node, root)
      addEntityNodeChild(node, node_1)
      assert.equal(root.children?.length, 1)
      assert.equal(node.parentEntity, node_1.entity)
    })

    it('will add node and parent node in the tree', () => {
      const node = createEntityNode(createEntity())
      const node_1 = createEntityNode(createEntity())

      addEntityNodeChild(node, node_1)

      assert(node_1.children?.includes(node.entity))
      assert.equal(node.parentEntity, node_1.entity)
    })
  })

  describe('emptyEntityTree function', () => {
    it('will empty entity tree', () => {
      const node_0 = createEntityNode(createEntity())
      const node_0_0 = createEntityNode(createEntity())
      const node_0_1 = createEntityNode(createEntity())
      const node_0_0_0 = createEntityNode(createEntity())
      const node_0_1_0 = createEntityNode(createEntity())

      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_0_0, node_0)
      addEntityNodeChild(node_0_1, node_0)
      addEntityNodeChild(node_0_0_0, node_0_0)
      addEntityNodeChild(node_0_1_0, node_0_1)

      emptyEntityTree(world.entityTree)

      assert(world.entityTree.rootNode.entity)
      assert.equal(world.entityTree.entityNodeMap.size, 1)
      assert.equal(world.entityTree.uuidNodeMap.size, 1)
    })
  })

  describe('createEntityNode function', () => {
    it('will create entity node', () => {
      const entity0 = createEntity()
      const node_0 = createEntityNode(entity0)
      assert.equal(node_0.type, 'EntityNode')
      assert.equal(node_0.entity, entity0)
      assert(node_0.uuid)

      const entity1 = createEntity()
      const uuid = MathUtils.generateUUID()
      const node_1 = createEntityNode(entity1, uuid)
      assert.equal(node_1.type, 'EntityNode')
      assert.equal(node_1.entity, entity1)
      assert.equal(node_1.uuid, uuid)
    })
  })

  describe('addEntityNodeChild function', () => {
    it('will add entity child node', () => {
      const node_0 = createEntityNode(createEntity())
      const node_1 = createEntityNode(createEntity())
      const node_2 = createEntityNode(createEntity())

      addEntityNodeChild(node_1, node_0)

      assert(node_0.children?.includes(node_1.entity))
      assert.equal(node_1.parentEntity, node_0.entity)
      assert(world.entityTree.entityNodeMap.has(node_1.entity))
      assert(world.entityTree.uuidNodeMap.has(node_1.uuid))

      addEntityNodeChild(node_2, node_0, 0)
      assert.equal(node_0.children?.indexOf(node_2.entity), 0)
      assert.equal(node_2.parentEntity, node_0.entity)
    })
  })

  describe('removeEntityNodeChild function', () => {
    it('will remove entity child node', () => {
      const node_0 = createEntityNode(createEntity())
      const node_1 = createEntityNode(createEntity())
      const node_2 = createEntityNode(createEntity())

      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_1, node_0)

      removeEntityNodeChild(node_0, node_1)

      assert.doesNotThrow(() => {
        removeEntityNodeChild(node_0, node_2)
      }, 'This should not throw any error if children does not exists in parent')

      assert(!node_0.children?.includes(node_1.entity))
      assert(!world.entityTree.entityNodeMap.has(node_1.entity))
      assert(!world.entityTree.uuidNodeMap.has(node_1.uuid))

      assert.doesNotThrow(() => {
        removeEntityNodeChild(node_2, node_1)
      }, 'This should not throw any error if parent node has no children')
    })
  })

  describe('removeEntityNodeFromParent function', () => {
    it('will remove entity node from its parent', () => {
      const node_0 = createEntityNode(createEntity())
      const node_1 = createEntityNode(createEntity())
      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_1, node_0)

      removeEntityNodeFromParent(node_0)

      assert(!node_1.children?.includes(node_0.entity))

      assert.doesNotThrow(() => {
        removeEntityNodeFromParent(createEntityNode(createEntity()))
      }, 'This should not throw any error if parent entity is not defined')
    })
  })

  describe('reparentEntityNode function', () => {
    it('will reparent passed entity node to new parent', () => {
      const node_0 = createEntityNode(createEntity())
      const node_1 = createEntityNode(createEntity())
      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_1, root)

      reparentEntityNode(node_0, node_1)

      assert.equal(node_0.parentEntity, node_1.entity)
    })
  })

  it('will cloned passed entity node', () => {
    const node = createEntityNode(createEntity())
    const clone = cloneEntityNode(node)

    assert.deepEqual(node, clone)
    assert.notEqual(node, clone)
  })

  describe('traverseEntityNode function', () => {
    it('will traverse the childern nodes and run the callback function on them', () => {
      const node_0 = createEntityNode(createEntity())
      const node_0_0 = createEntityNode(createEntity())
      const node_0_1 = createEntityNode(createEntity())
      const node_0_0_0 = createEntityNode(createEntity())
      const node_0_1_0 = createEntityNode(createEntity())

      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_0_0, node_0)
      addEntityNodeChild(node_0_1, node_0)
      addEntityNodeChild(node_0_0_0, node_0_0)
      addEntityNodeChild(node_0_1_0, node_0_1)

      traverseEntityNode(node_0, (node) => ((node as any).visited = true))

      assert.equal((node_0 as any).visited, true)
      assert.equal((node_0_0 as any).visited, true)
      assert.equal((node_0_1 as any).visited, true)
      assert.equal((node_0_0_0 as any).visited, true)
      assert.equal((node_0_1_0 as any).visited, true)

      traverseEntityNode(node_0_0, (node) => ((node as any).visitedAgain = true))

      assert.equal((node_0 as any).visitedAgain, undefined)
      assert.equal((node_0_0 as any).visitedAgain, true)
      assert.equal((node_0_1 as any).visitedAgain, undefined)
      assert.equal((node_0_0_0 as any).visitedAgain, true)
      assert.equal((node_0_1_0 as any).visitedAgain, undefined)
    })
  })

  describe('iterateEntityNode function', () => {
    it('will traverse the childern nodes and run the callback function on them', () => {
      const node_0 = createEntityNode(createEntity())
      const node_0_0 = createEntityNode(createEntity())
      const node_0_1 = createEntityNode(createEntity())
      const node_0_0_0 = createEntityNode(createEntity())
      const node_0_1_0 = createEntityNode(createEntity())

      addEntityNodeChild(node_0, root)
      addEntityNodeChild(node_0_0, node_0)
      addEntityNodeChild(node_0_1, node_0)
      addEntityNodeChild(node_0_0_0, node_0_0)
      addEntityNodeChild(node_0_1_0, node_0_1)

      iterateEntityNode(node_0, (node) => ((node as any).visited = true))

      assert.equal((node_0 as any).visited, true)
      assert.equal((node_0_0 as any).visited, true)
      assert.equal((node_0_1 as any).visited, true)
      assert.equal((node_0_0_0 as any).visited, true)
      assert.equal((node_0_1_0 as any).visited, true)

      iterateEntityNode(node_0_0, (node) => ((node as any).visitedAgain = true))

      assert.equal((node_0 as any).visitedAgain, undefined)
      assert.equal((node_0_0 as any).visitedAgain, true)
      assert.equal((node_0_1 as any).visitedAgain, undefined)
      assert.equal((node_0_0_0 as any).visitedAgain, true)
      assert.equal((node_0_1_0 as any).visitedAgain, undefined)
    })
  })

  describe('traverseEntityNodeParent function', () => {
    it('will traverse the parent nodes and run the callback function on them', () => {
      const nodes = [] as EntityTreeNode[]
      for (let i = 0; i < 4; i++) {
        nodes[i] = createEntityNode(createEntity())
        addEntityNodeChild(nodes[i], i === 0 ? root : nodes[i - 1])
      }

      traverseEntityNodeParent(nodes[nodes.length - 1], (parent) => ((parent as any).visited = true))

      for (let i = 0; i < nodes.length; i++) {
        if (i === nodes.length - 1) {
          assert.notEqual((nodes[i] as any).visited, true)
        } else {
          assert.equal((nodes[i] as any).visited, true)
        }
      }
    })

    it('will not throw error if parent node does not exists', () => {
      assert.doesNotThrow(() => {
        traverseEntityNodeParent(root, (parent) => ((parent as any).visited = true))
      })
    })
  })

  describe('getEntityNodeArrayFromEntities function', () => {
    it('will return true is type of passed object is EntityNode', () => {
      assert(isEntityNode(createEntityNode(createEntity())))
      assert(isEntityNode({ type: 'EntityNode' }))
    })

    it('will return false is type of passed object is not EntityNode', () => {
      assert(!isEntityNode({ type: 'string' }))
    })
  })

  describe('getEntityNodeArrayFromEntities function', () => {
    it('will return entity node array from passed entities', () => {
      const nodes = [] as EntityTreeNode[]
      for (let i = 0; i < 4; i++) {
        nodes[i] = createEntityNode(createEntity())
        addEntityNodeChild(nodes[i], root)
      }

      const entities = [nodes[0].entity, nodes[2].entity]

      const retrivedNodes = getEntityNodeArrayFromEntities(entities)

      retrivedNodes.forEach((node) => assert(entities.includes((node as EntityTreeNode).entity)))
    })

    it('will remove entity for which there is no node', () => {
      const nodes = [] as EntityTreeNode[]
      for (let i = 0; i < 4; i++) {
        nodes[i] = createEntityNode(createEntity())
        addEntityNodeChild(nodes[i], root)
      }

      const fakeEntity = createEntity()
      const entities = [nodes[0].entity, nodes[2].entity, fakeEntity]

      const retrivedNodes = getEntityNodeArrayFromEntities(entities)

      retrivedNodes.forEach((node) => assert.notEqual((node as EntityTreeNode).entity, fakeEntity))
    })
  })

  describe('findIndexOfEntityNode function', () => {
    it('will return index of passed entity node', () => {
      const testNode = createEntityNode(createEntity())
      addEntityNodeChild(createEntityNode(createEntity()), root)
      addEntityNodeChild(createEntityNode(createEntity()), root)
      addEntityNodeChild(testNode, root)
      addEntityNodeChild(createEntityNode(createEntity()), root)

      assert(world.entityTree.rootNode.children.length)
      assert.equal(
        findIndexOfEntityNode(getEntityNodeArrayFromEntities(world.entityTree.rootNode.children), testNode),
        2
      )
    })

    it('will return -1 if it can not find the index of the passed node', () => {
      const testNode = createEntityNode(createEntity())
      addEntityNodeChild(createEntityNode(createEntity()), root)
      addEntityNodeChild(createEntityNode(createEntity()), root)
      addEntityNodeChild(createEntityNode(createEntity()), root)

      assert(world.entityTree.rootNode.children)
      assert.equal(
        findIndexOfEntityNode(getEntityNodeArrayFromEntities(world.entityTree.rootNode.children), testNode),
        -1
      )
    })
  })

  afterEach(() => {
    emptyEntityTree(world.entityTree)
  })
})
