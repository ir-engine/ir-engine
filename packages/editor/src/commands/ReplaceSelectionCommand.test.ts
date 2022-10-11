import assert from 'assert'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { addEntityNodeChild, createEntityNode, emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { SelectTagComponent } from '@xrengine/engine/src/scene/components/SelectTagComponent'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { ReplaceSelectionCommand, ReplaceSelectionCommandParams } from './ReplaceSelectionCommand'

describe('ReplaceSelectionCommand', () => {
  let command = {} as ReplaceSelectionCommandParams
  let nodes: EntityTreeNode[]

  beforeEach(() => {
    createEngine()
    registerEditorReceptors()
    Engine.instance.store.defaultDispatchDelay = 0

    const rootNode = Engine.instance.currentWorld.entityTree.rootNode
    nodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]

    addEntityNodeChild(nodes[0], rootNode)
    addEntityNodeChild(nodes[1], rootNode)

    addComponent(nodes[0].entity, SelectTagComponent, {})

    accessSelectionState().merge({ selectedEntities: [nodes[0].entity] })

    command = {
      type: EditorCommands.REPLACE_SELECTION,
      affectedNodes: [nodes[1]]
    }
  })

  describe('prepare function', async () => {
    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      ReplaceSelectionCommand.prepare(command)
      const selection = accessSelectionState().selectedEntities.value

      assert(command.undo)
      assert.equal(command.undo.selection.length, selection.length)
      command.undo.selection.forEach((entity) => {
        assert(selection.includes(entity))
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      ReplaceSelectionCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventBefore function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      ReplaceSelectionCommand.emitEventBefore?.(command)
      applyIncomingActions()
      assert.equal(beforeSelectionChangeCounter, selectionState.beforeSelectionChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      ReplaceSelectionCommand.emitEventBefore?.(command)
      applyIncomingActions()
      assert.equal(beforeSelectionChangeCounter + 1, selectionState.beforeSelectionChangeCounter.value)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      ReplaceSelectionCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      ReplaceSelectionCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert(true)
    })
  })

  describe('execute function', async () => {
    it('Replaces objects to selection', () => {
      command.affectedNodes = nodes
      ReplaceSelectionCommand.execute(command)
      applyIncomingActions()
      const selection = accessSelectionState().selectedEntities.value

      assert.equal(selection.length, command.affectedNodes.length)

      command.affectedNodes.forEach((node: EntityTreeNode, i) => {
        assert.equal(selection[i], node.entity)
        assert(hasComponent(node.entity, SelectTagComponent))
      })
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      ReplaceSelectionCommand.prepare(command)
      ReplaceSelectionCommand.execute(command)
      applyIncomingActions()
      const selection = accessSelectionState().selectedEntities.value

      ReplaceSelectionCommand.undo(command)
      applyIncomingActions()

      assert.equal(selection.length, command.affectedNodes.length)

      command.affectedNodes.forEach((node: EntityTreeNode, i) => {
        assert.equal(selection[i], node.entity)
        assert(hasComponent(node.entity, SelectTagComponent))
      })
    })

    it('will undo command', () => {
      command.keepHistory = true
      ReplaceSelectionCommand.prepare(command)
      ReplaceSelectionCommand.execute(command)
      applyIncomingActions()

      ReplaceSelectionCommand.undo(command)
      applyIncomingActions()

      const selection = accessSelectionState().selectedEntities.value
      assert.equal(selection.length, command.undo?.selection.length)
      command.undo?.selection.forEach((entity, i) => {
        if (typeof entity === 'string') return
        assert.equal(selection[i], entity)
        assert(hasComponent(entity as Entity, SelectTagComponent))
      })
    })
  })

  describe('toString function', async () => {
    assert.equal(typeof ReplaceSelectionCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
    deregisterEditorReceptors()
  })
})
