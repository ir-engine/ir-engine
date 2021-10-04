import { nowMilliseconds } from '../common/functions/nowMilliseconds'
import { World } from './World'
import { System } from './System'

/**
* Fixed pipeline system.
* It is a simple system that executes all systems in the fixed pipeline every fixed delta.
* It uses a fixed timestep of 1/updatesPerSecond.
* It executes the systems in the fixed pipeline every updatesLimit updates.
* @param world - World.
* @param args - Arguments.
* @return {@link System} - Fixed pipeline system.
*/
export default async function FixedPipelineSystem(world: World, args: { updatesPerSecond: number }): Promise<System> {
  let accumulator = 0

  const timestep = 1 / args.updatesPerSecond
  const limit = timestep * 1000
  const updatesLimit = args.updatesPerSecond

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

      for (const s of world.fixedSystems) s.execute()

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
