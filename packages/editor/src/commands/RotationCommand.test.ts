import assert from 'assert'
import { Euler, Object3D, Quaternion } from 'three'

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
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { registerPrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import EditorCommands from '../constants/EditorCommands'
import { accessSelectionState } from '../services/SelectionServices'
import { getRandomTransform } from './ReparentCommand.test'
import { RotationCommand, RotationCommandParams } from './RotationCommand'

function getRandomEuler() {
  return new Euler(Math.random(), Math.random(), Math.random())
}

describe('RotationCommand', () => {
  let command = {} as RotationCommandParams
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

    accessSelectionState().merge({ selectedEntities: [nodes[0].entity] })

    nodes.forEach((node) => {
      const obj3d = new Object3D()
      const transform = getRandomTransform()
      obj3d.quaternion.copy(transform.rotation)
      Engine.instance.currentWorld.scene.add(obj3d)
      addComponent(node.entity, TransformComponent, transform)
      addComponent(node.entity, Object3DComponent, { value: obj3d })
    })

    command = {
      type: EditorCommands.ROTATION,
      affectedNodes: [nodes[1]],
      rotations: []
    }
  })

  describe('prepare function', async () => {
    it('sets space to local space if it is not passed', () => {
      RotationCommand.prepare(command)

      assert.equal(command.space, TransformSpace.Local)
    })

    it('will not set space to local space if it is passed', () => {
      command.space = TransformSpace.LocalSelection
      RotationCommand.prepare(command)
      assert.equal(command.space, TransformSpace.LocalSelection)
    })

    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      command.rotations = [getRandomEuler()]
      RotationCommand.prepare(command)

      assert(command.undo)
      command.undo.rotations.forEach((roatiaon, i) => {
        assert.equal(command.undo?.space, TransformSpace.Local)
        assert(roatiaon.equals(getComponent(command.affectedNodes[i].entity, Object3DComponent).value.rotation))
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      RotationCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      RotationCommand.emitEventAfter?.(command)
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      RotationCommand.emitEventAfter?.(command)
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

      assert.deepEqual(command.rotations, newCommand.rotations)
    })
  })

  describe('execute function', async () => {
    it('will execute command for local space', () => {
      command.space = TransformSpace.Local
      command.rotations = [getRandomEuler()]

      RotationCommand.execute(command)
      command.affectedNodes.forEach((node, i) => {
        const rotation = new Quaternion().setFromEuler(command.rotations[i] ?? command.rotations[0])
        assert(getComponent(node.entity, TransformComponent).rotation.equals(rotation))
      })
    })

    it('will execute command for world space', () => {
      command.space = TransformSpace.World
      command.rotations = [getRandomEuler()]

      RotationCommand.execute(command)
      command.affectedNodes.forEach((node, i) => {
        const rotation = new Quaternion().setFromEuler(command.rotations[i] ?? command.rotations[0])
        assert(getComponent(node.entity, TransformComponent).rotation.equals(rotation))
      })
    })

    it('will execute command for Local selection space', () => {
      command.space = TransformSpace.LocalSelection
      command.rotations = [getRandomEuler()]

      RotationCommand.execute(command)
      command.affectedNodes.forEach((node, i) => {
        const rotation = new Quaternion().setFromEuler(command.rotations[i] ?? command.rotations[0])
        assert(getComponent(node.entity, TransformComponent).rotation.equals(rotation))
      })
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.space = TransformSpace.Local
      command.rotations = [getRandomEuler()]

      RotationCommand.prepare(command)
      RotationCommand.execute(command)
      RotationCommand.undo(command)
      command.affectedNodes.forEach((node, i) => {
        const rotation = new Quaternion().setFromEuler(command.rotations[i] ?? command.rotations[0])
        assert(getComponent(node.entity, TransformComponent).rotation.equals(rotation))
      })
    })

    it('will undo command', () => {
      command.space = TransformSpace.LocalSelection
      command.keepHistory = true
      command.rotations = [getRandomEuler()]

      RotationCommand.prepare(command)
      RotationCommand.execute(command)
      RotationCommand.undo(command)
      command.affectedNodes.forEach((node, i) => {
        const rotation = new Quaternion().setFromEuler(command.undo?.rotations[i] ?? new Euler())
        assert(getComponent(node.entity, TransformComponent).rotation.equals(rotation))
      })
    })
  })

  describe('toString function', async () => {
    assert.equal(typeof RotationCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
  })
})
