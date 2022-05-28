import assert from 'assert'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeInTree,
  createEntityNode,
  emptyEntityTree
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { registerPrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'

import EditorCommands from '../constants/EditorCommands'
import { accessSelectionState } from '../services/SelectionServices'
import { GroupCommand, GroupCommandParams } from './GroupCommand'

describe('GroupCommand', () => {
  let command = {} as GroupCommandParams
  let rootNode: EntityTreeNode
  let nodes: EntityTreeNode[]
  let parentNodes: EntityTreeNode[]
  let beforeNodes: EntityTreeNode[]

  beforeEach(() => {
    createEngine()
    registerPrefabs(Engine.instance.currentWorld)

    rootNode = createEntityNode(createEntity())
    nodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]
    parentNodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]
    beforeNodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]

    addEntityNodeInTree(rootNode)
    addEntityNodeInTree(parentNodes[0], rootNode)
    addEntityNodeInTree(parentNodes[1], rootNode)
    addEntityNodeInTree(nodes[0], parentNodes[0], 0)
    addEntityNodeInTree(nodes[1], parentNodes[1], 0)
    addEntityNodeInTree(beforeNodes[0], parentNodes[0])
    addEntityNodeInTree(beforeNodes[1], parentNodes[1])

    accessSelectionState().merge({ selectedEntities: [nodes[0].entity] })

    command = {
      type: EditorCommands.GROUP,
      affectedNodes: nodes
    }
  })

  describe('prepare function', async () => {
    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      GroupCommand.prepare(command)
      const selection = accessSelectionState().selectedEntities.value

      assert(command.undo)
      assert.equal(command.undo.selection.length, selection.length)
      command.undo.selection.forEach((entity) => {
        assert(selection.includes(entity))
      })

      command.affectedNodes.reverse()

      command.undo.parents.forEach((parent, i) => {
        assert.equal(parent.entity, command.affectedNodes[i].parentEntity)
      })

      command.undo.befores.forEach((before, i) => {
        assert(before.parentEntity)
        const parent = Engine.instance.currentWorld.entityTree.entityNodeMap.get(before.parentEntity)
        assert.equal(
          parent?.children?.indexOf(before.entity),
          parent?.children?.indexOf(command.affectedNodes[i].entity)! + 1
        )
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      GroupCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventBefore function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      GroupCommand.emitEventBefore?.(command)
      assert.equal(beforeSelectionChangeCounter, selectionState.beforeSelectionChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      GroupCommand.emitEventBefore?.(command)
      assert.equal(beforeSelectionChangeCounter + 1, selectionState.beforeSelectionChangeCounter.value)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      GroupCommand.emitEventAfter?.(command)
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      GroupCommand.emitEventAfter?.(command)
      assert.equal(sceneGraphChangeCounter + 1, selectionState.sceneGraphChangeCounter.value)
    })
  })

  describe('execute function', async () => {
    it('duplicates objects', () => {
      GroupCommand.execute(command)

      assert(command.groupNode)
      assert(Engine.instance.currentWorld.entityTree.entityNodeMap.has(command.groupNode.entity))
      command.affectedNodes.forEach((node) => {
        assert(command.groupNode?.children?.includes(node.entity))
      })

      assert(!accessSelectionState().selectedEntities.value.includes(command.groupNode.entity))
    })

    it('will update selection', () => {
      command.updateSelection = true
      GroupCommand.execute(command)

      assert(command.groupNode)
      assert(accessSelectionState().selectedEntities.value.includes(command.groupNode.entity))
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      GroupCommand.prepare(command)
      GroupCommand.execute(command)

      GroupCommand.undo(command)

      assert(command.groupNode)
      assert(Engine.instance.currentWorld.entityTree.entityNodeMap.has(command.groupNode.entity))
      command.affectedNodes.forEach((node) => {
        assert(command.groupNode?.children?.includes(node.entity))
      })
    })

    it('will undo command', () => {
      command.keepHistory = true
      GroupCommand.prepare(command)
      GroupCommand.execute(command)

      GroupCommand.undo(command)

      assert(command.groupNode)
      assert(command.undo)
      assert(!Engine.instance.currentWorld.entityTree.entityNodeMap.has(command.groupNode.entity))

      command.affectedNodes.reverse()

      command.undo.parents.forEach((parent, i) => {
        assert.equal(parent.entity, command.affectedNodes[i].parentEntity)
      })

      command.undo.befores.forEach((before, i) => {
        assert(before.parentEntity)
        const parent = Engine.instance.currentWorld.entityTree.entityNodeMap.get(before.parentEntity)
        assert.equal(
          parent?.children?.indexOf(before.entity),
          parent?.children?.indexOf(command.affectedNodes[i].entity)! + 1
        )
      })
    })
  })

  describe('toString function', async () => {
    assert.equal(typeof GroupCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
  })
})
