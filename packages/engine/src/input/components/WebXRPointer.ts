import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class WebXRPointer extends Component<any> {
  static schema = {
    pose: { type: Types.Ref },
    pointerMode: { type: Types.String }
  }
}
