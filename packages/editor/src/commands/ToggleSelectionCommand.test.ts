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
import { ToggleSelectionCommand, ToggleSelectionCommandParams } from './ToggleSelectionCommand'

describe('ToggleSelectionCommand', () => {
  let command = {} as ToggleSelectionCommandParams
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
      type: EditorCommands.TOGGLE_SELECTION,
      affectedNodes: [nodes[1]]
    }
  })

  describe('prepare function', async () => {
    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      ToggleSelectionCommand.prepare(command)
      const selection = accessSelectionState().selectedEntities.value

      assert(command.undo)
      assert.equal(command.undo.selection.length, selection.length)
      command.undo.selection.forEach((entity) => {
        assert(selection.includes(entity))
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      ToggleSelectionCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventBefore function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      ToggleSelectionCommand.emitEventBefore?.(command)
      assert.equal(beforeSelectionChangeCounter, selectionState.beforeSelectionChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      ToggleSelectionCommand.emitEventBefore?.(command)
      assert.equal(beforeSelectionChangeCounter + 1, selectionState.beforeSelectionChangeCounter.value)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      ToggleSelectionCommand.emitEventAfter?.(command)
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      ToggleSelectionCommand.emitEventAfter?.(command)
      assert(true)
    })
  })

  describe('execute function', async () => {
    it('toggles objects in selection', () => {
      command.affectedNodes = nodes
      const oldSelection = accessSelectionState().selectedEntities.value.slice(0)
      ToggleSelectionCommand.execute(command)
      const newSelection = accessSelectionState().selectedEntities.value

      command.affectedNodes.forEach((node, i) => {
        assert.equal(oldSelection.includes(node.entity), !newSelection.includes(node.entity))
        assert.equal(newSelection.includes(node.entity), hasComponent(node.entity, SelectTagComponent))
      })
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      ToggleSelectionCommand.prepare(command)
      ToggleSelectionCommand.execute(command)

      const oldSelection = accessSelectionState().selectedEntities.value.slice(0)
      ToggleSelectionCommand.undo(command)
      const newSelection = accessSelectionState().selectedEntities.value

      command.affectedNodes.forEach((node, i) => {
        assert.equal(oldSelection.includes(node.entity), newSelection.includes(node.entity))
        assert.equal(oldSelection.includes(node.entity), hasComponent(node.entity, SelectTagComponent))
      })
    })

    it('will undo command', () => {
      command.keepHistory = true
      ToggleSelectionCommand.prepare(command)
      ToggleSelectionCommand.execute(command)

      ToggleSelectionCommand.undo(command)

      const selection = accessSelectionState().selectedEntities.value
      assert.equal(selection.length, command.undo?.selection.length)
      command.undo?.selection.forEach((entity, i) => {
        assert.equal(selection[i], entity)
        assert(hasComponent(entity, SelectTagComponent))
      })
    })
  })

  describe('toString function', async () => {
    assert.equal(typeof ToggleSelectionCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
  })
})
