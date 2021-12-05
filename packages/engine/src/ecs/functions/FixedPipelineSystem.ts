import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { World } from '../classes/World'
import { System } from '../classes/System'
import { SystemUpdateType } from './SystemUpdateType'

/**
 * System for running simulation logic with fixed time intervals
 * @author Josh Field <github.com/hexafield>
 * @author Gheric Speiginer <github.com/speigg>
 */
export default async function FixedPipelineSystem(world: World, args: { tickRate: number }): Promise<System> {
  let accumulator = 0

  const timestep = 1 / args.tickRate
  const limit = timestep * 1000
  const updatesLimit = args.tickRate

  return () => {
    world.fixedDelta = timestep

    const start = nowMilliseconds()
    let timeUsed = 0
    let updatesCount = 0

    accumulator += world.delta

    let accumulatorDepleted = accumulator < timestep
    let timeout = timeUsed > limit
    let updatesLimitReached = updatesCount > updatesLimit

    while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
      world.fixedElapsedTime += world.fixedDelta
      world.fixedTick += 1

      for (const s of world.pipelines[SystemUpdateType.FIXED_EARLY]) s.execute()
      for (const s of world.pipelines[SystemUpdateType.FIXED]) s.execute()
      for (const s of world.pipelines[SystemUpdateType.FIXED_LATE]) s.execute()

      accumulator -= timestep
      ++updatesCount

      timeUsed = nowMilliseconds() - start
      accumulatorDepleted = accumulator < timestep
      timeout = timeUsed > limit
      updatesLimitReached = updatesCount >= updatesLimit
    }

    if (!accumulatorDepleted) {
      accumulator = accumulator % timestep
    }
  }
}
