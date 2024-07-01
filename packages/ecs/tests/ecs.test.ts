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
import { getAllEntities } from 'bitecs'

import { HyperFlux } from '@etherealengine/hyperflux'

import { ECS } from '..'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../src/ComponentFunctions'
import { createEngine, destroyEngine } from '../src/Engine'
import { Entity } from '../src/Entity'
import { AnimationSystemGroup } from '../src/SystemGroups'

const mockDeltaMillis = 1000 / 60

const MockComponent = defineComponent({
  name: 'MockComponent',
  onInit: (entity) => {
    return {
      mockValue: 0
    }
  },
  onSet: (entity, component, json: { mockValue: number }) => {
    if (typeof json?.mockValue === 'number') component.mockValue.set(json.mockValue)
  },
  toJSON: (entity, component) => {
    return {
      mockValue: component.mockValue.value
    }
  }
})

const MockSystemState = new Set<Entity>()

const mockQuery = ECS.defineQuery([MockComponent])

const execute = () => {
  for (const entity of mockQuery.enter()) {
    MockSystemState.add(entity)
  }

  for (const entity of mockQuery.exit()) {
    MockSystemState.delete(entity)
  }
}

const MockSystem = ECS.defineSystem({
  uuid: 'MockSystem',
  insert: { with: AnimationSystemGroup },
  execute
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
    const entity = ECS.createEntity()
    const entitiesAfterCreate = getAllEntities(HyperFlux.store)
    assert(entitiesAfterCreate.includes(entity))
    assert.strictEqual(entitiesAfterCreate.length, entityLengthBeforeCreate + 1)
  })

  it('should support enter and exit queries', () => {
    const entity = ECS.createEntity()
    const query = ECS.defineQuery([MockComponent])

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

    removeComponent(entity, MockComponent)
    // @ts-expect-error - should have type error for wrong unknown property
    setComponent(entity, MockComponent, { mockValueWrong: 44 })

    removeComponent(entity, MockComponent)
    // @ts-expect-error - should have type error for wrong missing required property
    setComponent(entity, MockComponent, {})

    removeComponent(entity, MockComponent)
    // @ts-expect-error - should have type error for wrong value type
    setComponent(entity, MockComponent, { mockValue: 'hi' })
  })

  it('should add component', async () => {
    const entity = ECS.createEntity()
    const mockValue = Math.random()
    setComponent(entity, MockComponent, { mockValue })
    const component = getComponent(entity, MockComponent)
    assert(component)
    assert.strictEqual(component.mockValue, mockValue)
  })

  it('should query component in systems', async () => {
    const entity = ECS.createEntity()
    const mockValue = Math.random()
    setComponent(entity, MockComponent, { mockValue })
    const component = getComponent(entity, MockComponent)
    ECS.executeSystems(mockDeltaMillis)
    assert(MockSystemState.has(entity))

    const entity2 = ECS.createEntity()
    const mockValue2 = Math.random()
    setComponent(entity2, MockComponent, { mockValue: mockValue2 })
    const component2 = getComponent(entity2, MockComponent)
    ECS.executeSystems(mockDeltaMillis * 2)
    assert(MockSystemState.has(entity2))
  })

  it('should remove and clean up component', async () => {
    const entity = ECS.createEntity()
    const mockValue = Math.random()

    setComponent(entity, MockComponent, { mockValue })
    removeComponent(entity, MockComponent)

    const query = ECS.defineQuery([MockComponent])
    assert.deepStrictEqual([...query()], [])
    assert.deepStrictEqual(query.enter(), [])
    assert.deepStrictEqual(query.exit(), [])

    ECS.executeSystems(mockDeltaMillis)
    assert(!MockSystemState.has(entity))
  })

  it('should re-add component', async () => {
    const entity = ECS.createEntity()

    const mockValue = Math.random()
    setComponent(entity, MockComponent, { mockValue })

    removeComponent(entity, MockComponent)
    ECS.executeSystems(mockDeltaMillis)
    assert(!MockSystemState.has(entity))

    const newMockValue = 1 + Math.random()
    assert.equal(hasComponent(entity, MockComponent), false)
    setComponent(entity, MockComponent, { mockValue: newMockValue })
    assert.equal(hasComponent(entity, MockComponent), true)
    const component = getComponent(entity, MockComponent)
    assert(component)
    assert.strictEqual(component.mockValue, newMockValue)
    ECS.executeSystems(mockDeltaMillis * 2)
    ECS.executeSystems(mockDeltaMillis * 3)
    assert(MockSystemState.has(entity))
  })

  it('should remove and clean up entity', async () => {
    const entity = ECS.createEntity()
    const mockValue = Math.random()
    setComponent(entity, MockComponent, { mockValue })
    const entities = getAllEntities(HyperFlux.store)
    assert(entities.includes(entity))
    ECS.removeEntity(entity)
    assert.ok(!getOptionalComponent(entity, MockComponent))
    ECS.executeSystems(mockDeltaMillis)
    assert(!MockSystemState.has(entity))
    assert.ok(!getAllEntities(HyperFlux.store).includes(entity))
  })

  it('should remove entity', async () => {
    const entity = ECS.createEntity()

    const lengthBefore = getAllEntities(HyperFlux.store).length
    ECS.removeEntity(entity)
    const entities = getAllEntities(HyperFlux.store)
    assert.equal(entities.length, lengthBefore - 1)
  })

  it('should noop with entity that is already removed', async () => {
    const entity = ECS.createEntity()

    const lengthBefore = getAllEntities(HyperFlux.store).length

    ECS.removeEntity(entity)
    ECS.removeEntity(entity)

    const entities = getAllEntities(HyperFlux.store)
    assert.equal(entities.length, lengthBefore - 1)
  })
})
