import assert from 'assert'
import { Engine } from '../../src/ecs/classes/Engine'
import { System } from '../../src/ecs/classes/System'
import { createWorld, World } from '../../src/ecs/classes/World'
import { addComponent, createMappedComponent, defineQuery, getComponent, removeComponent } from '../../src/ecs/functions/ComponentFunctions'
import { registerSystem, SystemModulePromise } from '../../src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../../src/ecs/functions/SystemUpdateType'
import { createEntity,removeEntity } from '../../src/ecs/functions/EntityFunctions'
import { useWorld } from '../../src/ecs/functions/SystemHooks'
import { Entity } from '../../src/ecs/classes/Entity'

const mockDelta = 1/60
let mockElapsedTime = 0

const externalState: Entity[] = []

type MockComponentData = {
  mockValue: number
}

const MockComponent = createMappedComponent<MockComponentData>('MockComponent')

const MockSystemModulePromise = async () => {
  return {
    default: MockSystemInitialiser
  }
}

async function MockSystemInitialiser(world: World, args: {}): Promise<System> {
  const mockQuery = defineQuery([MockComponent])
  return () => {
    console.log('run')
    for(const entity of mockQuery.enter()) {
      console.log('Mock query enter', entity)
      externalState.push(entity)
      console.log('externalState', externalState)
    }

    for(const entity of mockQuery.exit()) {
      console.log('Mock query exit', entity)
      externalState.splice(externalState.indexOf(entity))
      console.log('externalState', externalState)
    }
  }
}

/**
 * This is designed as an integration test, not a unit test.
 */
describe('ECS', () => {

	it('should create ECS world', () => {
    Engine.currentWorld = createWorld()
    const world = useWorld()
		assert.strictEqual(Engine.worlds.length, 1)
		assert.strictEqual(world.entities.length, 1)
		assert.strictEqual(world.entities[0], Engine.currentWorld.worldEntity)
	})

  it('should add systems', async () => {
    registerSystem(SystemUpdateType.UPDATE, MockSystemModulePromise())
    const world = useWorld()
    await world.initSystems()
		assert.strictEqual(world.freeSystems.length, 1)
  })

  it('should add entity', async () => {
    const entity = createEntity()
    const world = useWorld()
    
		assert.strictEqual(world.entities.length, 2)
		assert.strictEqual(world.entities[0], world.worldEntity)
		assert.strictEqual(world.entities[1], entity)
  })

  it('should add component', async () => {
    const world = useWorld()
    const entity = world.entities[1]
    const mockValue = Math.random()
    addComponent(entity, MockComponent, { mockValue })
    const component = getComponent(entity, MockComponent)
		assert(component)
		assert.strictEqual(component.mockValue, mockValue)
  })

  it('should query component', async () => {
    const world = useWorld()
    world.execute(mockDelta, mockElapsedTime += mockDelta)
		assert.strictEqual(world.entities[1], externalState[0])
  })

  it('should remove and clean up component', async () => {
    const world = useWorld()
    const entity = world.entities[1]
    removeComponent(entity, MockComponent)
    world.execute(mockDelta, mockElapsedTime += mockDelta)
		assert.deepStrictEqual(externalState, [])
  })

  it('should re-add component', async () => {
    const world = useWorld()
    const entity = world.entities[1]
    const newMockValue = Math.random()
    addComponent(entity, MockComponent, { mockValue: newMockValue })
    const component = getComponent(entity, MockComponent)
		assert(component)
		assert.strictEqual(component.mockValue, newMockValue)
  })

  it('should query component', async () => {
    const world = useWorld()
    world.execute(mockDelta, mockElapsedTime += mockDelta)
		assert.strictEqual(world.entities[1], externalState[0])
  })

  it('should remove and clean up entity', async () => {
    const world = useWorld()
    const entity = world.entities[1]
    removeEntity(entity)
    world.execute(mockDelta, mockElapsedTime += mockDelta)
		assert.deepStrictEqual(externalState, [])
		assert.deepStrictEqual(externalState, [])
  })
})