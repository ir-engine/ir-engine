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
import { afterEach, beforeEach, describe, it } from 'vitest'

import { HyperFlux } from '@ir-engine/hyperflux'

import { getAllEntities } from 'bitecs'
import {
  createEntity,
  defineComponent,
  entityExists,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '../src/ComponentFunctions'
import { createEngine, destroyEngine } from '../src/Engine'
import { defineQuery } from '../src/QueryFunctions'
import { S } from '../src/schemas/JSONSchemas'

const mockDeltaMillis = 1000 / 60

const MockComponent = defineComponent({
  name: 'MockComponent',
  schema: S.Object({
    mockValue: S.Number(0)
  })
})

describe('ECS', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should create ECS world', () => {
    const entities = getAllEntities(HyperFlux.store)
    assert(Array.isArray(entities))
    assert.equal(entities.length, 1)
  })

  it('should add entity', async () => {
    const entityLengthBeforeCreate = getAllEntities(HyperFlux.store).length
    const entity = createEntity()
    const entitiesAfterCreate = getAllEntities(HyperFlux.store)
    assert(entitiesAfterCreate.includes(entity))
    assert.strictEqual(entitiesAfterCreate.length, entityLengthBeforeCreate + 1)
  })

  it('should support enter and exit queries', () => {
    const entity = createEntity()
    const query = defineQuery([MockComponent])

    assert.equal(query().length, 0)
    assert.equal(query.enter().length, 0)
    assert.equal(query.exit().length, 0)

    setComponent(entity, MockComponent, { mockValue: 42 })
    assert.ok(query().includes(entity))
    assert.equal(query.enter()[0], entity)
    assert.equal(query.exit().length, 0)

    removeComponent(entity, MockComponent)
    assert.ok(!query().includes(entity))
    assert.equal(query.enter().length, 0)
    assert.equal(query.exit()[0], entity)

    setComponent(entity, MockComponent, { mockValue: 43 })
    assert.ok(query().includes(entity))
    assert.equal(query.enter()[0], entity)
    assert.equal(query.exit().length, 0)

    removeComponent(entity, MockComponent)
    setComponent(entity, MockComponent, { mockValue: 44 })
    assert.ok(query().includes(entity))
    let enter = query.enter()
    let exit = query.exit()
    assert.equal(enter.length, 1)
    assert.equal(enter[0], entity)

    /** @todo - revisit this with new bitecs release, enterQUery vs enterQueue */
    // assert.equal(exit.length, 0)
    // assert.equal(exit.length, 1)
    // assert.equal(exit[0], entity)

    // removeComponent(entity, MockComponent)
    // setComponent(entity, MockComponent, { mockValueWrong: 44 } as any)

    // removeComponent(entity, MockComponent)
    // setComponent(entity, MockComponent, {})

    // removeComponent(entity, MockComponent)
    // setComponent(entity, MockComponent, { mockValue: 'hi' } as any)
  })

  it('should add component', async () => {
    const entity = createEntity()
    const mockValue = Math.random()
    setComponent(entity, MockComponent, { mockValue })
    const component = getComponent(entity, MockComponent)
    assert(component)
    assert.strictEqual(component.mockValue, mockValue)
  })

  it('should remove and clean up component', async () => {
    const entity = createEntity()
    const mockValue = Math.random()

    setComponent(entity, MockComponent, { mockValue })
    removeComponent(entity, MockComponent)

    const query = defineQuery([MockComponent])
    assert.deepStrictEqual([...query()], [])
    assert.deepStrictEqual(query.enter(), [])
    assert.deepStrictEqual(query.exit(), [])
  })

  it('should re-add component', async () => {
    const entity = createEntity()

    const mockValue = Math.random()
    setComponent(entity, MockComponent, { mockValue })

    removeComponent(entity, MockComponent)

    const newMockValue = 1 + Math.random()
    assert.equal(hasComponent(entity, MockComponent), false)
    setComponent(entity, MockComponent, { mockValue: newMockValue })
    assert.equal(hasComponent(entity, MockComponent), true)
    const component = getComponent(entity, MockComponent)
    assert(component)
    assert.strictEqual(component.mockValue, newMockValue)
  })

  it('should remove and clean up entity', async () => {
    const entity = createEntity()
    const mockValue = Math.random()
    setComponent(entity, MockComponent, { mockValue })
    const entities = getAllEntities(HyperFlux.store)
    assert(entities.includes(entity))
    removeEntity(entity)
    assert.ok(!getOptionalComponent(entity, MockComponent))
    assert(!entityExists(entity))
    // assert.ok(!getAllEntities(HyperFlux.store).includes(entity))
  })

  it('should remove entity', async () => {
    const entity = createEntity()
    assert.ok(entityExists(entity))
    removeEntity(entity)
    assert.ok(!entityExists(entity))
  })

  it('should noop with entity that is already removed', async () => {
    const entity = createEntity()
    assert.ok(entityExists(entity))
    removeEntity(entity)
    removeEntity(entity)
    assert.ok(!entityExists(entity))
  })
})
