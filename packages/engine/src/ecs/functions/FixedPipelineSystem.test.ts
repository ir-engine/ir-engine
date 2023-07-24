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
import { afterEach } from 'mocha'

import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { createEngine } from '../../initializeEngine'
import { destroyEngine } from '../classes/Engine'
import { EngineState } from '../classes/EngineState'
import { executeSystems, SimulationSystemGroup } from './EngineFunctions'
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
