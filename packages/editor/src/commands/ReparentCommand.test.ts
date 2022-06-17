import assert from 'assert'
import { Object3D, Quaternion, Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeInTree,
  createEntityNode,
  emptyEntityTree
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { registerPrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { ReparentCommand, ReparentCommandParams } from './ReparentCommand'

export function getRandomTransform() {
  return {
    position: new Vector3(Math.random(), Math.random(), Math.random()),
    rotation: new Quaternion(Math.random(), Math.random(), Math.random(), Math.random()),
    scale: new Vector3(Math.random(), Math.random(), Math.random())
  }
}

describe('ReparentCommand', () => {
  let command = {} as ReparentCommandParams
  let rootNode: EntityTreeNode
  let nodes: EntityTreeNode[]
  let parentNodes: EntityTreeNode[]
  let beforeNodes: EntityTreeNode[]

  beforeEach(() => {
    createEngine()
    registerEditorReceptors()
    Engine.instance.store.defaultDispatchDelay = 0
    registerPrefabs(Engine.instance.currentWorld)

    rootNode = createEntityNode(createEntity())
    nodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]
    parentNodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]
    beforeNodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]

    addEntityNodeInTree(rootNode)
    addEntityNodeInTree(parentNodes[0], rootNode)
    addEntityNodeInTree(parentNodes[1], rootNode)
    addEntityNodeInTree(nodes[0], rootNode)
    addEntityNodeInTree(nodes[1], rootNode)
    addEntityNodeInTree(beforeNodes[0], parentNodes[0])
    addEntityNodeInTree(beforeNodes[1], parentNodes[1])

    accessSelectionState().merge({ selectedEntities: [nodes[0].entity] })
    Engine.instance.currentWorld.entityTree.entityNodeMap.forEach((node) => {
      addComponent(node.entity, Object3DComponent, { value: new Object3D() })
      addComponent(node.entity, TransformComponent, getRandomTransform())
    })

    command = {
      type: EditorCommands.REPARENT,
      affectedNodes: nodes,
      parents: []
    }
  })

  describe('prepare function', async () => {
    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      ReparentCommand.prepare(command)
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
        if (before) {
          assert(before.parentEntity)
          const parent = Engine.instance.currentWorld.entityTree.entityNodeMap.get(before.parentEntity)
          assert.equal(
            parent?.children?.indexOf(before.entity),
            parent?.children?.indexOf(command.affectedNodes[i].entity)! + 1
          )
        }
      })

      command.undo.positions.forEach((position, i) => {
        assert.deepEqual(position, getComponent(command.affectedNodes[i].entity, TransformComponent).position)
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      ReparentCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventBefore function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      ReparentCommand.emitEventBefore?.(command)
      applyIncomingActions()
      assert.equal(beforeSelectionChangeCounter, selectionState.beforeSelectionChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const beforeSelectionChangeCounter = selectionState.beforeSelectionChangeCounter.value

      ReparentCommand.emitEventBefore?.(command)
      applyIncomingActions()
      assert.equal(beforeSelectionChangeCounter + 1, selectionState.beforeSelectionChangeCounter.value)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      ReparentCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      ReparentCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter + 1, selectionState.sceneGraphChangeCounter.value)
    })
  })

  describe('execute function', async () => {
    it('Reparent objects', () => {
      command.parents = [parentNodes[0]]
      command.befores = [beforeNodes[0]]
      ReparentCommand.execute(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node, i) => {
        const parent = command.parents[i] ?? command.parents[0]
        const before = command.befores ? command.befores[i] ?? command.befores[0] : undefined

        assert.equal(node.parentEntity, parent.entity)
        if (before) {
          assert(parent!.children!.indexOf(before.entity) > parent!.children!.indexOf(command.affectedNodes[i].entity)!)
        }
      })
    })

    it('will not update selection state', () => {
      command.updateSelection = false
      const oldSelection = accessSelectionState().selectedEntities.value.slice(0)
      ReparentCommand.execute(command)
      applyIncomingActions()
      const newSelection = accessSelectionState().selectedEntities.value

      assert.equal(oldSelection.length, newSelection.length)
      oldSelection.forEach((entity) => assert(newSelection.includes(entity)))
    })

    it('will update selection state', () => {
      command.updateSelection = true
      ReparentCommand.execute(command)
      applyIncomingActions()
      const selection = accessSelectionState().selectedEntities.value

      assert.equal(selection.length, command.affectedNodes.length)
      command.affectedNodes.forEach((node) => {
        assert(selection.includes(node.entity))
      })
    })

    it('will not update position', () => {
      const positions = command.affectedNodes.map((node) => {
        getComponent(node.entity, TransformComponent).position
      })

      ReparentCommand.execute(command)
      applyIncomingActions()

      assert.deepEqual(
        positions,
        command.affectedNodes.map((node) => {
          getComponent(node.entity, TransformComponent).position
        })
      )
    })

    it('will update position', () => {
      command.positions = [getRandomTransform().position]
      ReparentCommand.execute(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node) => {
        assert.deepEqual(getComponent(node.entity, TransformComponent).position, command.positions![0])
      })
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      command.parents = [parentNodes[0]]
      ReparentCommand.prepare(command)
      ReparentCommand.execute(command)
      applyIncomingActions()

      ReparentCommand.undo(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node, i) => {
        assert.equal(node.parentEntity, (command.parents[i] ?? command.parents[0]).entity)
      })
    })

    it('will undo command', () => {
      command.keepHistory = true
      command.affectedNodes = nodes

      command.parents = [parentNodes[0]]
      ReparentCommand.prepare(command)
      ReparentCommand.execute(command)
      applyIncomingActions()

      ReparentCommand.undo(command)
      applyIncomingActions()

      assert(command.undo)

      command.affectedNodes.reverse()

      command.undo.parents.forEach((parent, i) => {
        assert.equal(parent.entity, command.affectedNodes[i].parentEntity)
      })

      command.undo.befores.forEach((before, i) => {
        if (before) {
          assert(before.parentEntity)
          const parent = Engine.instance.currentWorld.entityTree.entityNodeMap.get(before.parentEntity)
          assert(parent!.children!.indexOf(before.entity) > parent?.children?.indexOf(command.affectedNodes[i].entity)!)
        }
      })
    })

    it('will not update position', () => {
      command.keepHistory = true
      command.affectedNodes = nodes
      command.parents = [parentNodes[0]]
      ReparentCommand.prepare(command)
      ReparentCommand.execute(command)
      applyIncomingActions()

      const positions = command.affectedNodes.map((node) => {
        getComponent(node.entity, TransformComponent).position
      })

      ReparentCommand.undo(command)
      applyIncomingActions()

      assert.deepEqual(
        positions,
        command.affectedNodes.map((node) => {
          getComponent(node.entity, TransformComponent).position
        })
      )
    })

    it('will update position', () => {
      command.positions = [getRandomTransform().position]
      command.keepHistory = true
      command.affectedNodes = nodes
      command.parents = [parentNodes[0]]
      ReparentCommand.prepare(command)
      ReparentCommand.execute(command)
      applyIncomingActions()

      ReparentCommand.undo(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node, i) => {
        const pos = getComponent(node.entity, TransformComponent).position
        assert.equal(pos.x, command.undo?.positions![i].x)
        assert.equal(pos.y, command.undo?.positions![i].y)
        assert.equal(pos.z, command.undo?.positions![i].z)
      })
    })
  })

  describe('toString function', async () => {
    assert.equal(typeof ReparentCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
    deregisterEditorReceptors()
  })
})
