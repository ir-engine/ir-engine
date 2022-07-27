import multiLogger from '@xrengine/common/src/logger'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { getEngineState } from '../classes/EngineState'
import { World } from '../classes/World'
import { SystemUpdateType } from './SystemUpdateType'

const logger = multiLogger.child({ component: 'engine:ecs:FixedPipelineSystem' })
/**
 * System for running simulation logic with fixed time intervals
 */
export default function FixedPipelineSystem(world: World, args: { tickRate: number }) {
  const timestep = 1 / args.tickRate
  const limit = timestep * 2000
  const updatesLimit = args.tickRate

  world.fixedDeltaSeconds = timestep

  // If the difference between fixedElapsedTime and elapsedTime becomes too large,
  // we should simply skip ahead.
  const maxTimeDifference = 2

  return () => {
    const start = nowMilliseconds()
    let timeUsed = 0
    let updatesCount = 0

    let accumulator = world.elapsedSeconds - world.fixedElapsedSeconds

    let accumulatorDepleted = accumulator < timestep
    let timeout = timeUsed > limit
    let updatesLimitReached = updatesCount > updatesLimit

    while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
      world.fixedElapsedSeconds += world.fixedDeltaSeconds
      world.fixedTick = Math.floor(world.fixedElapsedSeconds / world.fixedDeltaSeconds)
      getEngineState().fixedTick.set(world.fixedTick)

      for (const s of world.pipelines[SystemUpdateType.FIXED_EARLY]) s.enabled && s.execute()
      for (const s of world.pipelines[SystemUpdateType.FIXED]) s.enabled && s.execute()
      for (const s of world.pipelines[SystemUpdateType.FIXED_LATE]) s.enabled && s.execute()

      accumulator -= world.fixedDeltaSeconds
      ++updatesCount

      timeUsed = nowMilliseconds() - start
      accumulatorDepleted = accumulator < world.fixedDeltaSeconds
      timeout = timeUsed > limit
      updatesLimitReached = updatesCount >= updatesLimit
    }

    if (updatesLimitReached || accumulator > maxTimeDifference) {
      logger.warn(
        'FixedPipelineSystem: update limit reached, skipping world.fixedElapsedTime ahead to catch up with world.elapsedTime'
      )
      world.fixedElapsedSeconds = world.elapsedSeconds
      world.fixedTick = Math.floor(world.fixedElapsedSeconds / world.fixedDeltaSeconds)
    }
  }
}
