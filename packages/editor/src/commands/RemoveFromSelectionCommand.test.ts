import assert from 'assert'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { addComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeInTree,
  createEntityNode,
  emptyEntityTree
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'
import { registerPrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'

import EditorCommands from '../constants/EditorCommands'
import { accessSelectionState } from '../services/SelectionServices'
import { RemoveFromSelectionCommand, RemoveFromSelectionCommandParams } from './RemoveFromSelectionCommand'

describe('RemoveFromSelectionCommand', () => {
  let command = {} as RemoveFromSelectionCommandParams
  let rootNode: EntityTreeNode
  let nodes: EntityTreeNode[]

  beforeEach(() => {
    createEngine()
    registerPrefabs(Engine.instance.currentWorld)

    rootNode = createEntityNode(createEntity())
    nodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]

    addEntityNodeInTree(rootNode)
    addEntityNodeInTree(nodes[0], rootNode)
    addEntityNodeInTree(nodes[1], rootNode)

    addComponent(nodes[0].entity, SelectTagComponent, {})

    accessSelectionState().merge({ selectedEntities: [nodes[0].entity] })

    command = {
      type: EditorCommands.REMOVE_FROM_SELECTION,
      affectedNodes: [nodes[1]]
    }
  })

  describe('prepare function', async () => {
    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      RemoveFromSelectionCommand.prepare(command)
      const selection = accessSelectionState().selectedEntities.value

      assert(command.undo)
      assert.equal(command.undo.selection.length, selection.length)
      command.undo.selection.forEach((entity) => {
        assert(selection.includes(entity))
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      RemoveFromSelectionCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventBefore function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      RemoveFromSelectionCommand.emitEventBefore?.(command)
      assert.equal(beforeSelectionChangeCounter, selectionState.beforeSelectionChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      RemoveFromSelectionCommand.emitEventBefore?.(command)
      assert.equal(beforeSelectionChangeCounter + 1, selectionState.beforeSelectionChangeCounter.value)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      RemoveFromSelectionCommand.emitEventAfter?.(command)
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      RemoveFromSelectionCommand.emitEventAfter?.(command)
      assert(true)
    })
  })

  describe('execute function', async () => {
    it('removes objects to selection', () => {
      command.affectedNodes = nodes
      RemoveFromSelectionCommand.execute(command)
      command.affectedNodes.forEach((node) => {
        assert(!accessSelectionState().selectedEntities.value.includes(node.entity))
        assert(!hasComponent(node.entity, SelectTagComponent))
      })
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      RemoveFromSelectionCommand.prepare(command)
      RemoveFromSelectionCommand.execute(command)
      const selection = accessSelectionState().selectedEntities.value

      RemoveFromSelectionCommand.undo(command)

      assert.deepEqual(selection, accessSelectionState().selectedEntities.value)
    })

    it('will undo command', () => {
      command.keepHistory = true
      RemoveFromSelectionCommand.prepare(command)
      RemoveFromSelectionCommand.execute(command)

      RemoveFromSelectionCommand.undo(command)

      command.undo?.selection.forEach((entity) => {
        assert(accessSelectionState().selectedEntities.value.includes(entity))
        assert(hasComponent(entity, SelectTagComponent))
      })
    })
  })

  describe('toString function', async () => {
    assert.equal(typeof RemoveFromSelectionCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
  })
})
