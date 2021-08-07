import { GolfPrefabTypes } from '../GolfGameConstants'
import { Component } from '../../../../ecs/classes/Component'

export class GolfBallTagComponent extends Component<GolfBallTagComponent> {}
export class GolfClubTagComponent extends Component<GolfClubTagComponent> {}

export const GolfPrefabs = {
  [GolfPrefabTypes.Ball]: GolfBallTagComponent,
  [GolfPrefabTypes.Club]: GolfClubTagComponent
}
