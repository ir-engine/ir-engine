/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'
import { Types } from 'bitecs'

import { createEngine } from '../../initializeEngine'
import { destroyEngine } from '../classes/Engine'
import {
  addComponent,
  ComponentMap,
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
