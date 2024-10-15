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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import assert from 'assert'
import { afterEach } from 'mocha'

import { defineState, getMutableState } from '@ir-engine/hyperflux'

import { ECS } from '..'
import { ECSState } from './ECSState'
import { createEngine, destroyEngine } from './Engine'
import { defineSystem } from './SystemFunctions'
import { SimulationSystemGroup } from './SystemGroups'

const MockState = defineState({
  name: 'MockState',
  initial: { count: 0 }
})

const execute = () => {
  getMutableState(MockState).count.set((c) => c + 1)
}

const MockSystem = defineSystem({
  uuid: 'test.MockSystem',
  insert: { with: SimulationSystemGroup },
  execute
})

describe('SystemFunctions', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('can run multiple simulation ticks to catch up to elapsed time', async () => {
    const mockState = getMutableState(MockState)
    assert.equal(mockState.count.value, 0)

    const ticks = 3
    const simulationDelay = (ticks * 1001) / 60
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTime.set(performance.timeOrigin - simulationDelay)
    ECS.executeSystems(0)
    assert.equal(mockState.count.value, ticks)
  })

  it('can skip simulation ticks to catch up to elapsed time', async () => {
    const mockState = getMutableState(MockState)
    const ecsState = getMutableState(ECSState)

    assert.equal(mockState.count.value, 0)

    const simulationDelay = 1000 * 60 // 1 minute should be too much to catch up to wihtout skipping
    ecsState.simulationTime.set(performance.timeOrigin - simulationDelay)
    ECS.executeSystems(0)

    assert(performance.timeOrigin - ecsState.simulationTime.value < ecsState.simulationTimestep.value)
    assert.equal(mockState.count.value, 1)
  })
})
