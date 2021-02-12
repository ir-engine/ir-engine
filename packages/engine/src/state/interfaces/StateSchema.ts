import { StateAlias } from '../types/StateAlias';

export interface StateSchemaValue {
    component?: any;
    blockedBy?: StateAlias;
    overrides?: StateAlias;
    canFindVehiclesToEnter?: boolean;
    canEnterVehicles?: boolean;
    canLeaveVehicles?: boolean;
    componentProperties?: {
      component: any;
      properties: {
        [key: string]: any;
      };
    }[];
    onEntry?: BehaviorAlias[];
    onChanged?: BehaviorAlias[];
    onUpdate?: BehaviorAlias[];
    onLateUpdate?: BehaviorAlias[];
    onExit?: BehaviorAlias[];
}

export interface BehaviorAlias {
  behavior: any;
  args?: any;
}

export interface StateSchema {
  default: number | string,
  states: {
    [key: number]: StateSchemaValue;
  };
}
