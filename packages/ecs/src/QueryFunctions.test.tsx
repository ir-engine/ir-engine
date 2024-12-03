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
import React, { useEffect } from 'react'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { startReactor } from '@ir-engine/hyperflux'
import { ComponentMap, defineComponent, hasComponent, removeComponent, setComponent } from './ComponentFunctions'
import { createEngine, destroyEngine } from './Engine'
import { Entity, UndefinedEntity } from './Entity'
import { createEntity, removeEntity } from './EntityFunctions'
import { Query, ReactiveQuerySystem, defineQuery, useQuery } from './QueryFunctions'
import { SystemDefinitions } from './SystemFunctions'

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
    createEngine()
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

    beforeEach(() => {
      createEngine()
      entity1 = createEntity()
      entity2 = createEntity()
    })

    afterEach(() => {
      removeEntity(entity1)
      removeEntity(entity2)
      ComponentMap.clear()
      return destroyEngine()
    })

    it('should return entities that match the query', () => {
      const e1 = createEntity()
      const e2 = createEntity()
      setComponent(e1, ComponentA)
      setComponent(e1, ComponentB)
      setComponent(e2, ComponentA)
      setComponent(e2, ComponentB)
      let counter = 0
      let entities = [] as Entity[]

      const reactor = startReactor(() => {
        const query = useQuery([ComponentA, ComponentB])

        useEffect(() => {
          counter++
          entities = query
        }, [query])

        return null
      })

      assert.strictEqual(counter, 1)

      assert.strictEqual(entities.length, 2)
      assert.strictEqual(entities[0], e1)
      assert.strictEqual(entities[1], e2)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))
      assert.ok(hasComponent(entities[1], ComponentA))
      assert.ok(hasComponent(entities[1], ComponentB))
    })

    it('should return entities that match the query', async () => {
      const e1 = createEntity()
      setComponent(e1, ComponentA)
      setComponent(e1, ComponentB)
      let counter = 0
      let entities = [] as Entity[]

      const reactor = startReactor(() => {
        const query = useQuery([ComponentA, ComponentB])

        useEffect(() => {
          counter++
          entities = [...query]
        }, [query])

        return null
      })

      assert.strictEqual(counter, 1)
      assert.strictEqual(entities.length, 1)
      assert.strictEqual(entities[0], e1)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))

      const e2 = createEntity()
      setComponent(e2, ComponentA)
      setComponent(e2, ComponentB)
      SystemDefinitions.get(ReactiveQuerySystem)!.execute()
      await act(async () => render(<></>))
      assert.strictEqual(counter, 2)
      assert.strictEqual(entities.length, 2)
      assert.strictEqual(entities[0], e1)
      assert.strictEqual(entities[1], e2)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))
      assert.ok(hasComponent(entities[1], ComponentA))
      assert.ok(hasComponent(entities[1], ComponentB))
    })

    it('should update the entities when components change', async () => {
      const e1 = createEntity()
      const e2 = createEntity()
      setComponent(e1, ComponentA)
      setComponent(e1, ComponentB)
      setComponent(e2, ComponentA)
      setComponent(e2, ComponentB)
      let renderCounter = 0
      let effectCounter = 0
      let entities = [] as Entity[]

      const reactor = startReactor(() => {
        const query = useQuery([ComponentA, ComponentB])

        renderCounter++

        useEffect(() => {
          effectCounter++
          entities = [...query]
        }, [query])

        return null
      })

      assert.strictEqual(renderCounter, 1)
      assert.strictEqual(effectCounter, 1)
      assert.strictEqual(entities.length, 2)
      assert.strictEqual(entities[0], e1)
      assert.strictEqual(entities[1], e2)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))
      assert.ok(hasComponent(entities[1], ComponentA))
      assert.ok(hasComponent(entities[1], ComponentB))
      removeComponent(e1, ComponentB)

      SystemDefinitions.get(ReactiveQuerySystem)!.execute()
      await act(async () => render(<></>))

      assert.strictEqual(renderCounter, 2)
      assert.strictEqual(effectCounter, 2)
      assert.strictEqual(entities.length, 1)
      assert.strictEqual(entities[0], e2)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))
    })

    it('should update the entities when component is removed and added immediately', async () => {
      const e1 = createEntity()
      const e2 = createEntity()
      setComponent(e1, ComponentA)
      setComponent(e1, ComponentB)
      setComponent(e2, ComponentA)
      setComponent(e2, ComponentB)
      let counter = 0
      let entities = [] as Entity[]

      const reactor = startReactor(() => {
        const query = useQuery([ComponentA, ComponentB])

        useEffect(() => {
          counter++
          entities = [...query]
        }, [query])

        return null
      })

      assert.strictEqual(counter, 1)
      assert.strictEqual(entities.length, 2)
      assert.strictEqual(entities[0], e1)
      assert.strictEqual(entities[1], e2)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))
      assert.ok(hasComponent(entities[1], ComponentA))
      assert.ok(hasComponent(entities[1], ComponentB))

      removeComponent(e1, ComponentB)
      setComponent(e1, ComponentB)

      SystemDefinitions.get(ReactiveQuerySystem)!.execute()
      await act(async () => render(<></>))

      assert.equal(counter, 2)
      assert.strictEqual(entities.length, 2)
      assert.strictEqual(entities[0], e1)
      assert.strictEqual(entities[1], e2)
      assert.ok(hasComponent(entities[0], ComponentA))
      assert.ok(hasComponent(entities[0], ComponentB))
      assert.ok(hasComponent(entities[1], ComponentA))
      assert.ok(hasComponent(entities[1], ComponentB))
    })

    it(`should return an empty array when entities don't have the component`, async () => {
      const ExpectedValue: ResultType = []
      let counter = 0

      const Reactor = () => {
        const data = useQuery([component])
        useEffect(() => {
          result = data as ResultType
          ++counter
        }, [data])
        return null
      }

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
      let counter = 0
      const ExpectedValue: ResultType = [entity1, entity2]
      setComponent(entity1, component)
      setComponent(entity2, component)
      assert.equal(counter, 0, "The reactor shouldn't have run before rendering")

      const Reactor = () => {
        const data = useQuery([component])
        useEffect(() => {
          result = data as ResultType
          ++counter
        }, [data])
        return null
      }
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
