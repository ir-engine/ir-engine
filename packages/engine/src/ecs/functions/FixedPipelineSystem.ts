import { getMutableState, getState } from '@etherealengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { Engine } from '../classes/Engine'
import { EngineState } from '../classes/EngineState'
import { SimulationSystemGroup } from './EngineFunctions'
import { executeSystem } from './SystemFunctions'

// const logger = multiLogger.child({ component: 'engine:ecs:FixedPipelineSystem' })
/**
 * System for running simulation logic with fixed time intervals
 */
export const executeFixedPipeline = () => {
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

    executeSystem(SimulationSystemGroup)

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
