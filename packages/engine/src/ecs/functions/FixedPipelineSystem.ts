import multiLogger from '@xrengine/common/src/logger'
import { getState } from '@xrengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { EngineState, getEngineState } from '../classes/EngineState'
import { World } from '../classes/World'
import { SystemUpdateType } from './SystemUpdateType'

const logger = multiLogger.child({ component: 'engine:ecs:FixedPipelineSystem' })
/**
 * System for running simulation logic with fixed time intervals
 */
export default function FixedPipelineSystem(world: World) {
  // If the difference between fixedElapsedTime and elapsedTime becomes too large,
  // we should simply skip ahead.
  const maxFixedFrameDelay = 4

  const execute = () => {
    const start = nowMilliseconds()
    let timeUsed = 0
    let updatesCount = 0

    let accumulator = world.elapsedSeconds - world.fixedElapsedSeconds

    const engineState = getState(EngineState)

    const timestep = engineState.fixedDeltaSeconds.value
    const limit = timestep * 2000

    let accumulatorDepleted = accumulator < timestep
    let timeout = timeUsed > limit
    let updatesLimitReached = false

    while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
      engineState.fixedTick.set(engineState.fixedTick.value + 1)
      engineState.fixedElapsedSeconds.set(engineState.fixedTick.value * timestep)

      for (const s of world.pipelines[SystemUpdateType.FIXED_EARLY]) s.enabled && s.execute()
      for (const s of world.pipelines[SystemUpdateType.FIXED]) s.enabled && s.execute()
      for (const s of world.pipelines[SystemUpdateType.FIXED_LATE]) s.enabled && s.execute()

      accumulator -= timestep
      ++updatesCount

      timeUsed = nowMilliseconds() - start
      accumulatorDepleted = accumulator < timestep
      timeout = timeUsed > limit
      const frameDelay = accumulator / timestep

      if (frameDelay > maxFixedFrameDelay) {
        logger.warn(`[FixedPipelineSystem]: FIXED pipeline is behind by %d frames! catching up...`, frameDelay)
        engineState.fixedTick.set(Math.floor(engineState.elapsedSeconds.value / timestep))
        engineState.fixedElapsedSeconds.set(engineState.fixedTick.value * timestep)
        break
      }
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
