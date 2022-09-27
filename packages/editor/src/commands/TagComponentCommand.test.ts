import assert from 'assert'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  addComponent,
  createMappedComponent,
  hasComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTree, EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { addEntityNodeChild, createEntityNode, emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { TagComponentCommand, TagComponentCommandParams, TagComponentOperation } from './TagComponentCommand'

type TestComponentType = {}
const testComponentName = 'testcomponent'
export const TestComponent = createMappedComponent<TestComponentType>('TestComponent')

describe('TagComponentCommand', () => {
  let command = {} as TagComponentCommandParams
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
    addComponent(nodes[0].entity, TestComponent, {})

    command = {
      type: EditorCommands.TAG_COMPONENT,
      affectedNodes: [nodes[1]],
      operations: []
    }
  })

  describe('prepare function', async () => {
    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      command.operations = [
        {
          component: TestComponent,
          sceneComponentName: testComponentName,
          type: TagComponentOperation.ADD
        }
      ]
      TagComponentCommand.prepare(command)
      assert(command.undo)
      command.undo.operations.forEach((operation, i) => {
        const op = command.operations[i] ?? command.operations[0]

        assert.equal(operation.component, op.component)
        assert.equal(operation.sceneComponentName, op.sceneComponentName)
        assert.equal(
          operation.type,
          hasComponent((command.affectedNodes[i] as EntityTreeNode).entity, op.component)
            ? TagComponentOperation.ADD
            : TagComponentOperation.REMOVE
        )
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      TagComponentCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('emitEventAfter function', async () => {
    it('will not emit any event if "preventEvents" is true', () => {
      command.preventEvents = true
      const selectionState = accessSelectionState()
      const sceneGraphChangeCounter = selectionState.sceneGraphChangeCounter.value

      TagComponentCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert.equal(sceneGraphChangeCounter, selectionState.sceneGraphChangeCounter.value)
    })

    it('will emit event if "preventEvents" is false', () => {
      command.preventEvents = false
      TagComponentCommand.emitEventAfter?.(command)
      applyIncomingActions()
      assert(true)
    })
  })

  describe('execute function', async () => {
    it('Adds tag component to passed objects', () => {
      command.affectedNodes = nodes
      command.operations = [
        {
          component: TestComponent,
          sceneComponentName: testComponentName,
          type: TagComponentOperation.ADD
        }
      ]

      TagComponentCommand.execute(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node: EntityTreeNode, i) => {
        assert(hasComponent(node.entity, TestComponent))
      })
    })

    it('Removes tag component to passed objects', () => {
      command.affectedNodes = nodes
      command.operations = [
        {
          component: TestComponent,
          sceneComponentName: testComponentName,
          type: TagComponentOperation.REMOVE
        }
      ]

      TagComponentCommand.execute(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node: EntityTreeNode, i) => {
        assert(!hasComponent(node.entity, TestComponent))
      })
    })

    it('Toggles tag component to passed objects', () => {
      command.affectedNodes = nodes
      command.operations = [
        {
          component: TestComponent,
          sceneComponentName: testComponentName,
          type: TagComponentOperation.TOGGLE
        }
      ]

      TagComponentCommand.execute(command)
      applyIncomingActions()

      assert(!hasComponent((command.affectedNodes[0] as EntityTreeNode).entity, TestComponent))
      assert(hasComponent((command.affectedNodes[1] as EntityTreeNode).entity, TestComponent))
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      command.operations = [
        {
          component: TestComponent,
          sceneComponentName: testComponentName,
          type: TagComponentOperation.ADD
        }
      ]
      TagComponentCommand.prepare(command)
      TagComponentCommand.execute(command)
      applyIncomingActions()

      TagComponentCommand.undo(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node: EntityTreeNode, i) => {
        assert(hasComponent(node.entity, TestComponent))
      })
    })

    it('will undo command', () => {
      command.keepHistory = true
      command.operations = [
        {
          component: TestComponent,
          sceneComponentName: testComponentName,
          type: TagComponentOperation.ADD
        }
      ]
      TagComponentCommand.prepare(command)
      TagComponentCommand.execute(command)
      applyIncomingActions()

      TagComponentCommand.undo(command)
      applyIncomingActions()

      assert(command.undo)
      command.undo.operations.forEach((operation, i) => {
        assert.equal(
          operation.type === TagComponentOperation.ADD,
          hasComponent((command.affectedNodes[i] as EntityTreeNode).entity, operation.component)
        )
      })
    })
  })

  describe('toString function', async () => {
    assert.equal(typeof TagComponentCommand.toString(command), 'string')
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
    deregisterEditorReceptors()
  })
})
