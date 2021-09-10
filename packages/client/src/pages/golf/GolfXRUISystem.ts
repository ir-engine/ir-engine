import { World } from '@xrengine/engine/src/ecs/classes/World'
import { GolfPlayerUISystem } from './GolfPlayerUISystem'
import { GolfScorecardUISystem } from './GolfScorecardUISystem'

export default async function GolfXRUISystem(world: World) {
  const playerUISystem = await GolfPlayerUISystem(world)
  const scoreboardUISystem = await GolfScorecardUISystem(world)
  return () => {
    playerUISystem()
    scoreboardUISystem()
  }
}
