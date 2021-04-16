import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { RaycastHitResults } from '../types/RaycastTypes';
import { RayCast } from '../classes/Raycast';

export class RaycastComponent extends Component<RaycastComponent> {

  // Bitmask
  raycastMask: number;
  hitResults: RaycastHitResults[];
  raycast: RayCast;
  
  static _schema = {
    raycastMask: { type: Types.Number, default: 0 },
    hitResults: { type: Types.Array, default: [] },
  }

  constructor(){
    super();
    this.init();
  }

  init(){
    this.raycast = new RayCast();
  }
}
