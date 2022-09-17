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
  const maxTimeDifference = 2

  const execute = () => {
    const start = nowMilliseconds()
    let timeUsed = 0
    let updatesCount = 0

    let accumulator = world.elapsedSeconds - world.fixedElapsedSeconds

    const engineState = getState(EngineState)

    const timestep = engineState.fixedDeltaSeconds.value
    const limit = timestep * 2000
    const updatesLimit = 1 / timestep

    let accumulatorDepleted = accumulator < timestep
    let timeout = timeUsed > limit
    let updatesLimitReached = updatesCount > updatesLimit

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
      updatesLimitReached = updatesCount >= updatesLimit

      if (updatesLimitReached || accumulator > maxTimeDifference) {
        logger.warn(
          `[FixedPipelineSystem]: The FIXED pipeline is behind by %d seconds! catching up...`,
          world.elapsedSeconds - world.fixedElapsedSeconds
        )
        engineState.fixedTick.set(Math.floor(engineState.elapsedSeconds.value / timestep))
        engineState.fixedElapsedSeconds.set(engineState.fixedTick.value * timestep)
      }
    }

    if (world.elapsedSeconds - world.fixedElapsedSeconds > timestep)
      logger.warn(
        `[FixedPipelineSystem]: The FIXED pipeline is behind more than the fixed delta! %n`,
        world.elapsedSeconds - world.fixedElapsedSeconds
      )
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
