import assert from 'assert'

import { defineState, getState, registerState } from '@xrengine/hyperflux'

import { createEngine, initializeCoreSystems } from '../../initializeEngine'
import { Engine } from '../classes/Engine'
import { World } from '../classes/World'
import { SystemUpdateType } from './SystemUpdateType'

const MockState = defineState({
  store: 'WORLD',
  name: 'MockState',
  initial: { count: 0 }
})

const MockSystemModulePromise = async () => {
  return {
    default: async (world: World) => {
      registerState(world.store, MockState)
      return () => {
        getState(world.store, MockState).count.set((c) => c + 1)
      }
    }
  }
}

describe('FixedPipelineSystem', () => {
  it('can run multiple fixed ticks to catch up to elapsed time', async () => {
    createEngine()

    Engine.instance.injectedSystems = [
      {
        systemModulePromise: MockSystemModulePromise(),
        type: SystemUpdateType.FIXED
      }
    ]

    await initializeCoreSystems()

    const world = Engine.instance.currentWorld
    const mockState = getState(world.store, MockState)

    assert.equal(world.elapsedTime, 0)
    assert.equal(world.fixedElapsedTime, 0)
    assert.equal(world.fixedTick, 0)
    assert.equal(mockState.count.value, 0)

    const ticks = 3
    const delta = ticks / 60
    world.execute(delta)
    assert.equal(world.elapsedTime, delta)
    assert.equal(world.fixedElapsedTime, delta)
    assert.equal(world.fixedTick, ticks)
    assert.equal(world.fixedDelta, 1 / 60)
    assert.equal(mockState.count.value, ticks)
  })

  it('can skip fixed ticks to catch up to elapsed time', async () => {
    createEngine()

    Engine.instance.injectedSystems = [
      {
        systemModulePromise: MockSystemModulePromise(),
        type: SystemUpdateType.FIXED
      }
    ]

    await initializeCoreSystems()

    const world = Engine.instance.currentWorld
    const mockState = getState(world.store, MockState)

    assert.equal(world.elapsedTime, 0)
    assert.equal(world.fixedElapsedTime, 0)
    assert.equal(world.fixedTick, 0)
    assert.equal(mockState.count.value, 0)

    const delta = 1000
    world.execute(delta)
    assert.equal(world.elapsedTime, delta)
    assert.equal(world.fixedElapsedTime, delta)
    assert.equal(world.fixedTick, 60000)
    assert((mockState.count.value * 1) / 60 < 5)
  })
})
