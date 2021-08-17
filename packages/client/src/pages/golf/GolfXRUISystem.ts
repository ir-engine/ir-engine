import { pipe } from '@xrengine/engine/src/ecs/bitecs'
import { GolfPlayerUISystem } from './GolfPlayerUISystem'
import { GolfScorecardUISystem } from './GolfScorecardUISystem'

export const GolfXRUISystem = async () => {
  const playerUISystem = await GolfPlayerUISystem()
  const scoreboardUISystem = await GolfScorecardUISystem()
  return pipe(playerUISystem, scoreboardUISystem)
}
