import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class WebXRViewPoint extends Component<any> {
  static _schema = {
    pose: { type: Types.Ref }
  }
}
