import assert from 'assert'
import * as bitecs from 'bitecs'

import { destroyEngine, Engine } from '../../src/ecs/classes/Engine'
import { Scene } from '../../src/ecs/classes/Scene'
import {
  addComponent,
  defineComponent,
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent
} from '../../src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../src/ecs/functions/EntityFunctions'
import { executeSystems, initSystems } from '../../src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../../src/ecs/functions/SystemUpdateType'
import { createEngine } from '../../src/initializeEngine'

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

const MocksystemLoader = async () => {
  return {
    default: MockSystemInitialiser
  }
}

const MockSystemState = new Map<Scene, Array<number>>()

async function MockSystemInitialiser(args: {}) {
  const mockQuery = defineQuery([MockComponent])
  MockSystemState.set(Engine.instance.currentScene, [])

  const execute = () => {
    const mockState = MockSystemState.get(Engine.instance.currentScene)!

    for (const entity of mockQuery.enter()) {
      mockState.push(entity)
    }

    for (const entity of mockQuery.exit()) {
      mockState.splice(mockState.indexOf(entity))
    }
  }

  return {
    execute,
    cleanup: async () => {}
  }
}

describe('ECS', () => {
  beforeEach(async () => {
    createEngine()
    const world = Engine.instance.currentScene
    await initSystems([
      {
        uuid: 'Mock',
        type: SystemUpdateType.UPDATE,
        systemLoader: () => MocksystemLoader()
      }
    ])
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should create ECS world', () => {
    const world = Engine.instance.currentScene
    assert(world)
    const entities = Engine.instance.entityQuery()
    assert(entities.includes(world.sceneEntity))
    assert(entities.includes(Engine.instance.cameraEntity))
  })

  it('should add systems', async () => {
    const world = Engine.instance.currentScene
    assert.strictEqual(Engine.instance.pipelines[SystemUpdateType.UPDATE].length, 1)
  })

  it('should add entity', async () => {
    const world = Engine.instance.currentScene
    const entityLengthBeforeCreate = Engine.instance.entityQuery().length
    const entity = createEntity()
    const entitiesAfterCreate = Engine.instance.entityQuery()
    assert(entitiesAfterCreate.includes(world.sceneEntity))
    assert(entitiesAfterCreate.includes(entity))
    assert.strictEqual(entitiesAfterCreate.length, entityLengthBeforeCreate + 1)
  })

  it('should support enter and exit queries', () => {
    const entity = createEntity()
    const query = defineQuery([MockComponent])

    assert.equal(query().length, 0)
    assert.equal(query.enter().length, 0)
    assert.equal(query.exit().length, 0)

    addComponent(entity, MockComponent, { mockValue: 42 })
    assert.ok(query().includes(entity))
    assert.equal(query.enter()[0], entity)
    assert.equal(query.exit().length, 0)

    removeComponent(entity, MockComponent)
    assert.ok(!query().includes(entity))
    assert.equal(query.enter().length, 0)
    assert.equal(query.exit()[0], entity)

    addComponent(entity, MockComponent, { mockValue: 43 })
    assert.ok(query().includes(entity))
    assert.equal(query.enter()[0], entity)
    assert.equal(query.exit().length, 0)

    removeComponent(entity, MockComponent)
    addComponent(entity, MockComponent, { mockValue: 44 })
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
    addComponent(entity, MockComponent, { mockValueWrong: 44 })

    removeComponent(entity, MockComponent)
    // @ts-expect-error - should have type error for wrong missing required property
    addComponent(entity, MockComponent, {})

    removeComponent(entity, MockComponent)
    // @ts-expect-error - should have type error for wrong value type
    addComponent(entity, MockComponent, { mockValue: 'hi' })
  })

  it('should add component', async () => {
    const entity = createEntity()
    const mockValue = Math.random()
    addComponent(entity, MockComponent, { mockValue })
    const component = getComponent(entity, MockComponent)
    assert(component)
    assert.strictEqual(component.mockValue, mockValue)
  })

  it('should query component in systems', async () => {
    const world = Engine.instance.currentScene

    const entity = createEntity()
    const mockValue = Math.random()
    addComponent(entity, MockComponent, { mockValue })
    const component = getComponent(entity, MockComponent)
    executeSystems(Engine.instance.startTime + mockDeltaMillis)
    assert.strictEqual(entity, MockSystemState.get(world)![0])

    const entity2 = createEntity()
    const mockValue2 = Math.random()
    addComponent(entity2, MockComponent, { mockValue: mockValue2 })
    const component2 = getComponent(entity2, MockComponent)
    executeSystems(Engine.instance.startTime + mockDeltaMillis * 2)
    assert.strictEqual(entity2, MockSystemState.get(world)![1])
  })

  it('should remove and clean up component', async () => {
    const world = Engine.instance.currentScene

    const entity = createEntity()
    const mockValue = Math.random()

    addComponent(entity, MockComponent, { mockValue })
    removeComponent(entity, MockComponent)

    const query = defineQuery([MockComponent])
    assert.deepStrictEqual([...query()], [])
    assert.deepStrictEqual(query.enter(), [])
    assert.deepStrictEqual(query.exit(), [])

    executeSystems(Engine.instance.startTime + mockDeltaMillis)
    assert.deepStrictEqual(MockSystemState.get(world)!, [])
  })

  it('should re-add component', async () => {
    const world = Engine.instance.currentScene
    const entity = createEntity()
    const state = MockSystemState.get(world)!

    const mockValue = Math.random()
    addComponent(entity, MockComponent, { mockValue })

    removeComponent(entity, MockComponent)
    executeSystems(Engine.instance.startTime + mockDeltaMillis)
    assert.deepStrictEqual(state, [])

    const newMockValue = 1 + Math.random()
    assert.equal(hasComponent(entity, MockComponent), false)
    addComponent(entity, MockComponent, { mockValue: newMockValue })
    assert.equal(hasComponent(entity, MockComponent), true)
    const component = getComponent(entity, MockComponent)
    assert(component)
    assert.strictEqual(component.mockValue, newMockValue)
    executeSystems(Engine.instance.startTime + mockDeltaMillis * 2)
    executeSystems(Engine.instance.startTime + mockDeltaMillis * 3)
    assert.strictEqual(entity, state[0])
  })

  it('should remove and clean up entity', async () => {
    const world = Engine.instance.currentScene

    const entity = createEntity()
    const mockValue = Math.random()
    addComponent(entity, MockComponent, { mockValue })
    const entities = Engine.instance.entityQuery()
    assert(entities.includes(entity))
    removeEntity(entity)
    assert.ok(!getOptionalComponent(entity, MockComponent))
    executeSystems(Engine.instance.startTime + mockDeltaMillis)
    assert.deepStrictEqual(MockSystemState.get(world)!, [])
    assert.ok(!Engine.instance.entityQuery().includes(entity))
  })

  it('should tolerate removal of same entity multiple times', async () => {
    const world = Engine.instance.currentScene
    createEntity()
    createEntity()
    createEntity()
    const entity = createEntity()

    const lengthBefore = Engine.instance.entityQuery().length
    removeEntity(entity)
    removeEntity(entity)
    removeEntity(entity)
    executeSystems(Engine.instance.startTime + mockDeltaMillis)

    const entities = Engine.instance.entityQuery()
    assert.equal(entities.length, lengthBefore - 1)
    assert.ok(!entities.includes(entity))
  })
})
