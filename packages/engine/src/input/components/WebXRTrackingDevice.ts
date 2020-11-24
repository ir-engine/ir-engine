import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export abstract class WebXRTrackingDevice extends Component<any> {
  static schema = {
    pose: { type: Types.Ref },
    handId: { type: Types.Number }
  }
}
