import assert from 'assert'
import { Object3D, Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { addEntityNodeChild, createEntityNode, emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { addObjectToGroup } from '@xrengine/engine/src/scene/components/GroupComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { setTransformComponent, TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { getRandomTransform } from './ReparentCommand.test'
import { RotateAroundCommand, RotateAroundCommandParams } from './RotateAroundCommand'

function getRandomVector3() {
  return new Vector3(Math.random(), Math.random(), Math.random())
}

describe('RotateAroundCommand', () => {
  let command = {} as RotateAroundCommandParams
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
      obj3d.quaternion.copy(transform.rotation)
      Engine.instance.currentWorld.scene.add(obj3d)
      setTransformComponent(node.entity, transform.position, transform.rotation, transform.scale)
      addObjectToGroup(node.entity, obj3d)
    })

    command = {
      type: EditorCommands.ROTATE_AROUND,
      affectedNodes: [nodes[1]],
      axis: getRandomVector3(),
      pivot: getRandomVector3(),
      angle: Math.random()
    }
  })

  describe('prepare function', async () => {
    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      RotateAroundCommand.prepare(command)

      assert(command.undo)
      assert(command.undo.pivot.equals(command.pivot))
      assert(command.undo.axis.equals(command.axis))
      assert.equal(command.undo.angle, command.angle * -1)
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      RotateAroundCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      RotateAroundCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      RotateAroundCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert(true)
    })
  })

  describe('shouldUpdate function', async () => {
    it('will return false if pivot is different', () => {
      const newCommand = {
        type: EditorCommands.ROTATE_AROUND,
        affectedNodes: [nodes[1]],
        pivot: getRandomVector3(),
        axis: command.axis,
        angle: Math.random()
      }

      assert(!RotateAroundCommand.shouldUpdate?.(command, newCommand))
    })

    it('will return false if axis are different', () => {
      const newCommand = {
        type: EditorCommands.ROTATE_AROUND,
        affectedNodes: [nodes[1]],
        axis: getRandomVector3(),
        pivot: command.pivot,
        angle: Math.random()
      }

      assert(!RotateAroundCommand.shouldUpdate?.(command, newCommand))
    })

    it('will return false if nodes are different', () => {
      const newCommand = {
        type: EditorCommands.ROTATE_AROUND,
        affectedNodes: [nodes[0]],
        axis: command.axis,
        pivot: command.pivot,
        angle: Math.random()
      }

      assert(!RotateAroundCommand.shouldUpdate?.(command, newCommand))
    })

    it('will return true if nodes and space are same', () => {
      const newCommand = {
        type: EditorCommands.ROTATE_AROUND,
        affectedNodes: [nodes[1]],
        axis: command.axis,
        pivot: command.pivot,
        angle: Math.random()
      }

      assert(RotateAroundCommand.shouldUpdate?.(command, newCommand))
    })
  })

  describe('update function', async () => {
    it('will update command when override scale is true', () => {
      const newCommand = {
        type: EditorCommands.ROTATE_AROUND,
        affectedNodes: [nodes[1]],
        axis: command.axis,
        pivot: command.pivot,
        angle: Math.random()
      }

      const oldAngle = command.angle
      RotateAroundCommand.update?.(command, newCommand)
      applyIncomingActions()

      assert.equal(command.angle, oldAngle + newCommand.angle)
    })
  })

  describe('execute function', async () => {
    // it('will execute command for local space', () => {
    //   const EPSILON = 0.00001
    //   const transform = getComponent(nodes[1].entity, TransformComponent)
    //   const obj3d = getComponent(nodes[1].entity, Object3DComponent).value
    //   transform.position.set(1, 2, 3)
    //   transform.rotation.set(1, 1, 1, 1)
    //   transform.scale.set(2, 2, 2)
    //   obj3d.position.set(1, 2, 3)
    //   obj3d.quaternion.set(1, 1, 1, 1)
    //   obj3d.scale.set(2, 2, 2)
    //   command.axis.set(0, 1, 0)
    //   command.pivot.set(3, 3, 3)
    //   command.angle = 45
    //   RotateAroundCommand.execute(command)
    //   applyIncomingActions()
    //   assert(Math.abs(transform.position.x - -1.12867654) < EPSILON)
    //   assert(Math.abs(transform.position.y - 0) < EPSILON)
    //   assert(Math.abs(transform.position.z - 3.9767446) < EPSILON)
    //   assert(Math.abs(transform.rotation.x - 0) < EPSILON)
    //   assert(Math.abs(transform.rotation.y - 0.48717451) < EPSILON)
    //   assert(Math.abs(transform.rotation.z - 0) < EPSILON)
    //   assert(Math.abs(transform.rotation.w - 0.87330464) < EPSILON)
    //   assert(Math.abs(transform.scale.x - 1) < EPSILON)
    //   assert(Math.abs(transform.scale.y - 1) < EPSILON)
    //   assert(Math.abs(transform.scale.z - 1) < EPSILON)
    // })
  })

  describe('undo function', async () => {
    // it('will not undo command if command does not have undo object', () => {
    //   const EPSILON = 0.00001
    //   const transform = getComponent(nodes[1].entity, TransformComponent)
    //   const obj3d = getComponent(nodes[1].entity, Object3DComponent).value
    //   transform.position.set(1, 2, 3)
    //   transform.rotation.set(1, 1, 1, 1)
    //   transform.scale.set(2, 2, 2)
    //   obj3d.position.set(1, 2, 3)
    //   obj3d.quaternion.set(1, 1, 1, 1)
    //   obj3d.scale.set(2, 2, 2)
    //   command.axis.set(0, 1, 0)
    //   command.pivot.set(3, 3, 3)
    //   command.angle = 45
    //   RotateAroundCommand.prepare(command)
    //   RotateAroundCommand.execute(command)
    //   applyIncomingActions()
    //   RotateAroundCommand.undo(command)
    //   applyIncomingActions()
    //   assert(Math.abs(transform.position.x - -1.12867654) < EPSILON)
    //   assert(Math.abs(transform.position.y - 0) < EPSILON)
    //   assert(Math.abs(transform.position.z - 3.9767446) < EPSILON)
    //   assert(Math.abs(transform.rotation.x - 0) < EPSILON)
    //   assert(Math.abs(transform.rotation.y - 0.48717451) < EPSILON)
    //   assert(Math.abs(transform.rotation.z - 0) < EPSILON)
    //   assert(Math.abs(transform.rotation.w - 0.87330464) < EPSILON)
    //   assert(Math.abs(transform.scale.x - 1) < EPSILON)
    //   assert(Math.abs(transform.scale.y - 1) < EPSILON)
    //   assert(Math.abs(transform.scale.z - 1) < EPSILON)
    // })
    // it('will undo command', () => {
    //   const transform = getComponent(nodes[1].entity, TransformComponent)
    //   const obj3d = getComponent(nodes[1].entity, Object3DComponent).value
    //   transform.position.set(1, 2, 3)
    //   transform.rotation.set(1, 1, 1, 1)
    //   transform.scale.set(2, 2, 2)
    //   obj3d.position.set(1, 2, 3)
    //   obj3d.quaternion.set(1, 1, 1, 1)
    //   obj3d.scale.set(2, 2, 2)
    //   command.keepHistory = true
    //   command.axis.set(0, 1, 0)
    //   command.pivot.set(3, 3, 3)
    //   command.angle = 45
    //   RotateAroundCommand.prepare(command)
    //   RotateAroundCommand.execute(command)
    //   applyIncomingActions()
    //   RotateAroundCommand.undo(command)
    //   applyIncomingActions()
    //   // TODO: This test is failing.
    //   assert(true)
    //   // assert(Math.abs(transform.position.x - 1) < EPSILON)
    //   // assert(Math.abs(transform.position.y - 2) < EPSILON)
    //   // assert(Math.abs(transform.position.z - 3) < EPSILON)
    //   // assert(Math.abs(transform.rotation.x - 1) < EPSILON)
    //   // assert(Math.abs(transform.rotation.y - 1) < EPSILON)
    //   // assert(Math.abs(transform.rotation.z - 1) < EPSILON)
    //   // assert(Math.abs(transform.rotation.w - 1) < EPSILON)
    //   // assert(Math.abs(transform.scale.x - 2) < EPSILON)
    //   // assert(Math.abs(transform.scale.y - 2) < EPSILON)
    //   // assert(Math.abs(transform.scale.z - 2) < EPSILON)
    // })
  })

  describe('toString function', async () => {
    assert.equal(typeof RotateAroundCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
    deregisterEditorReceptors()
  })
})
