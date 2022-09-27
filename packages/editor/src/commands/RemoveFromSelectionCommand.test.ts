import assert from 'assert'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
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
import { RemoveFromSelectionCommand, RemoveFromSelectionCommandParams } from './RemoveFromSelectionCommand'

describe('RemoveFromSelectionCommand', () => {
  let command = {} as RemoveFromSelectionCommandParams
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
      applyIncomingActions()
      assert.equal(beforeSelectionChangeCounter, selectionState.beforeSelectionChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      RemoveFromSelectionCommand.emitEventBefore?.(command)
      applyIncomingActions()
      assert.equal(beforeSelectionChangeCounter + 1, selectionState.beforeSelectionChangeCounter.value)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      RemoveFromSelectionCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      RemoveFromSelectionCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert(true)
    })
  })

  describe('execute function', async () => {
    it('removes objects to selection', () => {
      command.affectedNodes = nodes
      RemoveFromSelectionCommand.execute(command)
      applyIncomingActions()
      command.affectedNodes.forEach((node: EntityTreeNode) => {
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
      applyIncomingActions()
      const selection = accessSelectionState().selectedEntities.value

      RemoveFromSelectionCommand.undo(command)
      applyIncomingActions()

      assert.deepEqual(selection, accessSelectionState().selectedEntities.value)
    })

    it('will undo command', () => {
      command.keepHistory = true
      RemoveFromSelectionCommand.prepare(command)
      RemoveFromSelectionCommand.execute(command)
      applyIncomingActions()

      RemoveFromSelectionCommand.undo(command)
      applyIncomingActions()

      command.undo?.selection.forEach((entity) => {
        assert(accessSelectionState().selectedEntities.value.includes(entity))
        if (typeof entity === 'string') return
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
    deregisterEditorReceptors()
  })
})
