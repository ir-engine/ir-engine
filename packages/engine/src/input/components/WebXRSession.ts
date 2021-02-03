import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class WebXRSession extends Component<any> {
  static _schema = {
    session: { type: Types.Ref },
    isImmersive: { type: Types.Boolean, default: false }
    // onStarted: { type: Ref },
    // onEnded: { type: Ref }
  }
}
