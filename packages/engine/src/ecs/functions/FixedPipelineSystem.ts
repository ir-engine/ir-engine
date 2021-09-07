import { defineSystem, System } from 'bitecs'
import { now } from '../../common/functions/now'
import { ECSWorld } from '../../ecs/classes/World'

/**
 * System for running simulation logic with fixed time intervals
 * @author Josh Field <github.com/hexafield>
 */

export const FixedPipelineSystem = async (args: { updatesPerSecond: number }): Promise<System> => {
  const subsequentErrorsLimit = 10
  const subsequentErrorsResetLimit = 1000
  let subsequentErrorsShown = 0
  let shownErrorPreviously = false
  let accumulator = 0

  const timestep = 1 / args.updatesPerSecond
  const limit = timestep * 1000
  const updatesLimit = args.updatesPerSecond

  return defineSystem((world: ECSWorld) => {
    world.fixedDelta = timestep

    const start = now()
    let timeUsed = 0
    let updatesCount = 0

    accumulator += world.delta

    let accumulatorDepleted = accumulator < timestep
    let timeout = timeUsed > limit
    let updatesLimitReached = updatesCount > updatesLimit

    while (!accumulatorDepleted && !timeout && !updatesLimitReached) {
      world.world.logicPipeline(world)

      accumulator -= timestep
      ++updatesCount

      timeUsed = now() - start
      accumulatorDepleted = accumulator < timestep
      timeout = timeUsed > limit
      updatesLimitReached = updatesCount >= updatesLimit
    }

    if (!accumulatorDepleted) {
      if (subsequentErrorsShown <= subsequentErrorsLimit) {
      } else {
        if (subsequentErrorsShown > subsequentErrorsResetLimit) {
          subsequentErrorsShown = subsequentErrorsLimit - 1
        }
      }

      if (shownErrorPreviously) {
        subsequentErrorsShown++
      }
      shownErrorPreviously = true

      accumulator = accumulator % timestep
    } else {
      subsequentErrorsShown = 0
      shownErrorPreviously = false
    }

    return world
  })
}
