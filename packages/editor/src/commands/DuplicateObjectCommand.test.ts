import assert from 'assert'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { addEntityNodeChild, createEntityNode, emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { setTransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { DuplicateObjectCommand, DuplicateObjectCommandParams } from './DuplicateObjectCommand'

describe('DuplicateObjectCommand', () => {
  let command = {} as DuplicateObjectCommandParams
  let nodes: EntityTreeNode[]
  let parentNodes: EntityTreeNode[]
  let beforeNodes: EntityTreeNode[]

  beforeEach(() => {
    createEngine()
    registerEditorReceptors()
    Engine.instance.store.defaultDispatchDelay = 0

    const rootNode = Engine.instance.currentWorld.entityTree.rootNode
    nodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]
    parentNodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]
    beforeNodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]

    addEntityNodeChild(nodes[0], rootNode)
    addEntityNodeChild(nodes[1], rootNode)
    addEntityNodeChild(parentNodes[0], rootNode)
    addEntityNodeChild(parentNodes[1], rootNode)
    addEntityNodeChild(beforeNodes[0], parentNodes[0])
    addEntityNodeChild(beforeNodes[1], parentNodes[1])

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
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      DuplicateObjectCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter + 1, selectionState.sceneGraphChangeCounter.value)
    })
  })

  // describe('execute function', async () => {
  //   it('duplicates objects', () => {
  //     DuplicateObjectCommand.execute(command)
  //     applyIncomingActions()

  //     assert(command.duplicatedObjects)
  //     command.duplicatedObjects.forEach((node: EntityTreeNode) => {
  //       assert(Engine.instance.currentWorld.entityTree.entityNodeMap.has(node.entity))
  //     })
  //   })

  //   it('will update selection', () => {
  //     command.updateSelection = true
  //     DuplicateObjectCommand.execute(command)
  //     applyIncomingActions()

  //     assert(command.duplicatedObjects)
  //     command.duplicatedObjects.forEach((node: EntityTreeNode) => {
  //       assert(accessSelectionState().selectedEntities.value.includes(node.entity))
  //     })
  //   })
  // })

  // describe('undo function', async () => {
  //   it('will not undo command if command does not have undo object', () => {
  //     command.keepHistory = false
  //     DuplicateObjectCommand.prepare(command)
  //     DuplicateObjectCommand.execute(command)
  //     applyIncomingActions()

  //     DuplicateObjectCommand.undo(command)
  //     applyIncomingActions()

  //     assert(command.duplicatedObjects)
  //     command.duplicatedObjects.forEach((node: EntityTreeNode) => {
  //       assert(Engine.instance.currentWorld.entityTree.entityNodeMap.has(node.entity))
  //     })
  //   })

  //   it('will undo command', () => {
  //     command.keepHistory = true
  //     DuplicateObjectCommand.prepare(command)
  //     DuplicateObjectCommand.execute(command)
  //     applyIncomingActions()

  //     DuplicateObjectCommand.undo(command)
  //     applyIncomingActions()

  //     assert(command.duplicatedObjects)
  //     command.duplicatedObjects.forEach((node: EntityTreeNode) => {
  //       assert(!Engine.instance.currentWorld.entityTree.entityNodeMap.has(node.entity))
  //     })
  //   })
  // })

  describe('toString function', async () => {
    assert.equal(typeof DuplicateObjectCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
    deregisterEditorReceptors()
  })
})
