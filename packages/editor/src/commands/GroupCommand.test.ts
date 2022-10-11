import assert from 'assert'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { addEntityNodeChild, createEntityNode, emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { SCENE_COMPONENT_GROUP } from '@xrengine/engine/src/scene/components/GroupComponent'
import { SCENE_COMPONENT_VISIBLE } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { ScenePrefabs } from '@xrengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '@xrengine/engine/src/transform/components/TransformComponent'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { GroupCommand, GroupCommandParams } from './GroupCommand'

describe('GroupCommand', () => {
  let command = {} as GroupCommandParams
  let nodes: EntityTreeNode[]
  let parentNodes: EntityTreeNode[]
  let beforeNodes: EntityTreeNode[]

  beforeEach(() => {
    createEngine()
    registerEditorReceptors()
    Engine.instance.store.defaultDispatchDelay = 0

    Engine.instance.currentWorld.scenePrefabRegistry.set(ScenePrefabs.group, [
      { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
      { name: SCENE_COMPONENT_VISIBLE, props: true },
      { name: SCENE_COMPONENT_GROUP, props: true }
    ])

    const rootNode = Engine.instance.currentWorld.entityTree.rootNode
    nodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]
    parentNodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]
    beforeNodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]

    addEntityNodeChild(parentNodes[0], rootNode)
    addEntityNodeChild(parentNodes[1], rootNode)
    addEntityNodeChild(nodes[0], parentNodes[0], 0)
    addEntityNodeChild(nodes[1], parentNodes[1], 0)
    addEntityNodeChild(beforeNodes[0], parentNodes[0])
    addEntityNodeChild(beforeNodes[1], parentNodes[1])

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
        assert.equal(parent.entity, (command.affectedNodes[i] as EntityTreeNode).parentEntity)
      })

      command.undo.befores.forEach((before, i) => {
        assert(before.parentEntity)
        const parent = Engine.instance.currentWorld.entityTree.entityNodeMap.get(before.parentEntity)
        assert.equal(
          parent?.children?.indexOf(before.entity),
          parent?.children?.indexOf((command.affectedNodes[i] as EntityTreeNode).entity)! + 1
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
      applyIncomingActions()
      assert.equal(beforeSelectionChangeCounter, selectionState.beforeSelectionChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      GroupCommand.emitEventBefore?.(command)
      applyIncomingActions()
      assert.equal(beforeSelectionChangeCounter + 1, selectionState.beforeSelectionChangeCounter.value)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      GroupCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      GroupCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter + 1, selectionState.sceneGraphChangeCounter.value)
    })
  })

  describe('execute function', async () => {
    it('duplicates objects', () => {
      GroupCommand.execute(command)
      applyIncomingActions()

      assert(command.groupNode)
      assert(Engine.instance.currentWorld.entityTree.entityNodeMap.has(command.groupNode.entity))
      command.affectedNodes.forEach((node: EntityTreeNode) => {
        assert(command.groupNode?.children?.includes(node.entity))
      })

      assert(!accessSelectionState().selectedEntities.value.includes(command.groupNode.entity))
    })

    it('will update selection', () => {
      command.updateSelection = true
      GroupCommand.execute(command)
      applyIncomingActions()

      assert(command.groupNode)
      assert(accessSelectionState().selectedEntities.value.includes(command.groupNode.entity))
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      GroupCommand.prepare(command)
      GroupCommand.execute(command)
      applyIncomingActions()

      GroupCommand.undo(command)
      applyIncomingActions()

      assert(command.groupNode)
      assert(Engine.instance.currentWorld.entityTree.entityNodeMap.has(command.groupNode.entity))
      command.affectedNodes.forEach((node: EntityTreeNode) => {
        assert(command.groupNode?.children?.includes(node.entity))
      })
    })

    it('will undo command', () => {
      command.keepHistory = true
      GroupCommand.prepare(command)
      GroupCommand.execute(command)
      applyIncomingActions()

      GroupCommand.undo(command)
      applyIncomingActions()

      assert(command.groupNode)
      assert(command.undo)
      assert(!Engine.instance.currentWorld.entityTree.entityNodeMap.has(command.groupNode.entity))

      command.affectedNodes.reverse()

      command.undo.parents.forEach((parent, i) => {
        assert.equal(parent.entity, (command.affectedNodes[i] as EntityTreeNode).parentEntity)
      })

      command.undo.befores.forEach((before, i) => {
        assert(before.parentEntity)
        const parent = Engine.instance.currentWorld.entityTree.entityNodeMap.get(before.parentEntity)
        assert.equal(
          parent?.children?.indexOf(before.entity),
          parent?.children?.indexOf((command.affectedNodes[i] as EntityTreeNode).entity)! + 1
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
    deregisterEditorReceptors()
  })
})
