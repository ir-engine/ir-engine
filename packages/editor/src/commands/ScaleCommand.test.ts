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
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { setTransformComponent, TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { getRandomTransform } from './ReparentCommand.test'
import { ScaleCommand, ScaleCommandParams } from './ScaleCommand'

describe.skip('ScaleCommand', () => {
  let command = {} as ScaleCommandParams
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
      const transform = getRandomTransform()
      setTransformComponent(node.entity, transform.position, transform.rotation, transform.scale)
      obj3d.scale.copy(transform.scale)
      Engine.instance.currentWorld.scene.add(obj3d)
      addObjectToGroup(node.entity, obj3d)
    })

    command = {
      type: EditorCommands.SCALE,
      affectedNodes: [nodes[1]],
      scales: []
    }
  })

  describe('prepare function', async () => {
    it('sets space to local space if it is not passed', () => {
      ScaleCommand.prepare(command)

      assert.equal(command.space, TransformSpace.Local)
    })

    it('will not set space to local space if it is passed', () => {
      command.space = TransformSpace.LocalSelection
      ScaleCommand.prepare(command)
      assert.equal(command.space, TransformSpace.LocalSelection)
    })

    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      command.scales = [getRandomTransform().scale]
      ScaleCommand.prepare(command)

      assert(command.undo)
      command.undo.scales.forEach((scale, i) => {
        assert.equal(command.undo?.space, TransformSpace.Local)
        assert.equal(command.undo?.overrideScale, true)
        assert.deepEqual(
          scale,
          getComponent((command.affectedNodes[i] as EntityTreeNode).entity, TransformComponent).scale
        )
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      ScaleCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      ScaleCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      ScaleCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert(true)
    })
  })

  describe('shouldUpdate function', async () => {
    it('will return false if space is different', () => {
      command.space = TransformSpace.LocalSelection
      const newCommand = {
        type: EditorCommands.SCALE,
        affectedNodes: [nodes[1]],
        scales: []
      }

      assert(!ScaleCommand.shouldUpdate?.(command, newCommand))
    })

    it('will return false if nodes are different', () => {
      command.space = TransformSpace.LocalSelection
      const newCommand = {
        type: EditorCommands.SCALE,
        affectedNodes: [nodes[0]],
        scales: [],
        space: TransformSpace.LocalSelection
      }

      assert(!ScaleCommand.shouldUpdate?.(command, newCommand))
    })

    it('will return true if nodes and space are same', () => {
      command.space = TransformSpace.LocalSelection
      const newCommand = {
        type: EditorCommands.SCALE,
        affectedNodes: [nodes[1]],
        scales: [],
        space: TransformSpace.LocalSelection
      }

      assert(ScaleCommand.shouldUpdate?.(command, newCommand))
    })
  })

  describe('update function', async () => {
    it('will update command when override scale is true', () => {
      command.space = TransformSpace.LocalSelection
      command.overrideScale = true
      command.scales = [getRandomTransform().scale]
      const newCommand = {
        type: EditorCommands.SCALE,
        affectedNodes: [nodes[1]],
        scales: [getRandomTransform().scale]
      }

      ScaleCommand.update?.(command, newCommand)
      applyIncomingActions()

      assert.deepEqual(command.scales, newCommand.scales)
    })

    it('will update command when override scale is false', () => {
      command.space = TransformSpace.LocalSelection
      command.scales = [getRandomTransform().scale]
      command.overrideScale = false
      const newCommand = {
        type: EditorCommands.SCALE,
        affectedNodes: [nodes[1]],
        scales: [getRandomTransform().scale]
      }

      const newScales = command.scales.map((scale, i) => scale.multiply(newCommand.scales[i]))
      ScaleCommand.update?.(command, newCommand)
      applyIncomingActions()
      assert.deepEqual(command.scales, newScales)
    })
  })

  describe('execute function', async () => {
    // it('will execute command when override scale is false', () => {
    //   command.space = TransformSpace.LocalSelection
    //   command.scales = [getRandomTransform().scale]
    //   command.overrideScale = false

    //   const newScales = command.affectedNodes.map((node: EntityTreeNode, i) => {
    //     return new Vector3().copy(getComponent(node.entity, TransformComponent).scale).multiply(command.scales[i])
    //   })

    //   ScaleCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert.deepEqual(getComponent(node.entity, TransformComponent).scale, newScales[i])
    //   })
    // })

    // it('will execute command for local space', () => {
    //   command.space = TransformSpace.Local
    //   command.scales = [getRandomTransform().scale]
    //   command.overrideScale = true

    //   ScaleCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert.deepEqual(getComponent(node.entity, TransformComponent).scale, command.scales[i])
    //   })
    // })

    it('will execute command for local space with scale sets to zero', () => {
      command.space = TransformSpace.Local
      command.scales = [new Vector3(0, 0, 0)]
      command.overrideScale = true

      ScaleCommand.execute(command)
      applyIncomingActions()
      command.affectedNodes.forEach((node: EntityTreeNode, i) => {
        const scale = getComponent(node.entity, TransformComponent).scale
        assert.equal(scale.x, Number.EPSILON)
        assert.equal(scale.y, Number.EPSILON)
        assert.equal(scale.z, Number.EPSILON)
      })
    })

    // it('will execute command for world space', () => {
    //   command.space = TransformSpace.World
    //   command.scales = [getRandomTransform().scale]
    //   command.overrideScale = true

    //   ScaleCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert.deepEqual(getComponent(node.entity, TransformComponent).scale, command.scales[i])
    //   })
    // })

    it('will execute command for world space with scale sets to zero', () => {
      command.space = TransformSpace.World
      command.scales = [new Vector3(0, 0, 0)]
      command.overrideScale = true

      ScaleCommand.execute(command)
      applyIncomingActions()
      command.affectedNodes.forEach((node: EntityTreeNode, i) => {
        const scale = getComponent(node.entity, TransformComponent).scale
        assert.equal(scale.x, Number.EPSILON)
        assert.equal(scale.y, Number.EPSILON)
        assert.equal(scale.z, Number.EPSILON)
      })
    })

    // it('will execute command for Local selection space', () => {
    //   command.space = TransformSpace.LocalSelection
    //   command.scales = [getRandomTransform().scale]
    //   command.overrideScale = true

    //   ScaleCommand.execute(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert.deepEqual(getComponent(node.entity, TransformComponent).scale, command.scales[i])
    //   })
    // })
  })

  describe('undo function', async () => {
    // it('will not undo command if command does not have undo object', () => {
    //   command.space = TransformSpace.Local
    //   command.scales = [getRandomTransform().scale]
    //   command.overrideScale = true
    //   ScaleCommand.prepare(command)
    //   ScaleCommand.execute(command)
    //   applyIncomingActions()
    //   ScaleCommand.undo(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert.deepEqual(getComponent(node.entity, TransformComponent).scale, command.scales[i])
    //   })
    // })
    // it('will undo command', () => {
    //   command.space = TransformSpace.LocalSelection
    //   command.keepHistory = true
    //   command.scales = [getRandomTransform().scale]
    //   command.overrideScale = false
    //   ScaleCommand.prepare(command)
    //   ScaleCommand.execute(command)
    //   applyIncomingActions()
    //   ScaleCommand.undo(command)
    //   applyIncomingActions()
    //   command.affectedNodes.forEach((node: EntityTreeNode, i) => {
    //     assert.deepEqual(getComponent(node.entity, TransformComponent).scale, command.undo?.scales[i])
    //   })
    // })
  })

  describe('toString function', async () => {
    assert.equal(typeof ScaleCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
    deregisterEditorReceptors()
  })
})
