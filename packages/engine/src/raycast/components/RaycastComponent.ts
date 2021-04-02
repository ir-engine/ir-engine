import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { RaycastHitResults } from '../types/RaycastTypes';

export class RaycastComponent extends Component<RaycastComponent> {

  // Bitmask
  raycastMask: number;
  hitResults: RaycastHitResults[];
  
  static _schema = {
    raycastMask: { type: Types.Number, default: 0 },
    hitResults: { type: Types.Array, default: [] },
  }
}
