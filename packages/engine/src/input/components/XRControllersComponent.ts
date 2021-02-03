import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class XRControllersComponent extends Component<any> {
  static _schema = {
    position: { type: Types.Ref, default: null },
    controller: { type: Types.Ref, default: null },
    // onStarted: { type: Ref },
    // onEnded: { type: Ref }
    controller1: { type: Types.Ref, default: null },
    controller2: { type: Types.Ref, default: null },
    position1: { type: Types.Ref, default: null },
    position2: { type: Types.Ref, default: null },
    rotation1: { type: Types.Ref, default: null },
    rotation2: { type: Types.Ref, default: null },
    controllerGrip1: { type: Types.Ref, default: null },
    controllerGrip2: { type: Types.Ref, default: null },
    physicsBody1: { type: Types.Ref, default: null },
    physicsBody2: { type: Types.Ref, default: null }
  }
}
