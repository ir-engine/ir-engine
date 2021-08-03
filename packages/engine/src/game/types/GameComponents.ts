import { Component } from '../../ecs/classes/Component'
// Action Components
import { GameObjectCollisionTag } from '../actions/GameObjectCollisionTag'
// State TagComponents
import { SpawnedObject } from '../templates/gameDefault/components/SpawnedObjectTagComponent'
import { ButtonDown } from '../templates/gameDefault/components/ButtonDownTagComponent'
import { ButtonUp } from '../templates/gameDefault/components/ButtonUpTagComponent'
import { Closed } from '../templates/gameDefault/components/ClosedTagComponent'
import { Open } from '../templates/gameDefault/components/OpenTagComponent'
import { PanelDown } from '../templates/gameDefault/components/PanelDownTagComponent'
import { PanelUp } from '../templates/gameDefault/components/PanelUpTagComponent'
import { Active } from '../templates/gameDefault/components/ActiveTagComponent'
import { Inactive } from '../templates/gameDefault/components/InactiveTagComponent'
import { YourTurn } from '../templates/gameDefault/components/YourTurnTagComponent'
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
