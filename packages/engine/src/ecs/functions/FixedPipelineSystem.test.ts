import assert from 'assert'

import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { createEngine, setupEngineActionSystems } from '../../initializeEngine'
import { Engine } from '../classes/Engine'
import { executeSystems, initSystems } from './SystemFunctions'
import { SystemUpdateType } from './SystemUpdateType'

const MockState = defineState({
  name: 'MockState',
  initial: { count: 0 }
})

const MocksystemLoader = async () => {
  return {
    default: async () => {
      return {
        execute: () => {
          getMutableState(MockState).count.set((c) => c + 1)
        },
        cleanup: async () => {}
      }
    }
  }
}

describe('FixedPipelineSystem', () => {
  it.skip('can run multiple fixed ticks to catch up to elapsed time', async () => {
    createEngine()
    setupEngineActionSystems()

    const injectedSystems = [
      {
        uuid: 'Mock',
        systemLoader: () => MocksystemLoader(),
        type: SystemUpdateType.FIXED
      }
    ]
    await initSystems(injectedSystems)

    const mockState = getMutableState(MockState)

    assert.equal(Engine.instance.elapsedSeconds, 0)
    assert.equal(Engine.instance.fixedElapsedSeconds, 0)
    assert.equal(Engine.instance.fixedTick, 0)
    assert.equal(mockState.count.value, 0)

    const ticks = 3
    const deltaSeconds = ticks / 60
    executeSystems(Engine.instance.startTime + 1000 * deltaSeconds)
    assert.equal(Engine.instance.elapsedSeconds, deltaSeconds)
    assert.equal(Engine.instance.fixedElapsedSeconds, deltaSeconds)
    assert.equal(Engine.instance.fixedTick, ticks)
    assert.equal(mockState.count.value, ticks)
  })

  it('can skip fixed ticks to catch up to elapsed time', async () => {
    createEngine()
    setupEngineActionSystems()

    const injectedSystems = [
      {
        uuid: 'Mock',
        systemLoader: () => MocksystemLoader(),
        type: SystemUpdateType.FIXED
      }
    ]
    await initSystems(injectedSystems)

    const mockState = getMutableState(MockState)

    Engine.instance.startTime = 0
    assert.equal(Engine.instance.elapsedSeconds, 0)
    assert.equal(Engine.instance.fixedElapsedSeconds, 0)
    assert.equal(Engine.instance.fixedTick, 0)
    assert.equal(mockState.count.value, 0)

    const deltaSeconds = 1000
    executeSystems(1000 * deltaSeconds)
    assert.equal(Engine.instance.elapsedSeconds, deltaSeconds)
    assert.equal(Engine.instance.fixedElapsedSeconds, deltaSeconds)
    assert.equal(Engine.instance.fixedTick, 60000)
    assert((mockState.count.value * 1) / 60 < 5)
  })
})
