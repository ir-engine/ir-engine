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
import { DuplicateObjectCommand, DuplicateObjectCommandParams } from './DuplicateObjectCommand'

describe('DuplicateObjectCommand', () => {
  let command = {} as DuplicateObjectCommandParams
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
    addEntityNodeInTree(nodes[0], rootNode)
    addEntityNodeInTree(nodes[1], rootNode)
    addEntityNodeInTree(parentNodes[0], rootNode)
    addEntityNodeInTree(parentNodes[1], rootNode)
    addEntityNodeInTree(beforeNodes[0], parentNodes[0])
    addEntityNodeInTree(beforeNodes[1], parentNodes[1])

    accessSelectionState().merge({ selectedEntities: [nodes[0].entity] })

    command = {
      type: EditorCommands.DUPLICATE_OBJECTS,
      affectedNodes: nodes
    }
  })

  describe('prepare function', async () => {
    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      DuplicateObjectCommand.prepare(command)
      const selection = accessSelectionState().selectedEntities.value

      assert(command.undo)
      assert.equal(command.undo.selection.length, selection.length)
      command.undo.selection.forEach((entity) => {
        assert(selection.includes(entity))
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      DuplicateObjectCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      DuplicateObjectCommand.emitEventAfter?.(command)
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      DuplicateObjectCommand.emitEventAfter?.(command)
      assert.equal(sceneGraphChangeCounter + 1, selectionState.sceneGraphChangeCounter.value)
    })
  })

  describe('execute function', async () => {
    it('duplicates objects', () => {
      DuplicateObjectCommand.execute(command)

      assert(command.duplicatedObjects)
      command.duplicatedObjects.forEach((node) => {
        assert(Engine.instance.currentWorld.entityTree.entityNodeMap.has(node.entity))
      })
    })

    it('will update selection', () => {
      command.updateSelection = true
      DuplicateObjectCommand.execute(command)

      assert(command.duplicatedObjects)
      command.duplicatedObjects.forEach((node) => {
        assert(accessSelectionState().selectedEntities.value.includes(node.entity))
      })
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      DuplicateObjectCommand.prepare(command)
      DuplicateObjectCommand.execute(command)

      DuplicateObjectCommand.undo(command)

      assert(command.duplicatedObjects)
      command.duplicatedObjects.forEach((node) => {
        assert(Engine.instance.currentWorld.entityTree.entityNodeMap.has(node.entity))
      })
    })

    it('will undo command', () => {
      command.keepHistory = true
      DuplicateObjectCommand.prepare(command)
      DuplicateObjectCommand.execute(command)

      DuplicateObjectCommand.undo(command)

      assert(command.duplicatedObjects)
      command.duplicatedObjects.forEach((node) => {
        assert(!Engine.instance.currentWorld.entityTree.entityNodeMap.has(node.entity))
      })
    })
  })

  describe('toString function', async () => {
    assert.equal(typeof DuplicateObjectCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
  })
})
