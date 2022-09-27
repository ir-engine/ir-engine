import assert from 'assert'

import { defineState, getState } from '@xrengine/hyperflux'

import { createEngine, setupEngineActionSystems } from '../../initializeEngine'
import { Engine } from '../classes/Engine'
import { World } from '../classes/World'
import { initSystems } from './SystemFunctions'
import { SystemUpdateType } from './SystemUpdateType'

const MockState = defineState({
  name: 'MockState',
  initial: { count: 0 }
})

const MocksystemLoader = async () => {
  return {
    default: async (world: World) => {
      return {
        execute: () => {
          getState(MockState).count.set((c) => c + 1)
        },
        cleanup: async () => {}
      }
    }
  }
}

describe('FixedPipelineSystem', () => {
  it('can run multiple fixed ticks to catch up to elapsed time', async () => {
    createEngine()
    setupEngineActionSystems()
    const world = Engine.instance.currentWorld

    const injectedSystems = [
      {
        uuid: 'Mock',
        systemLoader: () => MocksystemLoader(),
        type: SystemUpdateType.FIXED
      }
    ]
    await initSystems(world, injectedSystems)

    const mockState = getState(MockState)

    assert.equal(world.elapsedSeconds, 0)
    assert.equal(world.fixedElapsedSeconds, 0)
    assert.equal(world.fixedTick, 0)
    assert.equal(mockState.count.value, 0)

    const ticks = 3
    const deltaSeconds = ticks / 60
    world.execute(world.startTime + 1000 * deltaSeconds)
    assert.equal(world.elapsedSeconds, deltaSeconds)
    assert.equal(world.fixedElapsedSeconds, deltaSeconds)
    assert.equal(world.fixedTick, ticks)
    assert.equal(mockState.count.value, ticks)
  })

  it('can skip fixed ticks to catch up to elapsed time', async () => {
    createEngine()
    setupEngineActionSystems()
    const world = Engine.instance.currentWorld

    const injectedSystems = [
      {
        uuid: 'Mock',
        systemLoader: () => MocksystemLoader(),
        type: SystemUpdateType.FIXED
      }
    ]
    await initSystems(world, injectedSystems)

    const mockState = getState(MockState)

    world.startTime = 0
    assert.equal(world.elapsedSeconds, 0)
    assert.equal(world.fixedElapsedSeconds, 0)
    assert.equal(world.fixedTick, 0)
    assert.equal(mockState.count.value, 0)

    const deltaSeconds = 1000
    world.execute(1000 * deltaSeconds)
    assert.equal(world.elapsedSeconds, deltaSeconds)
    assert.equal(world.fixedElapsedSeconds, deltaSeconds)
    assert.equal(world.fixedTick, 60000)
    assert((mockState.count.value * 1) / 60 < 5)
  })
})
