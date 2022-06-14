import assert from 'assert'
import { Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import {
  addComponent,
  createMappedComponent,
  getComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeInTree,
  createEntityNode,
  emptyEntityTree
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { RenderSettingComponent } from '@xrengine/engine/src/scene/components/RenderSettingComponent'
import { registerPrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { applyIncomingActions } from '@xrengine/hyperflux'

import EditorCommands from '../constants/EditorCommands'
import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { accessSelectionState } from '../services/SelectionServices'
import { getNestedObject, ModifyPropertyCommand, ModifyPropertyCommandParams } from './ModifyPropertyCommand'

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
  let rootNode: EntityTreeNode
  let nodes: EntityTreeNode[]

  beforeEach(() => {
    createEngine()
    registerEditorReceptors()
    Engine.instance.store.defaultDispatchDelay = 0
    registerPrefabs(Engine.instance.currentWorld)

    rootNode = createEntityNode(createEntity())
    nodes = [createEntityNode(createEntity()), createEntityNode(createEntity())]
    addEntityNodeInTree(rootNode)

    for (let i = 0; i < 2; i++) {
      addEntityNodeInTree(nodes[i], rootNode)
      addComponent(nodes[i].entity, TestComponent, getRandomValues())
      addComponent(nodes[i].entity, EntityNodeComponent, { components: [testComponentName] })
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
        const comp = getComponent(command.affectedNodes[i].entity, command.component)

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
        component: RenderSettingComponent
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
      const data = {
        [nodes[0].entity]: false,
        [nodes[1].entity]: false
      }
      Engine.instance.currentWorld.sceneLoadingRegistry.set(testComponentName, {
        update: (entity) => (data[entity] = true)
      } as any)

      ModifyPropertyCommand.execute?.(command)
      applyIncomingActions()

      command.affectedNodes.forEach((node, i) => {
        const component = getComponent(node.entity, TestComponent)
        assert.deepEqual(component, command.properties[i])
        command.affectedNodes.forEach((node) => assert.equal(data[node.entity], true))
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
