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

import { act, render } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'
import { ComponentMap, defineComponent, setComponent } from './ComponentFunctions'
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

describe('QueryFunctions', () => {
  const component = defineComponent({ name: 'TestComponent' })
  let entity1 = UndefinedEntity
  let entity2 = UndefinedEntity

  beforeEach(() => {
    startEngine()
    ComponentMap.clear()
    entity1 = createEntity()
    entity2 = createEntity()
  })

  afterEach(() => {
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
  })
})

describe('QueryFunctions Hooks', async () => {
  describe('useQuery', async () => {
    const component = defineComponent({ name: 'TestComponent' })
    const InitialValue = [123456789 as Entity, 987654321 as Entity]
    let entity1 = UndefinedEntity
    let entity2 = UndefinedEntity
    let result = InitialValue

    beforeEach(() => {
      startEngine()
      ComponentMap.clear()
      entity1 = createEntity()
      entity2 = createEntity()
    })

    afterEach(() => {
      removeEntity(entity1)
      removeEntity(entity2)
      return destroyEngine()
    })

    // Define the Reactor that will run the tested hook
    const Reactor = () => {
      const data = useQuery([component])
      useEffect(() => {
        result = data as Entity[]
      }, [data])
      return null
    }

    it('should return an empty array when entities have the component', async () => {
      const ExpectedValue = [] as Entity[]
      const tag = <Reactor />
      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))
      assertArrayNotEqual(
        result,
        InitialValue,
        `The result data did not get assigned.\n  result = ${result}\n  initial = ${InitialValue}`
      )
      assertArrayEqual(
        result,
        ExpectedValue,
        `Did not return the correct data.\n  result = ${result}\n  expected = ${ExpectedValue}`
      )
      unmount()
    })

    it('should return the list of entities that have the component', async () => {
      const ExpectedValue = [entity1, entity2]
      setComponent(entity1, component)
      setComponent(entity2, component)
      const tag = <Reactor />
      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))
      assertArrayNotEqual(
        result,
        InitialValue,
        `The result data did not get assigned.\n  result = ${result}\n  initial = ${InitialValue}`
      )
      assertArrayEqual(
        result,
        ExpectedValue,
        `Did not return the correct data.\n  result = ${result}\n  expected = ${ExpectedValue}`
      )
      unmount()
    })
  })
})
