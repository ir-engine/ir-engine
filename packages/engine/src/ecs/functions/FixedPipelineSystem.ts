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

  let accumulator = Engine.instance.elapsedSeconds - Engine.instance.fixedElapsedSeconds

  const { fixedDeltaSeconds: timestep, elapsedSeconds, fixedTick } = getState(EngineState)
  const engineState = getMutableState(EngineState)

  const maxMilliseconds = 8

  // If the difference between fixedElapsedTime and elapsedTime becomes too large,
  // we should simply skip ahead.
  const maxFixedFrameDelay = Math.max(1, Engine.instance.deltaSeconds / timestep)

  if (accumulator < 0) {
    engineState.fixedTick.set(Math.floor(elapsedSeconds / timestep))
    engineState.fixedElapsedSeconds.set(fixedTick * timestep)
  }

  let accumulatorDepleted = accumulator < timestep
  let timeout = timeUsed > maxMilliseconds
  let updatesLimitReached = false

  while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
    engineState.fixedTick.set(fixedTick + 1)
    engineState.fixedElapsedSeconds.set(fixedTick * timestep)

    executeSystem(SimulationSystemGroup)

    accumulator -= timestep

    const frameDelay = accumulator / timestep

    timeUsed = nowMilliseconds() - start
    accumulatorDepleted = accumulator < timestep
    timeout = timeUsed > maxMilliseconds

    if (frameDelay >= maxFixedFrameDelay) {
      engineState.fixedTick.set(Math.floor(elapsedSeconds / timestep))
      engineState.fixedElapsedSeconds.set(fixedTick * timestep)
      break
    }
  }
}
