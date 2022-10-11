import assert from 'assert'
import { Euler, Object3D, Quaternion } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { addEntityNodeChild, createEntityNode, emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { addObjectToGroup, GroupComponent } from '@xrengine/engine/src/scene/components/GroupComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { setTransformComponent, TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { getRandomTransform } from './ReparentCommand.test'
import { RotationCommand, RotationCommandParams } from './RotationCommand'

function getRandomEuler() {
  return new Euler(Math.random(), Math.random(), Math.random())
}

describe('RotationCommand', () => {
  let command = {} as RotationCommandParams
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

    nodes.forEach((node: EntityTreeNode) => {
      const obj3d = new Object3D()
      addObjectToGroup(node.entity, obj3d)
      const transform = getRandomTransform()
      setTransformComponent(node.entity, transform.position, transform.rotation, transform.scale)
    })

    command = {
      type: EditorCommands.ROTATION,
      affectedNodes: [nodes[1]],
      rotations: []
    }
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      RotationCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      RotationCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert(true)
    })
  })

  describe('shouldUpdate function', async () => {
    it('will return false if space is different', () => {
      command.space = TransformSpace.LocalSelection
      const newCommand = {
        type: EditorCommands.ROTATION,
        affectedNodes: [nodes[1]],
        rotations: []
      }

      assert(!RotationCommand.shouldUpdate?.(command, newCommand))
    })

    it('will return false if nodes are different', () => {
      command.space = TransformSpace.LocalSelection
      const newCommand = {
        type: EditorCommands.ROTATION,
        affectedNodes: [nodes[0]],
        rotations: [],
        space: TransformSpace.LocalSelection
      }

      assert(!RotationCommand.shouldUpdate?.(command, newCommand))
    })

    it('will return true if nodes and space are same', () => {
      command.space = TransformSpace.LocalSelection
      const newCommand = {
        type: EditorCommands.ROTATION,
        affectedNodes: [nodes[1]],
        rotations: [],
        space: TransformSpace.LocalSelection
      }

      assert(RotationCommand.shouldUpdate?.(command, newCommand))
    })
  })

  describe('update function', async () => {
    it('will update command when override scale is true', () => {
      command.space = TransformSpace.LocalSelection
      command.rotations = [getRandomEuler()]
      const newCommand = {
        type: EditorCommands.ROTATION,
        affectedNodes: [nodes[1]],
        rotations: [getRandomEuler()]
      }

      RotationCommand.update?.(command, newCommand)
      applyIncomingActions()

      assert.deepEqual(command.rotations, newCommand.rotations)
    })
  })

  describe('execute function', async () => {
    // it('will execute command for local space', () => {
    //   command.space = TransformSpace.Local
    //   command.rotations = [getRandomEuler()]
    //   RotationCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     const rotation = new Quaternion().setFromEuler(command.rotations[i] ?? command.rotations[0])
    //     assert(getComponent(node.entity, TransformComponent).rotation.equals(rotation))
    //   })
    // })
    // it('will execute command for world space', () => {
    //   command.space = TransformSpace.World
    //   command.rotations = [getRandomEuler()]
    //   RotationCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     const rotation = new Quaternion().setFromEuler(command.rotations[i] ?? command.rotations[0])
    //     assert(getComponent(node.entity, TransformComponent).rotation.equals(rotation))
    //   })
    // })
    // it('will execute command for Local selection space', () => {
    //   command.space = TransformSpace.LocalSelection
    //   command.rotations = [getRandomEuler()]
    //   RotationCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     const rotation = new Quaternion().setFromEuler(command.rotations[i] ?? command.rotations[0])
    //     assert(getComponent(node.entity, TransformComponent).rotation.equals(rotation))
    //   })
    // })
  })

  // describe('undo function', async () => {
  //   it('will not undo command if command does not have undo object', () => {
  //     command.space = TransformSpace.Local
  //     command.rotations = [getRandomEuler()]

  //     RotationCommand.prepare(command)
  //     RotationCommand.execute(command)
  //     applyIncomingActions()
  //     RotationCommand.undo(command)
  //     applyIncomingActions()
  //     command.affectedNodes.forEach((node: EntityTreeNode, i) => {
  //       const rotation = new Quaternion().setFromEuler(command.rotations[i] ?? command.rotations[0])
  //       assert(getComponent(node.entity, TransformComponent).rotation.equals(rotation))
  //     })
  //   })

  //   it('will undo command', () => {
  //     command.space = TransformSpace.LocalSelection
  //     command.keepHistory = true
  //     command.rotations = [getRandomEuler()]

  //     RotationCommand.prepare(command)
  //     RotationCommand.execute(command)
  //     applyIncomingActions()
  //     RotationCommand.undo(command)
  //     applyIncomingActions()
  //     command.affectedNodes.forEach((node: EntityTreeNode, i) => {
  //       const rotation = new Quaternion().setFromEuler(command.undo?.rotations[i] ?? new Euler())
  //       assert(getComponent(node.entity, TransformComponent).rotation.equals(rotation))
  //     })
  //   })
  // })

  describe('toString function', async () => {
    assert.equal(typeof RotationCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
    deregisterEditorReceptors()
  })
})
