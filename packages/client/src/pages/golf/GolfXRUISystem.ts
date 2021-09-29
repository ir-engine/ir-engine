import { World } from '@xrengine/engine/src/ecs/classes/World'
import { GolfPlayerUISystem } from './GolfPlayerUISystem'
import { GolfScorecardUISystem } from './GolfScorecardUISystem'
import { GolfCourseScoreUISystem } from './GolfCourseScoreUISystem'
import { pipe } from 'bitecs'

export default async function GolfXRUISystem(world: World) {
  // prettier-ignore
  return pipe(
    await GolfPlayerUISystem(world),
    await GolfScorecardUISystem(world),
    await GolfCourseScoreUISystem(world),
  )
}
