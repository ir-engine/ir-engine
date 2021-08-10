import { Component } from '../../ecs/classes/Component'
// Action Components
import { GameObjectCollisionTag } from '../actions/GameObjectCollisionTag'
// State TagComponents
import { SpawnedObject } from '../components/SpawnedObjectTagComponent'
import { ButtonDown } from '../components/ButtonDownTagComponent'
import { ButtonUp } from '../components/ButtonUpTagComponent'
import { Closed } from '../components/ClosedTagComponent'
import { Open } from '../components/OpenTagComponent'
import { PanelDown } from '../components/PanelDownTagComponent'
import { PanelUp } from '../components/PanelUpTagComponent'
import { Active } from '../components/ActiveTagComponent'
import { Inactive } from '../components/InactiveTagComponent'
import { YourTurn } from '../components/YourTurnTagComponent'
/**
 * @author HydraFire <github.com/HydraFire>
 */
// its for adding new Action in State in One Plase, please don't splite this
export enum gameActions {
  GameObjectCollisionTag = 'GameObjectCollisionTag'
}

export const Action = {
  [gameActions.GameObjectCollisionTag]: GameObjectCollisionTag
}
// its for adding new Action in State in One Plase, please don't splite this
export enum gameStates {
  Open = 'Open',
  Closed = 'Closed',
  ButtonUp = 'ButtonUp',
  ButtonDown = 'ButtonDown',
  PanelUp = 'PanelUp',
  PanelDown = 'PanelDown',

  Waiting = 'Waiting',
  YourTurn = 'YourTurn',
  WaitTurn = 'WaitTurn',

  SpawnedObject = 'SpawnedObject',

  Active = 'Active',
  Inactive = 'Inactive'
}

export class Waiting extends Component<any> {}
export class WaitTurn extends Component<any> {}

export const State = {
  [gameStates.Active]: Active,
  [gameStates.Inactive]: Inactive,
  [gameStates.Open]: Open,
  [gameStates.Closed]: Closed,
  [gameStates.ButtonUp]: ButtonUp,
  [gameStates.ButtonDown]: ButtonDown,
  [gameStates.PanelUp]: PanelUp,
  [gameStates.PanelDown]: PanelDown,
  [gameStates.Waiting]: Waiting,
  [gameStates.YourTurn]: YourTurn,
  [gameStates.WaitTurn]: WaitTurn,
  [gameStates.SpawnedObject]: SpawnedObject
}
