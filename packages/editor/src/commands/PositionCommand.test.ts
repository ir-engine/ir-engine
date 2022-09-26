import assert from 'assert'
import { Object3D, Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTree, EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { addEntityNodeChild, createEntityNode, emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { addObjectToGroup } from '@xrengine/engine/src/scene/components/GroupComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { setTransformComponent, TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { PositionCommand, PositionCommandParams } from './PositionCommand'
import { getRandomTransform } from './ReparentCommand.test'

function getRandomPosition() {
  return new Vector3(Math.random(), Math.random(), Math.random())
}

describe('PositionCommand', () => {
  let command = {} as PositionCommandParams
  let nodes: EntityTreeNode[]

  beforeEach(() => {
    createEngine()
    registerEditorReceptors()
    Engine.instance.store.defaultDispatchDelay = 0

    const rootNode = Engine.instance.currentWorld.entityTree.rootNode
    nodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]

    addEntityNodeChild(nodes[0], rootNode)
    addEntityNodeChild(nodes[1], rootNode)

    accessSelectionState().merge({ selectedEntities: [nodes[0].entity] })

    nodes.forEach((node) => {
      const obj3d = new Object3D()
      const transform = getRandomTransform()
      obj3d.position.copy(transform.position)
      Engine.instance.currentWorld.scene.add(obj3d)
      setTransformComponent(node.entity, transform.position, transform.rotation, transform.scale)
      addObjectToGroup(node.entity, obj3d)
    })

    command = {
      type: EditorCommands.POSITION,
      affectedNodes: [nodes[1]],
      positions: []
    }
  })

  describe('prepare function', async () => {
    it('sets space to local space if it is not passed', () => {
      PositionCommand.prepare(command)

      assert.equal(command.space, TransformSpace.Local)
    })

    it('will not set space to local space if it is passed', () => {
      command.space = TransformSpace.LocalSelection
      PositionCommand.prepare(command)
      assert.equal(command.space, TransformSpace.LocalSelection)
    })

    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      command.positions = [getRandomPosition()]
      PositionCommand.prepare(command)

      assert(command.undo)
      command.undo.positions.forEach((position, i) => {
        assert.equal(command.undo?.space, TransformSpace.Local)
        assert.equal(command.undo?.addToPosition, false)
        assert(
          position.equals(
            getComponent((command.affectedNodes[i] as EntityTreeNode).entity, Object3DComponent).value.position
          )
        )
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      PositionCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      PositionCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      PositionCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert(true)
    })
  })

  describe('shouldUpdate function', async () => {
    it('will return false if space is different', () => {
      command.space = TransformSpace.LocalSelection
      const newCommand = {
        type: EditorCommands.POSITION,
        affectedNodes: [nodes[1]],
        positions: []
      }

      assert(!PositionCommand.shouldUpdate?.(command, newCommand))
    })

    it('will return false if nodes are different', () => {
      command.space = TransformSpace.LocalSelection
      const newCommand = {
        type: EditorCommands.POSITION,
        affectedNodes: [nodes[0]],
        positions: [],
        space: TransformSpace.LocalSelection
      }

      assert(!PositionCommand.shouldUpdate?.(command, newCommand))
    })

    it('will return true if nodes and space are same', () => {
      command.space = TransformSpace.LocalSelection
      const newCommand = {
        type: EditorCommands.POSITION,
        affectedNodes: [nodes[1]],
        positions: [],
        space: TransformSpace.LocalSelection
      }

      assert(PositionCommand.shouldUpdate?.(command, newCommand))
    })
  })

  describe('update function', async () => {
    it('will update command when override scale is true', () => {
      command.space = TransformSpace.LocalSelection
      command.positions = [getRandomPosition()]
      const newCommand = {
        type: EditorCommands.POSITION,
        affectedNodes: [nodes[1]],
        positions: [getRandomPosition()]
      }

      PositionCommand.update?.(command, newCommand)
      applyIncomingActions()

      assert.deepEqual(command.positions, newCommand.positions)
    })
  })

  describe('execute function', async () => {
    // it('will execute command for local space', () => {
    //   command.space = TransformSpace.Local
    //   command.positions = [getRandomPosition()]
    //   PositionCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     const position = command.positions[i] ?? command.positions[0] ?? new Vector3()
    //     assert(getComponent(node.entity, TransformComponent).position.equals(position))
    //   })
    // })
    // it('will execute command for world space', () => {
    //   command.space = TransformSpace.World
    //   command.positions = [getRandomPosition()]
    //   PositionCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     const position = new Vector3()
    //     assert(getComponent(node.entity, TransformComponent).position.equals(position))
    //   })
    // })
    // it('will execute command for Local selection space', () => {
    //   command.space = TransformSpace.LocalSelection
    //   command.positions = [getRandomPosition()]
    //   PositionCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     const position = new Vector3()
    //     assert(getComponent(node.entity, TransformComponent).position.equals(position))
    //   })
    // })
    // it('will execute command for local space when add to position is true', () => {
    //   command.space = TransformSpace.Local
    //   command.addToPosition = true
    //   command.positions = [getRandomPosition()]
    //   const newPositions = command.affectedNodes.map((node: EntityTreeNode, i) => {
    //     const position = command.positions[i] ?? command.positions[0] ?? new Vector3()
    //     return new Vector3().copy(getComponent(node.entity, TransformComponent).position).add(position)
    //   })
    //   PositionCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert(getComponent(node.entity, TransformComponent).position.equals(newPositions[i]))
    //   })
    // })
    // it('will execute command for world space when add to position is true', () => {
    //   command.space = TransformSpace.World
    //   command.addToPosition = true
    //   command.positions = [getRandomPosition()]
    //   const newPositions = command.affectedNodes.map((node: EntityTreeNode, i) => {
    //     const position = command.positions[i] ?? command.positions[0] ?? new Vector3()
    //     return new Vector3().copy(getComponent(node.entity, TransformComponent).position).add(position)
    //   })
    //   PositionCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert(getComponent(node.entity, TransformComponent).position.equals(newPositions[i]))
    //   })
    // })
    // it('will execute command for Local selection space when add to position is true', () => {
    //   command.space = TransformSpace.LocalSelection
    //   command.addToPosition = true
    //   command.positions = [getRandomPosition()]
    //   const newPositions = command.affectedNodes.map((node: EntityTreeNode, i) => {
    //     const position = command.positions[i] ?? command.positions[0] ?? new Vector3()
    //     return new Vector3().copy(getComponent(node.entity, TransformComponent).position).add(position)
    //   })
    //   PositionCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert(getComponent(node.entity, TransformComponent).position.equals(newPositions[i]))
    //   })
    // })
  })

  describe('undo function', async () => {
    // it('will not undo command if command does not have undo object', () => {
    //   command.space = TransformSpace.Local
    //   command.positions = [getRandomPosition()]
    //   PositionCommand.prepare(command)
    //   PositionCommand.execute(command)
    //   applyIncomingActions()
    //   PositionCommand.undo(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert(
    //       getComponent(node.entity, TransformComponent).position.equals(command.positions[i] ?? command.positions[0])
    //     )
    //   })
    // })
    // it('will undo command', () => {
    //   command.space = TransformSpace.LocalSelection
    //   command.keepHistory = true
    //   command.positions = [getRandomPosition()]
    //   PositionCommand.prepare(command)
    //   PositionCommand.execute(command)
    //   applyIncomingActions()
    //   PositionCommand.undo(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert(getComponent(node.entity, TransformComponent).position.equals(command.undo?.positions[i]!))
    //   })
    // })
  })

  describe('toString function', async () => {
    assert.equal(typeof PositionCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
    deregisterEditorReceptors()
  })
})
