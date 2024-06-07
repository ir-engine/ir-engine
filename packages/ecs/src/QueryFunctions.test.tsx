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

import { act, render, renderHook } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'

import { ComponentMap, defineComponent, hasComponent, removeComponent, setComponent } from './ComponentFunctions'
import { destroyEngine, startEngine } from './Engine'
import { Entity, UndefinedEntity } from './Entity'
import { createEntity, removeEntity } from './EntityFunctions'
import { Query, defineQuery, useQuery } from './QueryFunctions'

function assertArrayEqual<T>(A: Array<T>, B: Array<T>, err = 'Arrays are not equal') {
  assert.equal(A.length, B.length, err)
  for (let id = 0; id < A.length && id < B.length; id++) {
    assert.deepEqual(A[id], B[id], err)
  }
}
function assertArrayNotEqual<T>(A: Array<T>, B: Array<T>, err = 'Arrays are equal') {
  for (let id = 0; id < A.length && id < B.length; id++) {
    assert.notDeepEqual(A[id], B[id], err)
  }
}

function assertQueryOk(Q: Query, err = 'Query is not Ok') {
  assert.doesNotThrow(Q.enter, err)
  assert.doesNotThrow(Q.exit, err)
  assert.doesNotThrow(Q, err)
}

function assertQueryNotOk(Q: Query, err = 'Query is Ok') {
  assert.throws(Q.enter, err)
  assert.throws(Q.exit, err)
  assert.throws(Q, err)
}

function assertDefinedQuery(Q: Query, expected: Entity[]) {
  assertQueryOk(Q, 'The test query did not get defined correctly')
  assertArrayNotEqual(Q(), [], 'The query did not return any entities.')
  assertArrayEqual(Q(), expected, 'The test query did not return the expected result')
}

const ComponentA = defineComponent({ name: 'ComponentA' })
const ComponentB = defineComponent({ name: 'ComponentB' })

describe('QueryFunctions', () => {
  const component = defineComponent({ name: 'TestComponent' })
  let entity1 = UndefinedEntity
  let entity2 = UndefinedEntity

  beforeEach(() => {
    startEngine()
    entity1 = createEntity()
    entity2 = createEntity()
  })

  afterEach(() => {
    ComponentMap.clear()
    removeEntity(entity1)
    removeEntity(entity2)
    return destroyEngine()
  })

  describe('defineQuery', () => {
    it('should create a valid query', () => {
      const query = defineQuery([component])
      setComponent(entity1, component)
      setComponent(entity2, component)
      assertDefinedQuery(query, [entity1, entity2])
    })

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
})

describe('QueryFunctions Hooks', async () => {
  describe('useQuery', () => {
    type ResultType = undefined | Entity[]
    const component = defineComponent({ name: 'TestComponent' })
    let entity1 = UndefinedEntity
    let entity2 = UndefinedEntity
    let result = undefined as ResultType
    let counter = 0

    beforeEach(() => {
      startEngine()
      entity1 = createEntity()
      entity2 = createEntity()
    })

    afterEach(() => {
      counter = 0
      removeEntity(entity1)
      removeEntity(entity2)
      ComponentMap.clear()
      return destroyEngine()
    })

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const data = useQuery([component])
      useEffect(() => {
        result = data as ResultType
        ++counter
      }, [data])
      return null
    }

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

    it(`should return an empty array when entities don't have the component`, async () => {
      const ExpectedValue: ResultType = []
      assert.equal(counter, 0, "The reactor shouldn't have run before rendering")
      const tag = <Reactor />
      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))
      assert.equal(counter, 1, `The reactor has run an incorrect number of times: ${counter}`)
      assert.notEqual(result, undefined, `The result data did not get assigned.`)
      assertArrayEqual(
        result as Entity[],
        ExpectedValue as Entity[],
        `Did not return the correct data.\n  result = ${result}`
      )
      unmount()
    })

    it('should return the list of entities that have the component', async () => {
      const ExpectedValue: ResultType = [entity1, entity2]
      setComponent(entity1, component)
      setComponent(entity2, component)
      assert.equal(counter, 0, "The reactor shouldn't have run before rendering")
      const tag = <Reactor />
      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))
      assert.equal(counter, 1, `The reactor has run an incorrect number of times: ${counter}`)
      assert.notEqual(result, undefined, `The result data did not get assigned.`)
      assertArrayEqual(
        result as Entity[],
        ExpectedValue as Entity[],
        `Did not return the correct data.\n  result = ${result}\n  expected = ${ExpectedValue}`
      )
      unmount()
    })
  })
})
