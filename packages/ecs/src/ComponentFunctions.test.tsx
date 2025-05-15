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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/
import assert from 'assert'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { act, render } from '@testing-library/react'
import React, { useEffect } from 'react'

import { proxySoAStore, removeEntity } from '@ir-engine/ecs'
import { DirectionalLight, Vector3 } from 'three'
import {
  ComponentMap,
  createEntity,
  defineComponent,
  deserializeComponent,
  getAllComponents,
  getComponent,
  getMutableComponent,
  hasComponent,
  hasComponents,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from './ComponentFunctions'
import { createEngine, destroyEngine } from './Engine'
import { Entity, EntityID, EntityUUID, EntityUUIDPair, SourceID, UndefinedEntity } from './Entity'
import { UUIDComponent } from './UUIDComponent'
import { createResizableTypeArray } from './bitecsLegacy'
import {
  CheckSchemaValue,
  CreateSchemaValue,
  HasValidSchemaValues,
  IsSingleValueSchema
} from './schemas/JSONSchemaUtils'
import { S } from './schemas/JSONSchemas'

class ProxyClass {
  x = 0
}

const proxifyClass = (store: { x: Float32Array }, entity: Entity, proxiedClass = new ProxyClass()): ProxyClass => {
  store.x[entity] = proxiedClass.x
  return Object.defineProperties(proxiedClass as ProxyClass, {
    entity: { value: entity, configurable: true, writable: true },
    store: { value: store, configurable: true, writable: true },
    x: {
      get() {
        return this.store.x[this.entity]
      },
      set(n) {
        return (this.store.x[this.entity] = n)
      },
      configurable: true
    }
  })
}

describe('ComponentFunctions', async () => {
  beforeEach(() => {
    createEngine()
    ComponentMap.clear()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('defineComponent', () => {
    it('should not deserialize if property does not match schema', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object({
          x: S.Number(),
          y: S.Number(),
          z: S.Number({ default: 4 })
        })
      })

      const entity = createEntity()
      // @ts-expect-error
      deserializeComponent(entity, Vector3Component, { otherval: 10 })
      const vector3Component = getComponent(entity, Vector3Component)
      assert.deepEqual(vector3Component, { x: 0, y: 0, z: 4 })
    })

    it('should not deserialize if property type does not match schema', () => {
      const NestedObjectComponent = defineComponent({
        name: 'NestedObjectComponent',
        schema: S.Object({
          obj: S.Object({
            num: S.Number()
          })
        })
      })

      const entity = createEntity()
      // @ts-expect-error
      deserializeComponent(entity, NestedObjectComponent, { obj: 'test' })
      const nestedObjectComponent = getComponent(entity, NestedObjectComponent)
      assert.deepEqual(nestedObjectComponent, { obj: { num: 0 } })
    })

    it('should deserialize if values match schema', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object({
          x: S.Number(),
          y: S.Number(),
          z: S.Number({ default: 4 })
        })
      })

      const entity = createEntity()
      setComponent(entity, Vector3Component, { x: 12, y: 24, z: 36 })
      const vector3Component = getComponent(entity, Vector3Component)
      assert.deepEqual(vector3Component, { x: 12, y: 24, z: 36 })
    })

    it('should create tag component', () => {
      const TagComponent = defineComponent({ name: 'TagComponent', onInit: () => true })

      assert.equal(TagComponent.name, 'TagComponent')
      assert.equal(typeof TagComponent.schema, 'undefined')
      assert.equal(typeof TagComponent.schema, 'undefined')
      assert.equal(ComponentMap.size, 1)
    })

    it('should create mapped component with SoA', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        storage: {
          x: createResizableTypeArray(Float32Array),
          y: createResizableTypeArray(Float32Array),
          z: createResizableTypeArray(Float32Array)
        }
      })

      assert.equal(Vector3Component.name, 'Vector3Component')
      assert(Vector3Component.x instanceof Float32Array)
      assert(Vector3Component.y instanceof Float32Array)
      assert(Vector3Component.z instanceof Float32Array)
      assert.equal(ComponentMap.size, 1)
    })

    it('should use default toJSON function if none is defined', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object({
          x: S.Number(),
          y: S.Number(),
          z: S.Number()
        })
      })

      const entity = createEntity()
      setComponent(entity, Vector3Component)
      const vector3Component = getComponent(entity, Vector3Component)
      const json = Vector3Component.toJSON(vector3Component)
      const fromSchema = CreateSchemaValue(entity, Vector3Component.schema)
      assert.deepEqual(vector3Component, fromSchema)
      assert.deepEqual(json, fromSchema)
      assert.deepEqual(json, vector3Component)
    })

    it('should use default onSet function if none is defined', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object({
          x: S.Number(),
          y: S.Number(),
          z: S.Number({ default: 4 })
        })
      })

      const setValue = { x: 12, y: 24 }
      const entity = createEntity()
      setComponent(entity, Vector3Component, setValue)
      const vector3Component = getComponent(entity, Vector3Component)
      assert(CheckSchemaValue(Vector3Component.schema, vector3Component))
      assert(vector3Component.x === setValue.x && vector3Component.y === setValue.y)
      assert(vector3Component.z === CreateSchemaValue(entity, Vector3Component.schema).z)
    })

    it('should override runtime data if onInit is specified', () => {
      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object({
          x: S.Number(),
          y: S.Number(),
          z: S.Number({ default: 4 })
        }),
        onInit: (initial) => new Vector3(initial.x, initial.y, initial.z)
      })

      const setValue = { x: 12, y: 24 }
      const entity = createEntity()
      setComponent(entity, Vector3Component, setValue)
      const vector3Component = getComponent(entity, Vector3Component)
      const fromSchema = CreateSchemaValue(entity, Vector3Component.schema)
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
          x: S.Number(),
          y: S.Number(),
          z: S.Number({ default: 4 })
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
          x: S.Number(),
          y: S.Number(),
          z: S.Number({ default: 4 })
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
          light: S.Class(() => new DirectionalLight(), { serialized: false }),
          other: S.Number()
        })
      })

      const TopLevelComponent = defineComponent({
        name: 'ObjComponent',
        schema: S.Number({ serialized: false })
      })

      const entity = createEntity()
      setComponent(entity, ObjComponent, { other: 12 })
      const objComponent = getComponent(entity, ObjComponent)
      const json = ObjComponent.toJSON(objComponent)
      assert(!('light' in json))
      assert('other' in json)
      // The previous assert erases type for some reason
      assert((json as any).other === 12)

      setComponent(entity, TopLevelComponent, 4)
      const topLevel = getComponent(entity, TopLevelComponent)
      assert(topLevel === 4)
      const nonJson = TopLevelComponent.toJSON(topLevel)
      assert(nonJson === null)
    })

    /** @todo this doesn't make any sense anymore, since a deserialized component will never deserialize into a required class, only ever into something like a vec3, color etc */
    // it('throws error when deserializeComponent is called without required fields', () => {
    //   const ObjComponent = defineComponent({
    //     name: 'ObjComponent',
    //     schema: S.Object({
    //       light: S.Required(S.Class(() => new DirectionalLight())),
    //       other: S.Number(0)
    //     })
    //   })

    //   const TopLevelComponent = defineComponent({
    //     name: 'ObjComponent',
    //     schema: S.Required(S.Class(() => new DirectionalLight()))
    //   })

    //   const entity = createEntity()
    //   const light = new DirectionalLight()
    //   assert.throws(() => deserializeComponent(entity, ObjComponent, { other: 12 }))
    //   assert.doesNotThrow(() => deserializeComponent(entity, ObjComponent, { light }))
    //   assert.throws(() => deserializeComponent(entity, TopLevelComponent), undefined)
    //   assert.doesNotThrow(() => deserializeComponent(entity, TopLevelComponent, light))
    // })

    it('uses schema initializers if they exist', () => {
      const spy = sinon.spy()

      const ObjComponent = defineComponent({
        name: 'ObjComponent',
        schema: S.Object({
          val: S.Number({
            deserialize: (curr, value) => {
              assert(curr === 4)
              spy()
              return value * 2
            },
            default: 4
          })
        })
      })

      const TopLevelComponent = defineComponent({
        name: 'ObjComponent',
        schema: S.Number({
          deserialize: (curr, value) => {
            assert(curr === 2)
            spy()
            return value * 3
          },
          default: 2
        })
      })

      const Vector3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.Object(
          {
            x: S.Number(),
            y: S.Number(),
            z: S.Number({ default: 4 })
          },
          {
            deserialize: (curr, value) => {
              return new Vector3(value.x, value.y, value.z)
            }
          }
        )
      })

      const Vec3Component = defineComponent({
        name: 'Vector3Component',
        schema: S.SerializedClass(
          () => new Vector3(),
          {
            x: S.Number(),
            y: S.Number(),
            z: S.Number()
          },
          {
            deserialize: (curr, value) => curr.copy(value),
            id: 'Vec3'
          }
        )
      })

      const entity = createEntity()

      deserializeComponent(entity, ObjComponent, { val: 12 })
      const objComponent = getComponent(entity, ObjComponent)
      assert(objComponent.val === 12 * 2)
      assert(spy.calledOnce)

      deserializeComponent(entity, TopLevelComponent, 6)
      const topLevelComponent = getComponent(entity, TopLevelComponent)
      assert(topLevelComponent === 6 * 3)
      assert(spy.calledTwice)

      const vec3 = new Vector3(12, 13, 14)
      deserializeComponent(entity, Vector3Component, new Vector3(12, 13, 14))
      const vector3Component = getComponent(entity, Vector3Component)
      assert(!(vector3Component instanceof Vector3))
      assert(vec3.x === vector3Component.x && vec3.y === vector3Component.y && vec3.z === vector3Component.z)
      assert(vec3 !== vector3Component)

      deserializeComponent(entity, Vec3Component)
      let vec3Component = getComponent(entity, Vec3Component)
      assert(vec3Component instanceof Vector3)
      assert(vec3Component.x === 0 && vec3Component.y === 0 && vec3Component.z === 0)

      const vec3Obj = { x: 11, y: 12, z: 13 }
      deserializeComponent(entity, Vec3Component, vec3Obj)
      vec3Component = getComponent(entity, Vec3Component)
      assert(vec3Obj.x === vec3Component.x && vec3Obj.y === vec3Component.y && vec3Obj.z === vec3Component.z)
      assert(vec3Obj !== vec3Component)
      assert(vec3Component instanceof Vector3)
    })

    it('ECS Schema number is proxied via proxySoAStore', () => {
      const proxyNumber = proxySoAStore(() => ProxyComponent.x)

      const ProxyComponent = defineComponent({
        name: 'ProxyComponent',
        schema: S.Object({
          x: S.Proxy(S.Number(), proxyNumber)
        }),
        storage: {
          x: createResizableTypeArray(Float32Array)
        }
      })

      const entity = createEntity()
      setComponent(entity, ProxyComponent)
      const proxyComponent = getComponent(entity, ProxyComponent)
      proxyComponent.x = 12
      assert(proxyComponent.x === 12)
      assert(proxyComponent.x === ProxyComponent.x[entity])
    })

    it('ECS Schema class is proxied', () => {
      const assignProxy = (entity: Entity): ProxyClass => proxifyClass(ProxyComponent.position, entity)

      const ProxyComponent = defineComponent({
        name: 'ProxyComponent',
        schema: S.Object({
          position: S.SerializedClass(assignProxy, { x: S.Number() })
        }),
        storage: {
          position: {
            x: createResizableTypeArray(Float32Array)
          }
        }
      })

      const entity = createEntity()
      setComponent(entity, ProxyComponent)
      const proxiedComponent = getComponent(entity, ProxyComponent)
      proxiedComponent.position.x = 12
      assert(proxiedComponent.position.x === 12)
      assert(proxiedComponent.position.x === ProxyComponent.position.x[entity])
    })

    describe('when `@param def`.schema is falsy ..', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        testEntity = createEntity()
      })

      afterEach(() => {
        removeEntity(testEntity)
      })

      it('should set Component.onSet to an empty function', () => {
        const Expected = 0

        const component = defineComponent({ name: 'TestComponent' })
        expect(component.schema).toBeFalsy()
        setComponent(testEntity, component, 21)
        const result = component.onSet.length

        expect(result).toBe(Expected)
      })
    })

    describe('when `@param def`.schema is truthy ..', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        testEntity = createEntity()
      })

      afterEach(() => {
        removeEntity(testEntity)
      })

      describe('.. when `@param def`.schema represents a single value ...', () => {
        describe('... when `@param def`.schema has a required schema value ....', () => {
          it('.... should set (closure)`@param Component`.onSet to a function that throws an error when `@param json` returns an invalid schema value based on the `(closure)@param def`.schema ', () => {
            const component = defineComponent({
              name: 'TestComponent',
              schema: S.Number({ default: 1234, required: true })
            })
            expect(IsSingleValueSchema(component.schema)).toBeTruthy()
            setComponent(testEntity, component, 21)
            const data = getComponent(testEntity, component)
            const value = 'SomeString'

            expect(() => {
              component.onSet(testEntity, data as any, value as any)
            }).toThrowError()
          })

          it('.... should set (closure)`@param Component`.onSet to a function that calls `@param component`.set with `@param component`.json as arguments', () => {
            const Expected = 42

            const component = defineComponent({
              name: 'TestComponent',
              schema: S.Number({ default: 1234, required: true })
            })
            expect(IsSingleValueSchema(component.schema)).toBeTruthy()
            setComponent(testEntity, component, 21)
            const data = getMutableComponent(testEntity, component)
            const value = Expected
            component.onSet(testEntity, data as any, value)

            const result = getComponent(testEntity, component)
            expect(result).toBe(Expected)
          })
        })

        describe('... when `@param def`.schema does not have a required schema value ....', () => {
          it(".... should set (closure)`@param Component`.onSet to a function that doesn't do anything (return early) when `@param json` is falsy", () => {
            const Expected = 42

            const component = defineComponent({ name: 'TestComponent', schema: S.Number({ default: 1234 }) })
            expect(IsSingleValueSchema(component.schema)).toBeTruthy()
            setComponent(testEntity, component, Expected)
            const data = getMutableComponent(testEntity, component)
            const value = 0 // Falsy value. Won't call onSet
            component.onSet(testEntity, data as any, value)

            const result = getComponent(testEntity, component)
            expect(result).toBe(Expected)
          })

          it('.... should set (closure)`@param Component`.onSet to a function that calls `@param component`.set with `@param component`.json as arguments', () => {
            const Expected = 42

            const component = defineComponent({ name: 'TestComponent', schema: S.Number({ default: 1234 }) })
            expect(IsSingleValueSchema(component.schema)).toBeTruthy()
            setComponent(testEntity, component, 21)
            const data = getMutableComponent(testEntity, component)
            const value = Expected
            component.onSet(testEntity, data as any, value)

            const result = getComponent(testEntity, component)
            expect(result).toBe(Expected)
          })
        })
      })

      describe('.. when `@param def`.schema represents multiple values ...', () => {
        describe('... when `@param def`.schema has a required schema value ....', () => {
          it('.... should set (closure)`@param Component`.onSet to a function that throws an error when `@param json` returns an invalid schema value based on the `(closure)@param def`.schema ', () => {
            const component = defineComponent({
              name: 'TestComponent',
              schema: S.Object({ one: S.Number({ default: 1234 }) }, { required: true })
            })
            expect(IsSingleValueSchema(component.schema)).toBeFalsy()
            setComponent(testEntity, component, { one: 21 })
            const data = getComponent(testEntity, component)
            const value = 'SomeString'

            expect(() => {
              component.onSet(testEntity, data as any, value as any)
            }).toThrowError()
          })

          /** @todo Array is not a multivalue. Is this branch ever reachable? */
          it.todo(
            '.... should set (closure)`@param Component`.onSet to a function that calls component.set with `@param json` as arguments when json is an array',
            () => {
              // 3. Set input & dependencies data
              // 1. Sanity check (input & dependencies)
              // 2. Run the process
              const component = defineComponent({
                name: 'TestComponent',
                schema: S.Object({ one: S.Number({ default: 1234 }) }, { required: true })
              })
              expect(IsSingleValueSchema(component.schema)).toBeFalsy()
              setComponent(testEntity, component, { one: 21 })
              const data = getComponent(testEntity, component)
              const value = [1, 2, 3]
              component.onSet(testEntity, data as any, value as any)

              const result = getComponent(testEntity, component)
            }
          )

          it(".... should set (closure)`@param Component`.onSet to a function that calls component.set with `@param json` as arguments when typeof json is not 'object'", () => {
            const component = defineComponent({
              name: 'TestComponent',
              schema: S.Object({ one: S.Number({ default: 1234 }) }, { required: true })
            })
            expect(IsSingleValueSchema(component.schema)).toBeFalsy()
            setComponent(testEntity, component, { one: 21 })
            const data = getMutableComponent(testEntity, component)
            const value = 'SomeString'
            component.onSet(testEntity, data as any, value as any)
            const result = getComponent(testEntity, component)

            expect(result).toBe(value)
          })

          it(".... should set (closure)`@param Component`.onSet to a function that calls component.merge with `@param json` as arguments when json is not an array and typeof json is 'object'", () => {
            const component = defineComponent({
              name: 'TestComponent',
              schema: S.Object({ one: S.Number({ default: 1234 }) }, { required: true })
            })
            expect(IsSingleValueSchema(component.schema)).toBeFalsy()
            setComponent(testEntity, component, { one: 21 })
            const data = getMutableComponent(testEntity, component)
            const value = { one: 42 }
            component.onSet(testEntity, data as any, value as any)
            const result = getComponent(testEntity, component)

            expect(result).toEqual(value)
          })
        })

        describe('... when `@param def`.schema does not have a required schema value ....', () => {
          it(".... should set (closure)`@param Component`.onSet to a function that doesn't do anything (return early) when `@param json` is falsy", () => {
            const Expected = { one: 21 }

            const component = defineComponent({
              name: 'TestComponent',
              schema: S.Object({ one: S.Number({ default: 1234 }) })
            })
            expect(IsSingleValueSchema(component.schema)).toBeFalsy()
            setComponent(testEntity, component, Expected)
            const data = getMutableComponent(testEntity, component)
            const value = 0
            component.onSet(testEntity, data as any, value as any)

            const result = getComponent(testEntity, component)
            expect(result).toEqual(Expected)
          })

          /** @todo Array is not a multivalue. Is this branch ever reachable? */
          it.todo(
            '.... should set (closure)`@param Component`.onSet to a function that calls component.set with `@param json` as arguments when json is an array',
            () => {
              // 3. Set input & dependencies data
              // 1. Sanity check (input & dependencies)
              // 2. Run the process
              const component = defineComponent({
                name: 'TestComponent',
                schema: S.Object({ one: S.Number({ default: 1234 }) })
              })
              expect(IsSingleValueSchema(component.schema)).toBeFalsy()
              setComponent(testEntity, component, { one: 21 })
              const data = getComponent(testEntity, component)
              const value = [1, 2, 3]
              component.onSet(testEntity, data as any, value as any)

              const result = getComponent(testEntity, component)
            }
          )

          it(".... should set (closure)`@param Component`.onSet to a function that calls component.set with `@param json` as arguments when typeof json is not 'object'", () => {
            const component = defineComponent({
              name: 'TestComponent',
              schema: S.Object({ one: S.Number({ default: 1234 }) })
            })
            expect(IsSingleValueSchema(component.schema)).toBeFalsy()
            setComponent(testEntity, component, { one: 21 })
            const data = getMutableComponent(testEntity, component)
            const value = 'SomeString'
            component.onSet(testEntity, data as any, value as any)
            const result = getComponent(testEntity, component)

            expect(result).toBe(value)
          })

          it(".... should set (closure)`@param Component`.onSet to a function that calls component.merge with `@param json` as arguments when json is not an array and typeof json is not 'object'", () => {
            const component = defineComponent({
              name: 'TestComponent',
              schema: S.Object({ one: S.Number({ default: 1234 }) })
            })
            expect(IsSingleValueSchema(component.schema)).toBeFalsy()
            setComponent(testEntity, component, { one: 21 })
            const data = getMutableComponent(testEntity, component)
            const value = { one: 42 }
            component.onSet(testEntity, data as any, value as any)
            const result = getComponent(testEntity, component)

            expect(result).toEqual(value)
          })
        })
      })
    })

    /** @todo Write the other Non-schema related unit tests for coverage */
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
      assert.ok(TestComponent.stateMap[entity] === undefined)
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

