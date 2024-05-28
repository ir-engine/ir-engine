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
