import assert from 'assert'
import { Types } from 'bitecs'
import * as bitECS from 'bitecs'

import { createEngine } from '../../initializeEngine'
import { destroyEngine, Engine } from '../classes/Engine'
import {
  addComponent,
  ComponentMap,
  createMappedComponent,
  defineComponent,
  getAllComponents,
  getComponent,
  hasComponent,
  removeComponent
} from './ComponentFunctions'
import { createEntity } from './EntityFunctions'

describe('ComponentFunctions', async () => {
  beforeEach(() => {
    createEngine()
    ComponentMap.clear()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('createMappedComponent', () => {
    it('should create tag component', () => {
      const TagComponent = defineComponent({ name: 'TagComponent', onInit: () => true })

      assert.equal(TagComponent.name, 'TagComponent')
      assert.equal(typeof TagComponent.schema, 'undefined')
      assert.equal(ComponentMap.size, 1)
    })

    it('should create mapped component with SoA', () => {
      type Vector3ComponentType = {
        x: number
        y: number
        z: number
      }
      const { f32 } = Types
      const Vector3Schema = { x: f32, y: f32, z: f32 }
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: Vector3Schema
      })

      assert.equal(Vector3Component.name, 'Vector3Component')
      assert.equal(Vector3Component.schema, Vector3Schema)
      assert.equal(ComponentMap.size, 1)
    })
  })

  describe('addComponent', () => {
    it('should add component', () => {
      const TestComponent = defineComponent({ name: 'TestComponent', onInit: () => true })

      const entity = createEntity()
      addComponent(entity, TestComponent)
      const component = getComponent(entity, TestComponent)

      assert.ok(component)
      assert.ok(hasComponent(entity, TestComponent))
    })

    it('should add component with AoS values', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',

        onInit(entity) {
          return { val: 1 }
        },

        onSet(entity, component, json) {
          if (!json) return
          if (typeof json.val !== 'undefined') component.val.set(json.val)
        }
      })

      const entity = createEntity()
      addComponent(entity, TestComponent, { val: 5 })
      const component = getComponent(entity, TestComponent)

      assert.ok(component)
      assert.equal(component.val, 5)
    })

    it('should add component with SoA values', () => {
      const { f32 } = Types
      const ValueSchema = { value: f32 }
      const TestComponent = defineComponent({ name: 'TestComponent', schema: ValueSchema })

      const entity = createEntity()
      TestComponent.value[entity] = 3
      assert.equal(TestComponent.value[entity], 3)
    })

    it('should throw on duplicate add component', () => {
      const TestComponent = defineComponent({ name: 'TestComponent', onInit: () => true })

      const entity = createEntity()
      addComponent(entity, TestComponent)
      assert.throws(() => addComponent(entity, TestComponent))
    })

    it('should throw on null entity argument', () => {
      assert.throws(() => addComponent(null!, null!, null!))
      assert.throws(() => addComponent(undefined!, undefined!, null!))
    })
  })

  describe('getComponent', () => {
    it('should get component', () => {
      const TestComponent = defineComponent({ name: 'TestComponent', onInit: () => true })

      const entity = createEntity()
      addComponent(entity, TestComponent)
      const component = getComponent(entity, TestComponent)

      assert.ok(component)
    })

    it('should get component with values', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',

        onInit(entity) {
          return { val: 1 }
        },

        onSet(entity, component, json) {
          if (!json) return
          if (typeof json.val !== 'undefined') component.val.set(json.val)
        }
      })

      const entity = createEntity()
      addComponent(entity, TestComponent, { val: 2 })
      const component = getComponent(entity, TestComponent)

      assert.ok(component)
      assert.equal(component.val, 2)
    })

    it('should throw on null entity argument', () => {
      assert.throws(() => getComponent(null!, null!))
      assert.throws(() => getComponent(undefined!, undefined!))
    })
  })

  describe('hasComponent', () => {
    it('should have component', () => {
      const TestComponent = defineComponent({ name: 'TestComponent', onInit: () => true })

      const entity = createEntity()
      addComponent(entity, TestComponent)

      assert.ok(hasComponent(entity, TestComponent))
    })

    it('should have component with AoS values', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',

        onInit(entity) {
          return { val: 1 }
        },

        onSet(entity, component, json) {
          if (!json) return
          if (typeof json.val !== 'undefined') component.val.set(json.val)
        }
      })

      const entity = createEntity()
      addComponent(entity, TestComponent, { val: 2 })

      assert.ok(hasComponent(entity, TestComponent))
    })

    it('should have component with SoA values', () => {
      const { f32 } = Types
      const ValueSchema = { value: f32 }
      const TestComponent = defineComponent({ name: 'TestComponent', schema: ValueSchema })

      const entity = createEntity()
      addComponent(entity, TestComponent)

      assert.ok(hasComponent(entity, TestComponent))
    })

    it('should return false for nullish entity argument', () => {
      const TestComponent = defineComponent({ name: 'TestComponent' })
      assert(!hasComponent(null!, TestComponent))
      assert(!hasComponent(undefined!, TestComponent))
    })

    it('should throw nullish component argument', () => {
      assert.throws(() => hasComponent(null!, null!))
      assert.throws(() => hasComponent(undefined!, undefined!))
    })
  })

  describe('removeComponent', () => {
    it('should have component', () => {
      const TestComponent = defineComponent({ name: 'TestComponent', onInit: () => true })

      const entity = createEntity()
      addComponent(entity, TestComponent)

      assert.ok(hasComponent(entity, TestComponent))

      removeComponent(entity, TestComponent)

      assert.ok(!hasComponent(entity, TestComponent))
    })

    it('should have component with AoS values', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',

        onInit(entity) {
          return { val: 1 }
        },

        onSet(entity, component, json) {
          if (!json) return
          if (typeof json.val !== 'undefined') component.val.set(json.val)
        }
      })

      const entity = createEntity()
      addComponent(entity, TestComponent, { val: 2 })

      assert.ok(hasComponent(entity, TestComponent))

      removeComponent(entity, TestComponent)

      assert.ok(!hasComponent(entity, TestComponent))
    })

    it('should have component with SoA values', () => {
      const { f32 } = Types
      const ValueSchema = { value: f32 }
      const TestComponent = defineComponent({ name: 'TestComponent', schema: ValueSchema })

      const entity = createEntity()
      addComponent(entity, TestComponent)

      assert.ok(hasComponent(entity, TestComponent))

      removeComponent(entity, TestComponent)

      assert.ok(!hasComponent(entity, TestComponent))
    })
  })

  describe('getAllComponents', () => {
    it('should get all components', () => {
      const TestComponent1 = defineComponent({ name: 'TestComponent1' })
      const TestComponent2 = defineComponent({ name: 'TestComponent2' })
      const TestComponent3 = defineComponent({ name: 'TestComponent3' })

      const entity = createEntity()
      addComponent(entity, TestComponent1)
      addComponent(entity, TestComponent2)
      addComponent(entity, TestComponent3)

      const [component1, component2, component3] = getAllComponents(entity)

      assert.ok(component1)
      assert.ok(component2)
      assert.ok(component3)
    })
  })

  // TODO
  describe('defineQuery', () => {})
})
