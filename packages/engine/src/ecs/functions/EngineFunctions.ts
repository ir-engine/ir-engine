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

/** Functions to provide engine level functionalities. */

import logger from '@etherealengine/engine/src/common/functions/logger'
import { HyperFlux, getMutableState, getState } from '@etherealengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { EngineState } from '../classes/EngineState'
import { SystemDefinitions, SystemUUID, executeSystem } from './SystemFunctions'
import { AnimationSystemGroup, InputSystemGroup, PresentationSystemGroup, SimulationSystemGroup } from './SystemGroups'

export const getDAG = (systemUUID: SystemUUID, depth = 0) => {
  const system = SystemDefinitions.get(systemUUID)
  if (!system) return

  for (const preSystem of system.preSystems) {
    getDAG(preSystem, depth + 1)
  }

  console.log('-'.repeat(depth), system.uuid.split('.').pop())

  for (const subSystem of system.subSystems) {
    getDAG(subSystem, depth + 1)
  }

  for (const postSystem of system.postSystems) {
    getDAG(postSystem, depth + 1)
  }
}

globalThis.getDAG = getDAG

const TimerConfig = {
  MAX_DELTA_SECONDS: 1 / 10
}

/**
 * Execute systems on this world
 *
 * @param elapsedTime the current frame time in milliseconds (DOMHighResTimeStamp) relative to performance.timeOrigin
 */
export const executeSystems = (elapsedTime: number) => {
  const engineState = getMutableState(EngineState)
  engineState.frameTime.set(performance.timeOrigin + elapsedTime)

  const start = nowMilliseconds()
  const incomingActions = [...HyperFlux.store.actions.incoming]

  const elapsedSeconds = elapsedTime / 1000
  engineState.deltaSeconds.set(
    Math.max(0.001, Math.min(TimerConfig.MAX_DELTA_SECONDS, elapsedSeconds - engineState.elapsedSeconds.value))
  )
  engineState.elapsedSeconds.set(elapsedSeconds)

  executeSystem(InputSystemGroup)
  executeFixedSystem(SimulationSystemGroup)
  executeSystem(AnimationSystemGroup)
  executeSystem(PresentationSystemGroup)

  for (const { query, result } of HyperFlux.store.reactiveQueryStates) {
    const entitiesAdded = query.enter().length
    const entitiesRemoved = query.exit().length
    if (entitiesAdded || entitiesRemoved) {
      result.set(query())
    }
  }

  const end = nowMilliseconds()
  const duration = end - start
  if (duration > 150) {
    logger.warn(`Long frame execution detected. Duration: ${duration}. \n Incoming actions: %o`, incomingActions)
  }
}

/**
 * System for running simulation logic with fixed time intervals
 */
export const executeFixedSystem = (systemUUID: SystemUUID) => {
  const start = nowMilliseconds()
  let timeUsed = 0

  const engineState = getMutableState(EngineState)
  const { frameTime, simulationTime, simulationTimestep } = getState(EngineState)

  let simulationDelay = frameTime - simulationTime

  const maxMilliseconds = 8

  // If the difference between simulationTime and frameTime becomes too large,
  // we should simply skip ahead.
  const maxSimulationDelay = 5000 // 5 seconds

  if (simulationDelay < simulationTimestep) {
    engineState.simulationTime.set(Math.floor(frameTime / simulationTimestep) * simulationTimestep)
    // simulation time is already up-to-date with frame time, so do nothing
    return
  }

  let timeout = timeUsed > maxMilliseconds
  let updatesLimitReached = false

  while (simulationDelay > simulationTimestep && !timeout && !updatesLimitReached) {
    engineState.simulationTime.set(
      (t) => Math.floor((t + simulationTimestep) / simulationTimestep) * simulationTimestep
    )

    executeSystem(systemUUID)

    simulationDelay -= simulationTimestep
    timeUsed = nowMilliseconds() - start
    timeout = timeUsed > maxMilliseconds

    if (simulationDelay >= maxSimulationDelay) {
      // fast-forward if the simulation is too far behind
      engineState.simulationTime.set((t) => Math.floor(frameTime / simulationTimestep) * simulationTimestep)
      break
    }
  }
}
