import { RaycastVehicle } from 'cannon-es';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class PlayerInCar extends Component<any> {
  state: any
  networkCarId: number
  currentFocusedPart: number
  animationSpeed: number
  currentFrame: number
  timeOut: number
  angel: number
}
PlayerInCar._schema = {
  state: { type: Types.Ref, default: null },
  networkCarId: { type: Types.Number, default: null },
  currentFocusedPart: { type: Types.Number, default: null },
  animationSpeed: { type: Types.Number, default: 0.2 },
  currentFrame: { type: Types.Number, default: 0 },
  timeOut: { type: Types.Number, default: 30 },
  angel: { type: Types.Number, default: Math.PI / 3.5 }
};
