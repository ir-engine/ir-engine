import assert from 'assert'
import { Types } from 'bitecs'
import * as bitECS from 'bitecs'

import { createEngine } from '../../initializeEngine'
import { Engine } from '../classes/Engine'
import {
  addComponent,
  ComponentMap,
  createMappedComponent,
  getAllComponents,
  getComponent,
  hasComponent,
  removeComponent
} from './ComponentFunctions'
import { createEntity } from './EntityFunctions'
import { useWorld } from './SystemHooks'

describe('ComponentFunctions', async () => {
  beforeEach(() => {
    createEngine()
    ComponentMap.clear()
  })

  describe('createMappedComponent', () => {
    it('should create tag component', () => {
      const TagComponent = createMappedComponent('TagComponent')

      assert.equal(TagComponent.name, 'TagComponent')
      assert.equal(typeof TagComponent.schema, 'undefined')
      assert.equal(TagComponent.map.size, 0)
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
      const Vector3Component = createMappedComponent<Vector3ComponentType, typeof Vector3Schema>(
        'Vector3Component',
        Vector3Schema
      )

      assert.equal(Vector3Component.name, 'Vector3Component')
      assert.equal(Vector3Component.schema, Vector3Schema)
      assert.equal(Vector3Component.map.size, 0)
      assert.equal(ComponentMap.size, 1)
    })
  })

  describe('addComponent', () => {
    it('should add component', () => {
      const TestComponent = createMappedComponent('TestComponent')

      const entity = createEntity()
      const component = addComponent(entity, TestComponent, {})

      assert.ok(component)
      assert.ok(bitECS.hasComponent(useWorld(), TestComponent, entity))
    })

    it('should add component with AoS values', () => {
      const TestComponent = createMappedComponent<{ value: number }>('TestComponent')

      const entity = createEntity()
      const component = addComponent(entity, TestComponent, { value: 5 })

      assert.ok(component)
      assert.equal(component.value, 5)
    })

    it('should add component with SoA values', () => {
      const { f32 } = Types
      const ValueSchema = { value: f32 }
      const TestComponent = createMappedComponent<{ value: number }, typeof ValueSchema>('TestComponent', ValueSchema)

      const entity = createEntity()
      TestComponent.value[entity] = 3
      assert.equal(TestComponent.value[entity], 3)
    })

    it('should throw on duplicate add component', () => {
      const TestComponent = createMappedComponent('TestComponent')

      const entity = createEntity()
      addComponent(entity, TestComponent, {})
      assert.throws(() => addComponent(entity, TestComponent, {}))
    })

    it('should throw on null entity argument', () => {
      assert.throws(() => addComponent(null!, null!, null!))
      assert.throws(() => addComponent(undefined!, undefined!, null!))
    })
  })

  describe('getComponent', () => {
    it('should get component', () => {
      const TestComponent = createMappedComponent('TestComponent')

      const entity = createEntity()
      addComponent(entity, TestComponent, {})
      const component = getComponent(entity, TestComponent)

      assert.ok(component)
    })

    it('should get component with values', () => {
      const TestComponent = createMappedComponent<{ value: number }>('TestComponent')

      const entity = createEntity()
      addComponent(entity, TestComponent, { value: 2 })
      const component = getComponent(entity, TestComponent)

      assert.ok(component)
      assert.equal(component.value, 2)
    })

    it('should get component with values', () => {
      const { f32 } = Types
      const ValueSchema = { value: f32 }
      const TestComponent = createMappedComponent<{ value: number }, typeof ValueSchema>('TestComponent', ValueSchema)

      const entity = createEntity()
      addComponent(entity, TestComponent, { value: 4 })
      const component = getComponent(entity, TestComponent)

      assert.ok(component)
      assert.equal(component.value, 4)
    })

    it('should throw on null entity argument', () => {
      assert.throws(() => getComponent(null!, null!))
      assert.throws(() => getComponent(undefined!, undefined!))
    })
  })

  describe('hasComponent', () => {
    it('should have component', () => {
      const TestComponent = createMappedComponent('TestComponent')

      const entity = createEntity()
      addComponent(entity, TestComponent, {})

      assert.ok(hasComponent(entity, TestComponent))
    })

    it('should have component with AoS values', () => {
      const TestComponent = createMappedComponent<{ value: number }>('TestComponent')

      const entity = createEntity()
      addComponent(entity, TestComponent, { value: 2 })

      assert.ok(hasComponent(entity, TestComponent))
    })

    it('should have component with SoA values', () => {
      const { f32 } = Types
      const ValueSchema = { value: f32 }
      const TestComponent = createMappedComponent<{ value: number }, typeof ValueSchema>('TestComponent', ValueSchema)

      const entity = createEntity()
      addComponent(entity, TestComponent, { value: 4 })

      assert.ok(hasComponent(entity, TestComponent))
    })

    it('should throw on null entity argument', () => {
      assert.throws(() => hasComponent(null!, null!))
      assert.throws(() => hasComponent(undefined!, undefined!))
    })
  })

  describe('removeComponent', () => {
    it('should have component', () => {
      const TestComponent = createMappedComponent('TestComponent')

      const entity = createEntity()
      addComponent(entity, TestComponent, {})

      assert.ok(hasComponent(entity, TestComponent))

      removeComponent(entity, TestComponent)

      assert.ok(!hasComponent(entity, TestComponent))
    })

    it('should have component with AoS values', () => {
      const TestComponent = createMappedComponent<{ value: number }>('TestComponent')

      const entity = createEntity()
      addComponent(entity, TestComponent, { value: 2 })

      assert.ok(hasComponent(entity, TestComponent))

      removeComponent(entity, TestComponent)

      assert.ok(!hasComponent(entity, TestComponent))
    })

    it('should have component with SoA values', () => {
      const { f32 } = Types
      const ValueSchema = { value: f32 }
      const TestComponent = createMappedComponent<{ value: number }, typeof ValueSchema>('TestComponent', ValueSchema)

      const entity = createEntity()
      addComponent(entity, TestComponent, { value: 4 })

      assert.ok(hasComponent(entity, TestComponent))

      removeComponent(entity, TestComponent)

      assert.ok(!hasComponent(entity, TestComponent))
    })

    it('should throw on null entity argument', () => {
      assert.throws(() => removeComponent(null!, null!))
      assert.throws(() => removeComponent(undefined!, undefined!))
    })
  })

  describe('getAllComponents', () => {
    it('should get all components', () => {
      const TestComponent1 = createMappedComponent('TestComponent1')
      const TestComponent2 = createMappedComponent('TestComponent2')
      const TestComponent3 = createMappedComponent('TestComponent3')

      const entity = createEntity()
      addComponent(entity, TestComponent1, {})
      addComponent(entity, TestComponent2, {})
      addComponent(entity, TestComponent3, {})

      const [component1, component2, component3] = getAllComponents(entity)

      assert.ok(component1)
      assert.ok(component2)
      assert.ok(component3)
    })
  })

  // TODO
  describe('defineQuery', () => {})
})
