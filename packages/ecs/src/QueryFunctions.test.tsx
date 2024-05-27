import { renderHook } from '@testing-library/react'
import assert from 'assert'
import { ComponentMap, defineComponent, hasComponent, removeComponent, setComponent } from './ComponentFunctions'
import { destroyEngine, startEngine } from './Engine'
import { createEntity } from './EntityFunctions'
import { defineQuery, useQuery } from './QueryFunctions'

const ComponentA = defineComponent({ name: 'ComponentA' })
const ComponentB = defineComponent({ name: 'ComponentB' })

describe('QueryFunctions', () => {
  beforeEach(() => {
    startEngine()
  })

  afterEach(() => {
    ComponentMap.clear()
    return destroyEngine()
  })

  describe('defineQuery', () => {
    it('should define a query with the given components', () => {
      const query = defineQuery([ComponentA, ComponentB])
      assert.ok(query)
      let entities = query()
      assert.ok(entities)
      assert.strictEqual(entities.length, 0) // No entities yet

      const e1 = createEntity()
      const e2 = createEntity()
      setComponent(e1, ComponentA)
      setComponent(e1, ComponentB)
      setComponent(e2, ComponentA)
      setComponent(e2, ComponentB)
      setComponent(createEntity(), ComponentA)
      setComponent(createEntity(), ComponentB)

      entities = query()
      assert.strictEqual(entities.length, 2)
      assert.strictEqual(entities[0], e1)
      assert.strictEqual(entities[1], e2)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))
    })
  })

  describe('useQuery', () => {
    it('should return entities that match the query', () => {
      const e1 = createEntity()
      const e2 = createEntity()
      setComponent(e1, ComponentA)
      setComponent(e1, ComponentB)
      setComponent(e2, ComponentA)
      setComponent(e2, ComponentB)
      const { result } = renderHook(() => useQuery([ComponentA, ComponentB])) // return correct results the first time
      const entities = result.current
      assert.strictEqual(entities.length, 2)
      assert.strictEqual(entities[0], e1)
      assert.strictEqual(entities[1], e2)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))
      assert.ok(hasComponent(entities[1], ComponentA))
      assert.ok(hasComponent(entities[1], ComponentB))
    })

    it('should update the entities when components change', () => {
      const e1 = createEntity()
      const e2 = createEntity()
      setComponent(e1, ComponentA)
      setComponent(e1, ComponentB)
      setComponent(e2, ComponentA)
      setComponent(e2, ComponentB)
      const { result, rerender } = renderHook(() => useQuery([ComponentA, ComponentB]))
      let entities = result.current
      assert.strictEqual(entities.length, 2)
      assert.strictEqual(entities[0], e1)
      assert.strictEqual(entities[1], e2)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))
      assert.ok(hasComponent(entities[1], ComponentA))
      assert.ok(hasComponent(entities[1], ComponentB))
      removeComponent(e1, ComponentB)
      rerender()
      entities = result.current
      assert.strictEqual(entities.length, 1)
      assert.strictEqual(entities[0], e2)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))
    })
  })
})
