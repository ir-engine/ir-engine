import { pipe } from '@xrengine/engine/src/ecs/bitecs'
import { GolfPlayerUISystem } from './GolfPlayerUISystem'
import { GolfScorecardUISystem } from './GolfScorecardUISystem'

export const GolfXRUISystem = pipe(GolfPlayerUISystem, GolfScorecardUISystem)
