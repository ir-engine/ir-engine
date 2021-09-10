import { World } from '@xrengine/engine/src/ecs/classes/World'
import { GolfPlayerUISystem } from './GolfPlayerUISystem'
import { GolfScorecardUISystem } from './GolfScorecardUISystem'

export const GolfXRUISystem = async (world: World) => {
  const playerUISystem = await GolfPlayerUISystem()
  const scoreboardUISystem = await GolfScorecardUISystem()
  return () => {
    playerUISystem()
    scoreboardUISystem(world)
  }
}
