import { getMutableState } from '@etherealengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { Engine } from '../classes/Engine'
import { EngineState } from '../classes/EngineState'
import { defineSystem, SimulationSystemGroup } from './SystemFunctions'

// const logger = multiLogger.child({ component: 'engine:ecs:FixedPipelineSystem' })
/**
 * System for running simulation logic with fixed time intervals
 */
const execute = () => {
  const start = nowMilliseconds()
  let timeUsed = 0

  let accumulator = Engine.instance.elapsedSeconds - Engine.instance.fixedElapsedSeconds

  const engineState = getMutableState(EngineState)

  const timestep = engineState.fixedDeltaSeconds.value
  const maxMilliseconds = 8

  // If the difference between fixedElapsedTime and elapsedTime becomes too large,
  // we should simply skip ahead.
  const maxFixedFrameDelay = Math.max(1, Engine.instance.deltaSeconds / timestep)

  if (accumulator < 0) {
    engineState.fixedTick.set(Math.floor(engineState.elapsedSeconds.value / timestep))
    engineState.fixedElapsedSeconds.set(engineState.fixedTick.value * timestep)
  }

  let accumulatorDepleted = accumulator < timestep
  let timeout = timeUsed > maxMilliseconds
  let updatesLimitReached = false

  while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
    engineState.fixedTick.set(engineState.fixedTick.value + 1)
    engineState.fixedElapsedSeconds.set(engineState.fixedTick.value * timestep)

    const s = Engine.instance.systemDefinitions.get(SimulationSystemGroup)!
    if (s.enabled) s.execute()

    accumulator -= timestep

    const frameDelay = accumulator / timestep

    timeUsed = nowMilliseconds() - start
    accumulatorDepleted = accumulator < timestep
    timeout = timeUsed > maxMilliseconds

    if (frameDelay >= maxFixedFrameDelay) {
      engineState.fixedTick.set(Math.floor(engineState.elapsedSeconds.value / timestep))
      engineState.fixedElapsedSeconds.set(engineState.fixedTick.value * timestep)
      break
    }
  }
}

export const FixedPipelineSystem = defineSystem({
  uuid: 'ee.engine.FixedPipelineSystem',
  execute
})
