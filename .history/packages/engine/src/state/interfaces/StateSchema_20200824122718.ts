import { Behavior } from '../../common/interfaces/Behavior';
import { StateAlias } from '../types/StateAlias';
import { StateGroupAlias } from '../types/StateGroupAlias';

export interface StateSchema {
  groups: {
    [key: number]: {
      exclusive: boolean
      states: StateAlias[]
      default?: StateAlias
    }
  }
  states: {
    [key: number]: {
      group?: StateGroupAlias
      component?: any
      blockedBy?: StateAlias
      overrides?: StateAlias
      canFindVehiclesToEnter?: boolean;
      canEnterVehicles?: boolean;
      canLeaveVehicles?: boolean
      animation?: string
      transitionDuration: number
      onAdded?: {
        behavior: Behavior
        args?: any
      }[]
      onChanged?: {
        behavior: Behavior
        args?: any
      }[]
      onUpdate?: {
        behavior: Behavior
        args?: any
      }[]
      onLateUpdate?: {
        behavior: Behavior
        args?: any
      }[]
      onRemoved?: {
        behavior: Behavior
        args?: any
      }[]
    }
  }
}
