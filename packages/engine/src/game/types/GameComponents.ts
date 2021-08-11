/**
 * @author HydraFire <github.com/HydraFire>
 */

import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

// its for adding new Action in State in One Plase, please don't splite this
export enum gameActions {
  GameObjectCollisionTag = 'GameObjectCollisionTag'
}

export const GameObjectCollisionTag = createMappedComponent<{}>()
;(GameObjectCollisionTag as any).name = 'GameObjectCollisionTag'

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
;(Open as any).name = 'Open'
export const Closed = createMappedComponent<{}>()
;(Closed as any).name = 'Closed'
export const ButtonUp = createMappedComponent<{}>()
;(ButtonUp as any).name = 'ButtonUp'
export const ButtonDown = createMappedComponent<{}>()
;(ButtonDown as any).name = 'ButtonDown'
export const PanelUp = createMappedComponent<{}>()
;(PanelUp as any).name = 'PanelUp'
export const PanelDown = createMappedComponent<{}>()
;(PanelDown as any).name = 'PanelDown'
export const Waiting = createMappedComponent<{}>()
;(Waiting as any).name = 'Waiting'
export const YourTurn = createMappedComponent<{}>()
;(YourTurn as any).name = 'YourTurn'
export const SpawnedObject = createMappedComponent<{}>()
;(SpawnedObject as any).name = 'SpawnedObject'
export const Active = createMappedComponent<{}>()
;(Active as any).name = 'Active'
export const Inactive = createMappedComponent<{}>()
;(Inactive as any).name = 'Inactive'
export const WaitTurn = createMappedComponent<{}>()
;(WaitTurn as any).name = 'WaitTurn'

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
