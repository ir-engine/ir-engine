import assert from 'assert'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { addEntityNodeChild, createEntityNode, emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { accessEditorState } from '../services/EditorServices'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import { RemoveObjectCommand, RemoveObjectCommandParams } from './RemoveObjectsCommand'

describe('RemoveObjectCommand', () => {
  let command = {} as RemoveObjectCommandParams
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

    addEntityNodeChild(nodes[0], parentNodes[0])
    addEntityNodeChild(nodes[1], parentNodes[1])
    addEntityNodeChild(parentNodes[0], rootNode)
    addEntityNodeChild(parentNodes[1], rootNode)
    addEntityNodeChild(beforeNodes[0], parentNodes[0])
    addEntityNodeChild(beforeNodes[1], parentNodes[1])

    SelectionAction.updateSelection({ selectedEntities: [beforeNodes[0].entity, nodes[0].entity, nodes[1].entity] })

    command = {
      type: EditorCommands.REMOVE_OBJECTS,
      affectedNodes: nodes
    }
  })

  describe('prepare function', async () => {
    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      RemoveObjectCommand.prepare(command)

      assert(command.undo)
      assert.equal(command.undo.parents.length, command.affectedNodes.length)
      assert.equal(command.undo.befores.length, command.affectedNodes.length)
      assert.equal(command.undo.components.length, command.affectedNodes.length)

      command.affectedNodes.reverse()

      command.undo.parents.forEach((parent: EntityTreeNode, i) => {
        assert.equal(parent.entity, (command.affectedNodes[i] as EntityTreeNode).parentEntity)
      })

      command.undo.befores.forEach((before: EntityTreeNode, i) => {
        assert(before.parentEntity)
        const parent = Engine.instance.currentWorld.entityTree.entityNodeMap.get(before.parentEntity)
        assert.equal(
          parent?.children?.indexOf(before.entity),
          parent?.children?.indexOf((command.affectedNodes[i] as EntityTreeNode).entity)! + 1
        )
      })

      command.undo.components.forEach((components, i) => {
        assert.deepEqual(components, serializeWorld(command.affectedNodes[i] as EntityTreeNode))
      })
    })

    it('creates "undo" object if history is enabled but not serialize components', () => {
      command.keepHistory = true
      command.skipSerialization = true
      RemoveObjectCommand.prepare(command)

      assert(command.undo)
      assert.equal(command.undo.parents.length, command.affectedNodes.length)
      assert.equal(command.undo.befores.length, command.affectedNodes.length)
      assert.equal(command.undo.components.length, 0)
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      RemoveObjectCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      RemoveObjectCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      RemoveObjectCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter + 1, selectionState.sceneGraphChangeCounter.value)
      assert.equal(accessEditorState().sceneModified.value, true)
    })
  })

  describe('execute function', async () => {
    it('Removes given nodes', () => {
      RemoveObjectCommand.execute(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node: EntityTreeNode) => {
        assert(!Engine.instance.currentWorld.entityTree.entityNodeMap.get(node.entity))
        assert(!Engine.instance.currentWorld.entityTree.uuidNodeMap.get(node.uuid))

        const parent = Engine.instance.currentWorld.entityTree.entityNodeMap.get(node.parentEntity!)
        assert(parent && parent.children)
        assert(!parent.children.includes(node.entity))
      })
    })

    it('will not remove root node', () => {
      command.affectedNodes = [Engine.instance.currentWorld.entityTree.rootNode]
      RemoveObjectCommand.execute(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node: EntityTreeNode) => {
        assert(Engine.instance.currentWorld.entityTree.entityNodeMap.get(node.entity))
        assert(Engine.instance.currentWorld.entityTree.uuidNodeMap.get(node.uuid))
      })
    })

    it('will not update selection state', () => {
      command.updateSelection = false
      const oldSelection = accessSelectionState().selectedEntities.value.slice(0)
      RemoveObjectCommand.execute(command)
      applyIncomingActions()
      const newSelection = accessSelectionState().selectedEntities.value

      assert.equal(oldSelection.length, newSelection.length)
      assert.deepEqual(oldSelection, newSelection)
    })

    // it('will update selection state', () => {
    //   command.updateSelection = true
    //   RemoveObjectCommand.execute(command)
    //   applyIncomingActions()
    //   const selection = accessSelectionState().selectedEntities.value

    //   command.affectedNodes.forEach((node: EntityTreeNode) => {
    //     assert(!selection.includes(node.entity))
    //   })
    // })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      RemoveObjectCommand.prepare(command)
      RemoveObjectCommand.execute(command)
      applyIncomingActions()

      RemoveObjectCommand.undo(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node: EntityTreeNode) => {
        assert(!Engine.instance.currentWorld.entityTree.entityNodeMap.has(node.entity))
      })
    })

    // it('will undo command', () => {
    //   command.keepHistory = true
    //   RemoveObjectCommand.prepare(command)
    //   RemoveObjectCommand.execute(command)
    //   applyIncomingActions()

    //   RemoveObjectCommand.undo(command)
    //   applyIncomingActions()

    //   command.affectedNodes.forEach((node: EntityTreeNode) => {
    //     assert(Engine.instance.currentWorld.entityTree.entityNodeMap.has(node.entity))
    //   })

    //   const selection = accessSelectionState().selectedEntities.value

    //   command.affectedNodes.forEach((node: EntityTreeNode) => {
    //     assert(selection.includes(node.entity))
    //   })
    // })
  })

  describe('toString function', async () => {
    assert.equal(typeof RemoveObjectCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
    deregisterEditorReceptors()
  })
})
