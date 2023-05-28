import assert from 'assert'
import { afterEach } from 'mocha'

import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { createEngine } from '../../initializeEngine'
import { destroyEngine, Engine } from '../classes/Engine'
import { EngineState } from '../classes/EngineState'
import { executeSystems, PresentationSystemGroup, SimulationSystemGroup } from './EngineFunctions'
import { defineSystem, startSystem } from './SystemFunctions'

const MockState = defineState({
  name: 'MockState',
  initial: { count: 0 }
})

const execute = () => {
  getMutableState(MockState).count.set((c) => c + 1)
}

const MockSystem = defineSystem({
  uuid: 'test.MockSystem',
  execute
})

describe('FixedPipelineSystem', () => {
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('can run multiple simultion ticks to catch up to elapsed time', async () => {
    startSystem(MockSystem, { with: SimulationSystemGroup })

    const mockState = getMutableState(MockState)
    assert.equal(mockState.count.value, 0)

    const ticks = 3
    const simulationDelay = (ticks * 1001) / 60
    const engineState = getMutableState(EngineState)
    engineState.simulationTime.set(performance.timeOrigin - simulationDelay)
    executeSystems(0)
    assert.equal(mockState.count.value, ticks)
  })

  it('can skip simulation ticks to catch up to elapsed time', async () => {
    startSystem(MockSystem, { with: SimulationSystemGroup })

    const mockState = getMutableState(MockState)
    const engineState = getMutableState(EngineState)

    assert.equal(mockState.count.value, 0)

    const simulationDelay = 1000 * 60 // 1 minute should be too much to catch up to wihtout skipping
    engineState.simulationTime.set(performance.timeOrigin - simulationDelay)
    executeSystems(0)

    assert(performance.timeOrigin - engineState.simulationTime.value < engineState.simulationTimestep.value)
    assert.equal(mockState.count.value, 1)
  })
})