describe('deserializeComponent', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    return destroyEngine()
  })

  it('should throw an error if `@param Component`.schema is truthy, it has a required schema entry and one of the `@param json` values is not a valid required schema value', () => {
    const json = { one: 42, invalid: 'InvalidNumber' }
    const schema = S.Number({ required: true })
    const component = defineComponent({ name: 'TestComponent', schema: schema })

    expect(() => deserializeComponent(testEntity, component, json as any)).toThrowError()
  })

  it('should set the `@param Component` to `@param entity` when that entity does not have the component', () => {
    const Expected = true

    const json = { one: 42 }
    const schema = S.Object({ one: S.Number() }, { required: true })
    const component = defineComponent({ name: 'TestComponent', schema: schema })

    deserializeComponent(testEntity, component, json)

    const result = hasComponent(testEntity, component)
    expect(result).toBe(Expected)
  })

  it('should not do anything else (return early) when `@param json` is null', () => {
    const json = null
    const schema = S.String({ validate: () => false, default: 'TestString' }) // validate=>false   would always trigger the error, but we pass null to json
    const prev = 'PrevValue'
    const onSet = (_: any, component: any, value: string) => {
      component.set(value ?? 'Test')
    }
    const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: onSet })

    // 1. Sanity check (input & dependencies)
    expect(component.schema).toBeTruthy()
    expect(component.schema.options?.validate).toBeTruthy()
    expect(HasValidSchemaValues(schema, json, prev, testEntity)[0]).toBeFalsy()

    // @ts-expect-error Coerce null into string|undefined `@param json`
    expect(() => deserializeComponent(testEntity, component, json)).not.toThrowError()
  })

  it('should not do anything else (return early) when `@param json` is undefined', () => {
    const json = undefined
    const schema = S.String({ validate: () => false, default: 'TestString' }) // validate=>false   would always trigger the error, but we pass undefined to json
    const prev = 'PrevValue'
    const onSet = (_: any, component: any, value: string) => {
      component.set(value ?? 'Test')
    }
    const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: onSet })

    // 1. Sanity check (input & dependencies)
    expect(component.schema).toBeTruthy()
    expect(component.schema.options?.validate).toBeTruthy()
    expect(HasValidSchemaValues(schema, json, prev, testEntity)[0]).toBeFalsy()

    expect(() => deserializeComponent(testEntity, component, json)).not.toThrowError()
  })

  it('should throw an error if `@param Component`.schema is truthy, .schema has validators and HasValidSchemaValues returns invalid for `@param json`', () => {
    const json = 'Test42'
    const schema = S.String({ validate: () => false, default: 'TestString' }) // validate=>false   will always trigger the error for this case
    const prev = 'PrevValue'
    const onSet = (_: any, component: any, value: string) => {
      component.set(value ?? 'Test')
    }
    const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: onSet })

    // 1. Sanity check (input & dependencies)
    expect(component.schema).toBeTruthy()
    expect(component.schema.options?.validate).toBeTruthy()
    expect(HasValidSchemaValues(schema, json, prev, testEntity)[0]).toBeFalsy()

    expect(() => deserializeComponent(testEntity, component, json)).toThrowError()
  })

  it('should set a new value for the `@param Component` of `@param entity` using the (deserialized) value of `@param json`', () => {
    const Expected = 'ExpectedValue'

    const json = Expected
    const schema = S.String({ default: 'TestString' })
    const prev = 'PrevValue'
    const onSet = (_: any, component: any, value: string) => {
      component.set(value ?? 'Test')
    }
    const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: onSet })
    // 1. Sanity check (input & dependencies)
    expect(component.schema).toBeTruthy()
    expect(component.schema.options?.validate).not.toBeTruthy()
    expect(HasValidSchemaValues(schema, json, prev, testEntity)[0]).toBeTruthy()

    expect(() => deserializeComponent(testEntity, component, json)).not.toThrowError()
    const result = getComponent(testEntity, component)

    expect(result).toBe(Expected)
  })
}) //:: deserializeComponent

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
      const TestUUID1 = { entitySourceID: 'source1' as SourceID, entityID: 'id1' as EntityID } as EntityUUIDPair
      const TestUUID2 = { entitySourceID: 'source2' as SourceID, entityID: 'id2' as EntityID } as EntityUUIDPair
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
          result = UUIDComponent.join(data.value)
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
      assert.equal(result, UUIDComponent.join(TestUUID1))
      await act(() => rerender(<Reactor entity={twoEntity} />))
      assert.equal(result, UUIDComponent.join(TestUUID2))

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
      assert.equal(TestComponent.stateMap[entity], undefined)
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
