import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { getEngineState } from '../classes/EngineState'
import { World } from '../classes/World'
import { SystemUpdateType } from './SystemUpdateType'

/**
 * System for running simulation logic with fixed time intervals
 * @author Josh Field <github.com/hexafield>
 * @author Gheric Speiginer <github.com/speigg>
 */
export default async function FixedPipelineSystem(world: World, args: { tickRate: number }) {
  const timestep = 1 / args.tickRate
  const limit = timestep * 2000
  const updatesLimit = args.tickRate

  world.fixedDelta = timestep

  // If the difference between fixedElapsedTime and elapsedTime becomes too large,
  // we should simply skip ahead.
  const maxTimeDifference = 2

  return () => {
    const start = nowMilliseconds()
    let timeUsed = 0
    let updatesCount = 0

    let accumulator = world.elapsedTime - world.fixedElapsedTime

    let accumulatorDepleted = accumulator < timestep
    let timeout = timeUsed > limit
    let updatesLimitReached = updatesCount > updatesLimit

    while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
      world.fixedElapsedTime += world.fixedDelta
      world.fixedTick = Math.floor(world.fixedElapsedTime / world.fixedDelta)
      getEngineState().fixedTick.set(world.fixedTick)

      for (const s of world.pipelines[SystemUpdateType.FIXED_EARLY]) s.execute()
      for (const s of world.pipelines[SystemUpdateType.FIXED]) s.execute()
      for (const s of world.pipelines[SystemUpdateType.FIXED_LATE]) s.execute()

      accumulator -= world.fixedDelta
      ++updatesCount

      timeUsed = nowMilliseconds() - start
      accumulatorDepleted = accumulator < world.fixedDelta
      timeout = timeUsed > limit
      updatesLimitReached = updatesCount >= updatesLimit
    }

    if (updatesLimitReached || accumulator > maxTimeDifference) {
      console.warn(
        'FixedPipelineSystem: update limit reached, skipping world.fixedElapsedTime ahead to catch up with world.elapsedTime'
      )
      world.fixedElapsedTime = world.elapsedTime
      world.fixedTick = Math.floor(world.fixedElapsedTime / world.fixedDelta)
    }
  }
}
