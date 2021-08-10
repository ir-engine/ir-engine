/**
 * @author HydraFire <github.com/HydraFire>
 */

import { createMappedComponent } from "../../ecs/functions/EntityFunctions"

// its for adding new Action in State in One Plase, please don't splite this
export enum gameActions {
  GameObjectCollisionTag = 'GameObjectCollisionTag'
}

export const GameObjectCollisionTag = createMappedComponent<{}>()

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

export const Open = createMappedComponent<{}>()
export const Closed = createMappedComponent<{}>()
export const ButtonUp = createMappedComponent<{}>()
export const ButtonDown = createMappedComponent<{}>()
export const PanelUp = createMappedComponent<{}>()
export const PanelDown = createMappedComponent<{}>()
export const Waiting = createMappedComponent<{}>()
export const YourTurn = createMappedComponent<{}>()
export const WaitTurn = createMappedComponent<{}>()
export const SpawnedObject = createMappedComponent<{}>()
export const Active = createMappedComponent<{}>()
export const Inactive = createMappedComponent<{}>()

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
