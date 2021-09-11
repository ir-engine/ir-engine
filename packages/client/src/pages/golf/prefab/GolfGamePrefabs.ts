import { GolfPrefabTypes } from '../GolfGameConstants'
import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export const GolfBallTagComponent = createMappedComponent('GolfBallTagComponent')
export const GolfClubTagComponent = createMappedComponent('GolfClubTagComponent')

export const GolfPrefabs = {
  [GolfPrefabTypes.Ball]: GolfBallTagComponent,
  [GolfPrefabTypes.Club]: GolfClubTagComponent
}
