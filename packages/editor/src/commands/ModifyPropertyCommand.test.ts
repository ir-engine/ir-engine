import assert from 'assert'
import { Vector3 } from 'three'

import { getNestedObject } from '@xrengine/common/src/utils/getNestedProperty'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  addComponent,
  createMappedComponent,
  getComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { addEntityNodeChild, createEntityNode, emptyEntityTree } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { GroundPlaneComponent } from '@xrengine/engine/src/scene/components/GroundPlaneComponent'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { ModifyPropertyCommand, ModifyPropertyCommandParams } from './ModifyPropertyCommand'

class TempProp {
  data: number
  constructor(data: number) {
    this.data = data
  }
  set(data: TempProp) {
    this.data = data.data
  }
}

type TestComponentType = {
  pos: Vector3
  index: number
  data: TempProp
}

const testComponentName = 'testcomponent'
export const TestComponent = createMappedComponent<TestComponentType>('TestComponent')
function getRandomValues(): TestComponentType {
  return {
    pos: new Vector3(Math.random(), Math.random(), Math.random()),
    index: Math.random(),
    data: new TempProp(Math.random())
  }
}

describe('ModifyPropertyCommand', () => {
  let command = {} as ModifyPropertyCommandParams<typeof TestComponent>
  let nodes: EntityTreeNode[]

  beforeEach(() => {
    createEngine()
    registerEditorReceptors()
    Engine.instance.store.defaultDispatchDelay = 0

    const rootNode = Engine.instance.currentWorld.entityTree.rootNode
    nodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]

    for (let i = 0; i < 2; i++) {
      addEntityNodeChild(nodes[i], rootNode)
      addComponent(nodes[i].entity, TestComponent, getRandomValues())
    }

    command = {
      type: EditorCommands.MODIFY_PROPERTY,
      affectedNodes: nodes,
      properties: [getRandomValues(), getRandomValues()],
      component: TestComponent
    }
  })

  describe('prepare function', async () => {
    it('creates "undo" object if history is enabled', () => {
      command.keepHistory = true
      ModifyPropertyCommand.prepare(command)

      assert(command.undo && command.undo.properties)
      assert.equal(command.undo.properties.length, command.affectedNodes.length)
      command.undo.properties.forEach((prop, i) => {
        const propertyNames = Object.keys(prop)

        assert(propertyNames.length > 0)
        const node = command.affectedNodes[i]
        if (typeof node === 'string') return
        const comp = getComponent(node.entity, command.component)

        for (const propertyName of Object.keys(prop)) {
          assert.deepEqual(comp[propertyName], prop[propertyName])
        }
      })
    })

    it('does not create "undo" object if history is disabled', () => {
      command.keepHistory = false
      ModifyPropertyCommand.prepare(command)

      assert.equal(command.undo, undefined)
    })
  })

  describe('shouldUpdate function', async () => {
    it('will returns false if component is not same', () => {
      const newCommand = {
        type: EditorCommands.MODIFY_PROPERTY,
        affectedNodes: nodes,
        properties: [getRandomValues(), getRandomValues()],
        component: GroundPlaneComponent
      }

      assert(!ModifyPropertyCommand.shouldUpdate?.(command, newCommand))
    })

    it('will returns false if properties contains different amount of props', () => {
      const properties = getRandomValues()
      delete (properties as any).index
      const newCommand = {
        type: EditorCommands.MODIFY_PROPERTY,
        affectedNodes: nodes,
        properties: [properties, properties],
        component: TestComponent
      }

      assert(!ModifyPropertyCommand.shouldUpdate?.(command, newCommand))
    })

    it('will returns false if properties lenght is not equal', () => {
      const properties = getRandomValues()
      const newCommand = {
        type: EditorCommands.MODIFY_PROPERTY,
        affectedNodes: nodes,
        properties: [properties],
        component: TestComponent
      }

      assert(!ModifyPropertyCommand.shouldUpdate?.(command, newCommand))
    })

    it('will returns false if passed nodes are not same', () => {
      const properties = getRandomValues()
      const newCommand = {
        type: EditorCommands.MODIFY_PROPERTY,
        affectedNodes: [nodes[0]],
        properties: [properties, properties],
        component: TestComponent
      }

      assert(!ModifyPropertyCommand.shouldUpdate?.(command, newCommand))
    })

    it('will returns true', () => {
      const properties = getRandomValues()
      const newCommand = {
        type: EditorCommands.MODIFY_PROPERTY,
        affectedNodes: nodes,
        properties: [properties, properties],
        component: TestComponent
      }

      assert(ModifyPropertyCommand.shouldUpdate?.(command, newCommand))
    })
  })

  describe('update function', async () => {
    it('will updates the command', () => {
      const newCommand = {
        type: EditorCommands.MODIFY_PROPERTY,
        affectedNodes: nodes,
        properties: [getRandomValues(), getRandomValues()],
        component: TestComponent
      }

      ModifyPropertyCommand.update?.(command, newCommand)
      applyIncomingActions()
      assert.deepEqual(command.properties, newCommand.properties)
    })
  })

  describe('execute function', async () => {
    it('will execute the command', () => {
      ModifyPropertyCommand.execute?.(command)
      applyIncomingActions()
      command.affectedNodes.forEach((node, i) => {
        if (typeof node === 'string') return
        const component = getComponent(node.entity, TestComponent)
        assert.deepEqual(component, command.properties[i])
      })
    })
  })

  describe('undo function', async () => {
    it('will not undo command if command does not have undo object', () => {
      command.keepHistory = false
      ModifyPropertyCommand.prepare(command)
      ModifyPropertyCommand.execute(command)
      applyIncomingActions()

      ModifyPropertyCommand.undo(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node, i) => {
        if (typeof node === 'string') return
        const component = getComponent(node.entity, TestComponent)
        assert.deepEqual(component, command.properties[i])
      })
    })

    it('will undo command if command does have undo object', () => {
      command.keepHistory = true
      ModifyPropertyCommand.prepare(command)
      ModifyPropertyCommand.execute(command)
      applyIncomingActions()

      ModifyPropertyCommand.undo(command)
      applyIncomingActions()

      assert(command.undo)
      command.affectedNodes.forEach((node, i) => {
        if (typeof node === 'string') return
        const component = getComponent(node.entity, TestComponent)
        assert.deepEqual(component, command.undo?.properties[i])
      })
    })
  })

  describe('toString function', async () => {
    assert.equal(typeof ModifyPropertyCommand.toString(command), 'string')
  })

  it('getNestedObject function', async () => {
    const obj = { a: { b: { c: Math.random() } } }
    const data = getNestedObject(obj, 'a.b.c')
    assert.equal(data.finalProp, 'c')
    assert.deepEqual(data.result, obj.a.b)
  })

  afterEach(() => {
    emptyEntityTree(Engine.instance.currentWorld.entityTree)
    accessSelectionState().merge({ selectedEntities: [] })
    deregisterEditorReceptors()
  })
})
