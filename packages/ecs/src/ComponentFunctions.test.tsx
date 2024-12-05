/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { act, render } from '@testing-library/react'
import assert from 'assert'
import { Types } from 'bitecs'
import React, { useEffect } from 'react'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import sinon from 'sinon'
import { DirectionalLight, Matrix4, Vector3 } from 'three'
import {
  ComponentMap,
  defineComponent,
  getAllComponents,
  getComponent,
  hasComponent,
  hasComponents,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from './ComponentFunctions'
import { createEngine, destroyEngine } from './Engine'
import { Entity, EntityUUID, UndefinedEntity } from './Entity'
import { createEntity, removeEntity } from './EntityFunctions'
import { UUIDComponent } from './UUIDComponent'
import { ECSSchema } from './schemas/ECSSchemas'
import { CheckSchemaValue, CreateSchemaValue } from './schemas/JSONSchemaUtils'
import { S } from './schemas/JSONSchemas'

describe('ComponentFunctions', async () => {
  beforeEach(() => {
    createEngine()
    ComponentMap.clear()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('defineComponent', () => {
    it('should create tag component', () => {
      const TagComponent = defineComponent({ name: 'TagComponent', onInit: () => true })

      assert.equal(TagComponent.name, 'TagComponent')
      assert.equal(typeof TagComponent.schema, 'undefined')
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

    it('should use default toJSON function if none is defined', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object({
          x: S.Number(0),
          y: S.Number(0),
          z: S.Number(0)
        })
      })

      const entity = createEntity()
      setComponent(entity, Vector3Component)
      const vector3Component = getComponent(entity, Vector3Component)
      const json = Vector3Component.toJSON(vector3Component)
      const fromSchema = CreateSchemaValue(Vector3Component.schema)
      assert.deepEqual(vector3Component, fromSchema)
      assert.deepEqual(json, fromSchema)
      assert.deepEqual(json, vector3Component)
    })

    it('should use default onSet function if none is defined', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object({
          x: S.Number(0),
          y: S.Number(0),
          z: S.Number(4)
        })
      })

      const setValue = { x: 12, y: 24 }
      const entity = createEntity()
      setComponent(entity, Vector3Component, setValue)
      const vector3Component = getComponent(entity, Vector3Component)
      assert(CheckSchemaValue(Vector3Component.schema, vector3Component))
      assert(vector3Component.x === setValue.x && vector3Component.y === setValue.y)
      assert(vector3Component.z === CreateSchemaValue(Vector3Component.schema).z)
    })

    it('should override runtime data if onInit is specified', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object({
          x: S.Number(0),
          y: S.Number(0),
          z: S.Number(4)
        }),
        onInit: (initial) => new Vector3(initial.x, initial.y, initial.z)
      })

      const setValue = { x: 12, y: 24 }
      const entity = createEntity()
      setComponent(entity, Vector3Component, setValue)
      const vector3Component = getComponent(entity, Vector3Component)
      const fromSchema = CreateSchemaValue(Vector3Component.schema)
      assert(vector3Component instanceof Vector3)
      assert(vector3Component.isVector3)
      assert(vector3Component.x === setValue.x && vector3Component.y === setValue.y)
      assert(vector3Component.z === fromSchema.z)
      assert.notDeepEqual(vector3Component, fromSchema)
    })

    it('toJSON should still be in the shape of the schema even if overriden by onInit', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object({
          x: S.Number(0),
          y: S.Number(0),
          z: S.Number(4)
        }),
        onInit: (initial) => new Vector3(initial.x, initial.y, initial.z)
      })

      const setValue = { x: 12, y: 24 }
      const entity = createEntity()
      setComponent(entity, Vector3Component, setValue)
      const vector3Component = getComponent(entity, Vector3Component)
      const json = Vector3Component.toJSON(vector3Component)
      assert(vector3Component instanceof Vector3)
      assert(!(json instanceof Vector3))
      assert(vector3Component.isVector3)
      assert.deepEqual(json, { ...setValue, z: 4 })
      assert((json as any).isVector3 === undefined)
    })

    it('Can set component with overriden types', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object({
          x: S.Number(0),
          y: S.Number(0),
          z: S.Number(4)
        }),
        onInit: (initial) => new Vector3(initial.x, initial.y, initial.z)
      })

      const setValue = new Vector3(12, 15, 74)
      const entity = createEntity()
      setComponent(entity, Vector3Component, setValue)
      const vector3Component = getComponent(entity, Vector3Component)
      assert(vector3Component instanceof Vector3)
      assert(
        vector3Component.x === setValue.x && vector3Component.y === setValue.y && vector3Component.z === setValue.z
      )
    })

    it('toJSON ignores NonSerialized fields', () => {
      const ObjComponent = defineComponent({
        name: 'ObjComponent',
        schema: S.Object({
          light: S.NonSerialized(S.Class(() => new DirectionalLight())),
          other: S.Number(0)
        })
      })

      const TopLevelComponent = defineComponent({
        name: 'ObjComponent',
        schema: S.NonSerialized(S.Number())
      })

      const entity = createEntity()
      const objComponent = setComponent(entity, ObjComponent, { other: 12 })
      const json = ObjComponent.toJSON(objComponent)
      assert(!('light' in json))
      assert('other' in json)
      // The previous assert erases type for some reason
      assert((json as any).other === 12)

      const topLevel = setComponent(entity, TopLevelComponent, 4)
      assert(topLevel === 4)
      const nonJson = TopLevelComponent.toJSON(topLevel)
      assert(nonJson === null)
    })

    it('throws error when onSet is called without required fields', () => {
      const ObjComponent = defineComponent({
        name: 'ObjComponent',
        schema: S.Object({
          light: S.Required(S.Class(() => new DirectionalLight())),
          other: S.Number(0)
        })
      })

      const TopLevelComponent = defineComponent({
        name: 'ObjComponent',
        schema: S.Required(S.Class(() => new DirectionalLight()))
      })

      const entity = createEntity()
      const light = new DirectionalLight()
      assert.throws(() => setComponent(entity, ObjComponent, { other: 12 }))
      assert.doesNotThrow(() => setComponent(entity, ObjComponent, { light }))
      assert.throws(() => setComponent(entity, TopLevelComponent))
      assert.doesNotThrow(() => setComponent(entity, TopLevelComponent, light))
    })

    it('uses schema initializers if they exist', () => {
      const spy = sinon.spy()

      const ObjComponent = defineComponent({
        name: 'ObjComponent',
        schema: S.Object({
          val: S.Number(4, {
            deserialize: (curr, value) => {
              assert(curr === 4)
              spy()
              return value * 2
            }
          })
        })
      })

      const TopLevelComponent = defineComponent({
        name: 'ObjComponent',
        schema: S.Number(2, {
          deserialize: (curr, value) => {
            assert(curr === 2)
            spy()
            return value * 3
          }
        })
      })

      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object(
          {
            x: S.Number(0),
            y: S.Number(0),
            z: S.Number(4)
          },
          undefined,
          {
            deserialize: (curr, value) => {
              return new Vector3(value.x, value.y, value.z)
            }
          }
        )
      })

      const Vec3Component = defineComponent({
        name: 'Vector3Component',
        schema: T.Vec3()
      })

      const entity = createEntity()

      const objComponent = setComponent(entity, ObjComponent, { val: 12 })
      assert(objComponent.val === 12 * 2)
      assert(spy.calledOnce)

      const topLevelComponent = setComponent(entity, TopLevelComponent, 6)
      assert(topLevelComponent === 6 * 3)
      assert(spy.calledTwice)

      const vec3 = new Vector3(12, 13, 14)
      const vector3Component = setComponent(entity, Vector3Component, new Vector3(12, 13, 14))
      assert(!(vector3Component instanceof Vector3))
      assert(vec3.x === vector3Component.x && vec3.y === vector3Component.y && vec3.z === vector3Component.z)
      assert(vec3 !== vector3Component)

      let vec3Component = setComponent(entity, Vec3Component)
      assert(vec3Component instanceof Vector3)
      assert(vec3Component.x === 0 && vec3Component.y === 0 && vec3Component.z === 0)

      const vec3Obj = { x: 11, y: 12, z: 13 }
      vec3Component = setComponent(entity, Vec3Component, vec3Obj)
      assert(vec3Obj.x === vec3Component.x && vec3Obj.y === vec3Component.y && vec3Obj.z === vec3Component.z)
      assert(vec3Obj !== vec3Component)
      assert(vec3Component instanceof Vector3)
    })

    it('ECS Schema is proxied', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: ECSSchema.Vec3
      })

      const entity = createEntity()
      setComponent(entity, Vector3Component)
      const vector3Component = getComponent(entity, Vector3Component)
      vector3Component.x = 12
      assert(vector3Component.x === 12)
      assert(vector3Component.x === Vector3Component.x[entity])
    })

    it('ECS Schema is proxied, nested objects', () => {
      const TransformComponent = defineComponent({
        name: 'Vector3Component',
        schema: {
          position: ECSSchema.Vec3,
          rotation: ECSSchema.Quaternion,
          scale: ECSSchema.Vec3
        }
      })

      const entity = createEntity()
      setComponent(entity, TransformComponent)
      const transformComponent = getComponent(entity, TransformComponent)
      transformComponent.position.x = 12
      assert(transformComponent.position.x === 12)
      assert(transformComponent.position.x === TransformComponent.position.x[entity])
    })

    it('ECS Schema is proxied, arrays', () => {
      const TransformComponent = defineComponent({
        name: 'Vector3Component',
        schema: {
          position: ECSSchema.Vec3,
          rotation: ECSSchema.Quaternion,
          scale: ECSSchema.Vec3,
          matrix: ECSSchema.Mat4
        }
      })

      const entity = createEntity()
      setComponent(entity, TransformComponent)
      const transformComponent = getComponent(entity, TransformComponent)
      transformComponent.matrix[12] = 14
      const mat = TransformComponent.matrix[entity]
      assert(transformComponent.matrix[12] === 14)
      assert(transformComponent.matrix[12] === TransformComponent.matrix[entity][12])
      assert(transformComponent.matrix[12] === mat[12])

      const mat4Elements = new Matrix4().elements
      transformComponent.matrix.set(mat4Elements)

      for (let i = 0; i < mat4Elements.length; i++) {
        assert(transformComponent.matrix[i] === mat4Elements[i])
        assert(TransformComponent.matrix[entity][i] === mat4Elements[i])
      }
    })
  })

  describe('setComponent', () => {
    it('should add component', () => {
      const TestComponent = defineComponent({ name: 'TestComponent', onInit: () => true })

      const entity = createEntity()
      setComponent(entity, TestComponent)
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
      setComponent(entity, TestComponent, { val: 5 })
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

    it('should throw on null entity argument', () => {
      assert.throws(() => setComponent(null!, null!, null!))
      assert.throws(() => setComponent(undefined!, undefined!, null!))
    })
  })

  describe('getComponent', () => {
    it('should get component', () => {
      const TestComponent = defineComponent({ name: 'TestComponent', onInit: () => true })

      const entity = createEntity()
      setComponent(entity, TestComponent)
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
      setComponent(entity, TestComponent, { val: 2 })
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
      setComponent(entity, TestComponent)

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
      setComponent(entity, TestComponent, { val: 2 })

      assert.ok(hasComponent(entity, TestComponent))
    })

    it('should have component with SoA values', () => {
      const { f32 } = Types
      const ValueSchema = { value: f32 }
      const TestComponent = defineComponent({ name: 'TestComponent', schema: ValueSchema })

      const entity = createEntity()
      setComponent(entity, TestComponent)

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

  describe('hasComponents', () => {
    it('should have components', () => {
      const TestComponent = defineComponent({ name: 'TestComponent', onInit: () => true })
      const TestComponent2 = defineComponent({ name: 'TestComponent2', onInit: () => true })

      const entity = createEntity()
      setComponent(entity, TestComponent)
      setComponent(entity, TestComponent2)

      assert.ok(hasComponents(entity, [TestComponent, TestComponent2]))
    })

    it('should have components with AoS values', () => {
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
      const TestComponent2 = defineComponent({
        name: 'TestComponent2',

        onInit(entity) {
          return { val: 2 }
        },

        onSet(entity, component, json) {
          if (!json) return
          if (typeof json.val !== 'undefined') component.val.set(json.val)
        }
      })

      const entity = createEntity()
      setComponent(entity, TestComponent, { val: 2 })
      setComponent(entity, TestComponent2, { val: 3 })

      assert.ok(hasComponents(entity, [TestComponent, TestComponent2]))
    })

    it('should have components with SoA values', () => {
      const { f32 } = Types
      const ValueSchema = { value: f32 }
      const TestComponent = defineComponent({ name: 'TestComponent', schema: ValueSchema })
      const TestComponent2 = defineComponent({ name: 'TestComponent2', schema: ValueSchema })

      const entity = createEntity()
      setComponent(entity, TestComponent)
      setComponent(entity, TestComponent2)

      assert.ok(hasComponents(entity, [TestComponent, TestComponent2]))
    })

    it('should return false for nullish entity argument', () => {
      const TestComponent = defineComponent({ name: 'TestComponent' })
      const TestComponent2 = defineComponent({ name: 'TestComponent2' })

      assert(!hasComponents(null!, [TestComponent, TestComponent2]))
      assert(!hasComponents(undefined!, [TestComponent, TestComponent2]))
    })

    it('should return false empty array of components', () => {
      const entity = createEntity()
      assert(!hasComponents(entity, []))
    })

    it('should throw nullish component argument', () => {
      assert.throws(() => hasComponents(null!, null!))
      assert.throws(() => hasComponents(undefined!, undefined!))
    })
  })

  describe('removeComponent', () => {
    it('should remove component', () => {
      const TestComponent = defineComponent({ name: 'TestComponent', onInit: () => true })

      const entity = createEntity()
      setComponent(entity, TestComponent)

      assert.ok(hasComponent(entity, TestComponent))

      removeComponent(entity, TestComponent)

      assert.ok(!hasComponent(entity, TestComponent))
      assert.ok(TestComponent.stateMap[entity]!.promised === true)
    })

    it('should remove component with AoS values', () => {
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
      setComponent(entity, TestComponent, { val: 2 })

      assert.ok(hasComponent(entity, TestComponent))

      removeComponent(entity, TestComponent)

      assert.ok(!hasComponent(entity, TestComponent))
    })

    it('should remove component with SoA values', () => {
      const { f32 } = Types
      const ValueSchema = { value: f32 }
      const TestComponent = defineComponent({ name: 'TestComponent', schema: ValueSchema })

      const entity = createEntity()
      setComponent(entity, TestComponent)

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
      setComponent(entity, TestComponent1)
      setComponent(entity, TestComponent2)
      setComponent(entity, TestComponent3)

      const [component1, component2, component3] = getAllComponents(entity)

      assert.ok(component1)
      assert.ok(component2)
      assert.ok(component3)
    })
  })
})

describe('ComponentFunctions Hooks', async () => {
  describe('useComponent', async () => {
    type ResultType = undefined | string
    const ResultValue: ResultType = 'ReturnValue'
    const component = defineComponent({ name: 'TestComponent', onInit: () => ResultValue })
    let testEntity = UndefinedEntity
    let result = undefined as ResultType
    let counter = 0

    beforeEach(() => {
      createEngine()
      ComponentMap.clear()
      testEntity = createEntity()
    })

    afterEach(() => {
      counter = 0
      removeEntity(testEntity)
      return destroyEngine()
    })

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const data = useComponent(testEntity, component)
      useEffect(() => {
        result = data.value as ResultType
        ++counter
      }, [data])
      return null
    }

    it('assigns the correct value with onInit', async () => {
      setComponent(testEntity, component)
      assert.equal(counter, 0, "The reactor shouldn't have run before rendering")
      const tag = <Reactor />
      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))
      assert.equal(counter, 1, `The reactor has run an incorrect number of times: ${counter}`)
      assert.notEqual(result, undefined, "The result data didn't get assigned.")
      assert.equal(result, ResultValue, `Did not return the correct data. result = ${result}`)
      unmount()
    })
  }) // useComponent

  describe('useOptionalComponent : Simple cases', async () => {
    type ResultType = string | undefined
    const ResultValue: ResultType = 'ReturnValue'
    const component = defineComponent({ name: 'TestComponent', onInit: () => ResultValue })
    let testEntity = UndefinedEntity
    let result: ResultType = undefined
    let counter = 0

    beforeEach(() => {
      createEngine()
      ComponentMap.clear()
      testEntity = createEntity()
    })

    afterEach(() => {
      counter = 0
      removeEntity(testEntity)
      return destroyEngine()
    })

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const data = useOptionalComponent(testEntity, component)
      useEffect(() => {
        result = data?.value
        ++counter
      }, [data])
      return null
    }

    it("returns undefined when the component wasn't set yet", async () => {
      assert.equal(counter, 0, "The reactor shouldn't have run before rendering")
      const tag = <Reactor />
      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))
      assert.equal(counter, 1, `The reactor has run an incorrect number of times: ${counter}`)
      assert.equal(result, undefined, `Should have returned undefined.`)
      unmount()
    })

    it('returns the correct data when the component has been set', async () => {
      assert.equal(counter, 0, "The reactor shouldn't have run before rendering")
      const tag = <Reactor />
      const { rerender, unmount } = render(tag)
      setComponent(testEntity, component)
      await act(() => rerender(tag))
      assert.equal(true, hasComponent(testEntity, component), 'The test entity did not get its component set correctly')
      assert.notEqual(result, undefined, "The result data didn't get assigned.")
      assert.equal(counter, 2, `The reactor has run an incorrect number of times: ${counter}`)
      assert.equal(result, ResultValue, `Did not return the correct data.`)
      unmount()
    })
  }) // useOptionalComponent : Simple Cases

  describe('useOptionalComponent : Isolated Test Cases', async () => {
    /** @note These test cases are isolated from each other, by defining everything without using any common code (like beforeEach/afterEach/etc) */

    it('returns different data when the entity is changed', async () => {
      // Initialize the isolated case
      createEngine()
      ComponentMap.clear()

      // Initialize the dummy data
      type ResultType = EntityUUID | undefined
      const component = UUIDComponent
      const TestUUID1 = 'TestUUID1' as EntityUUID
      const TestUUID2 = 'TestUUID2' as EntityUUID
      const oneEntity = createEntity()
      const twoEntity = createEntity()
      let result: ResultType = undefined
      let counter = 0

      setComponent(oneEntity, UUIDComponent, TestUUID1)
      setComponent(twoEntity, UUIDComponent, TestUUID2)

      // Define the Reactor that will run the tested hook
      const Reactor = (props: { entity: Entity }) => {
        // Call the hook to set the data
        const data = useComponent(props.entity, component)
        useEffect(() => {
          result = data.value
          ++counter
        }, [data])
        return null
      }

      // Run the test case
      assert.equal(counter, 0, "The reactor shouldn't have run before rendering")
      const tag = <Reactor entity={oneEntity} />
      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))
      assert.equal(counter, 1, `The reactor has run an incorrect number of times: ${counter}`)
      assert.notEqual(result, undefined, "The result data didn't get initialized")
      assert.equal(result, TestUUID1)
      await act(() => rerender(<Reactor entity={twoEntity} />))
      assert.equal(result, TestUUID2)

      // Terminate the Reactor and Isolated Test
      unmount()
      return destroyEngine()
    })

    it('suspense should work', async () => {
      // Initialize the isolated case
      createEngine()
      ComponentMap.clear()

      // Initialize the dummy data
      const entity = createEntity()
      const TestComponent = defineComponent({ name: 'TestComponent' })
      let result = 0

      // Define the Reactor that will run the tested hook
      const Reactor = () => {
        result++
        const data = useComponent(entity, TestComponent)
        result++
        useEffect(() => {
          result++
        }, [data])
        return null
      }

      // Run the test case
      const tag = <Reactor />
      assert.equal(TestComponent.stateMap[entity]!, undefined)
      const { rerender, unmount } = render(tag)
      assert.equal(result, 1)

      setComponent(entity, TestComponent)
      await act(() => rerender(tag))
      assert.equal(result, 4)

      // Terminate the Reactor and Isolated Test
      unmount()
      return destroyEngine()
    })
  }) // useOptionalComponent : Isolated Test Cases

  // TODO
  // describe('defineQuery', () => {})
})
