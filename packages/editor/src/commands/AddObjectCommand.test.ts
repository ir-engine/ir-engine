import assert from 'assert'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeInTree,
  createEntityNode,
  emptyEntityTree
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { registerPrefabs, ScenePrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'

import EditorCommands from '../constants/EditorCommands'
import { accessEditorState } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import { AddObjectCommand, AddObjectCommandParams } from './AddObjectCommand'

describe('AddObjectCommand', () => {
  let command = {} as AddObjectCommandParams
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
    addEntityNodeInTree(beforeNodes[0], parentNodes[0])
    addEntityNodeInTree(beforeNodes[1], parentNodes[1])

    SelectionAction.updateSelection([beforeNodes[0].entity])

    command = {
      type: EditorCommands.ADD_OBJECTS,
      affectedNodes: nodes
    }
  })

  describe('prepare function', async () => {
    it('sets "useUniqueName" to true if it is not defined', () => {
      AddObjectCommand.prepare(command)

      assert.equal(command.useUniqueName, true)
    })

    it('does not set "useUniqueName", if it is passed in the command', () => {
      command.useUniqueName = false
      AddObjectCommand.prepare(command)

      assert.equal(command.useUniqueName, false)
    })

    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      AddObjectCommand.prepare(command)
      const selection = accessSelectionState().selectedEntities.value

      assert(command.undo)
      assert.equal(command.undo.selection.length, selection.length)
      command.undo.selection.forEach((entity) => {
        assert(selection.includes(entity))
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      AddObjectCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventBefore function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      AddObjectCommand.emitEventBefore?.(command)
      assert.equal(beforeSelectionChangeCounter, selectionState.beforeSelectionChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      AddObjectCommand.emitEventBefore?.(command)
      assert.equal(beforeSelectionChangeCounter + 1, selectionState.beforeSelectionChangeCounter.value)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      AddObjectCommand.emitEventAfter?.(command)
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      AddObjectCommand.emitEventAfter?.(command)
      assert.equal(sceneGraphChangeCounter + 1, selectionState.sceneGraphChangeCounter.value)
      assert.equal(accessEditorState().sceneModified.value, true)
    })
  })

  describe('execute function', async () => {
    it('creates prefab of given type', () => {
      command.prefabTypes = [ScenePrefabs.previewCamera]
      AddObjectCommand.execute(command)
      assert(Engine.instance.currentWorld.entityTree.entityNodeMap.get(command.affectedNodes[0].entity))
    })

    it('creates prefab of given type and adds as child of passed parent node', () => {
      command.prefabTypes = [ScenePrefabs.pointLight]
      command.parents = parentNodes
      AddObjectCommand.execute(command)
      assert.notEqual(nodes.length, 0)
      assert.notEqual(parentNodes.length, 0)
      assert.notEqual(beforeNodes.length, 0)

      nodes.forEach((node, index) => {
        assert(Engine.instance.currentWorld.entityTree.entityNodeMap.get(node.entity))
        assert.equal(node.parentEntity, parentNodes[index].entity)
      })
    })

    it('places created prefab before passed objects', () => {
      command.prefabTypes = [ScenePrefabs.pointLight]
      command.parents = parentNodes
      command.befores = beforeNodes

      AddObjectCommand.execute(command)

      assert.notEqual(nodes.length, 0)
      assert.notEqual(parentNodes.length, 0)
      assert.notEqual(beforeNodes.length, 0)

      nodes.forEach((node, index) => {
        assert(Engine.instance.currentWorld.entityTree.entityNodeMap.get(node.entity))
        assert.equal(node.parentEntity, beforeNodes[index].parentEntity)
      })
    })

    it('creates unique name for each newly created objects', () => {
      command.prefabTypes = [ScenePrefabs.pointLight]
      command.parents = parentNodes
      command.befores = beforeNodes
      command.useUniqueName = true

      AddObjectCommand.execute(command)

      assert.notEqual(nodes.length, 0)
      assert.notEqual(parentNodes.length, 0)
      assert.notEqual(beforeNodes.length, 0)

      assert.equal(getComponent(nodes[0].entity, NameComponent)?.name, ScenePrefabs.pointLight)
      assert.equal(getComponent(nodes[1].entity, NameComponent)?.name, ScenePrefabs.pointLight + ' 2')
    })

    it('updates selection', () => {
      command.prefabTypes = [ScenePrefabs.pointLight]
      command.useUniqueName = true
      command.updateSelection = true

      AddObjectCommand.execute(command)

      assert.notEqual(nodes.length, 0)
      assert.notEqual(parentNodes.length, 0)
      assert.notEqual(beforeNodes.length, 0)

      command.affectedNodes.forEach((node) => {
        assert(accessSelectionState().selectedEntities.value.includes(node.entity))
      })
    })

    it('will create node from provided scenedata', () => {
      addEntityNodeInTree(nodes[1], nodes[0])
      command.sceneData = [
        {
          entities: {
            [nodes[0].uuid]: {
              name: 'Test Entity',
              components: [{ name: 'Preview Camera', props: {} }]
            },
            [nodes[1].uuid]: {
              name: 'Test Entity',
              components: [{ name: 'Point Light', props: {} }],
              parent: nodes[0].uuid
            }
          },
          root: nodes[0].uuid,
          version: 1
        }
      ]
      command.affectedNodes = [nodes[0]]

      AddObjectCommand.execute(command)
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      command.prefabTypes = [ScenePrefabs.pointLight]
      AddObjectCommand.prepare(command)
      AddObjectCommand.execute(command)

      AddObjectCommand.undo(command)

      command.affectedNodes.forEach((node) => {
        assert(Engine.instance.currentWorld.entityTree.entityNodeMap.has(node.entity))
      })
    })

    it('will undo command', () => {
      command.keepHistory = true
      command.prefabTypes = [ScenePrefabs.pointLight]
      AddObjectCommand.prepare(command)
      AddObjectCommand.execute(command)

      AddObjectCommand.undo(command)

      command.affectedNodes.forEach((node) => {
        assert(!Engine.instance.currentWorld.entityTree.entityNodeMap.has(node.entity))
      })
    })
  })

  describe('toString function', async () => {
    assert.equal(typeof AddObjectCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
  })
})
