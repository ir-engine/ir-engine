import { Quaternion, Vector3, Group } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class XRInputReceiver extends Component<XRInputReceiver> {
    // headPosition = new Vector3(0,0,0);
    // headRotation = new Quaternion();
    head: Group;
    controllerLeft: Group;
    controllerRight: Group;
    // controllerPositionLeft = new Vector3();
    // controllerPositionRight = new Vector3();
    // controllerRotationLeft = new Quaternion();
    // controllerRotationRight = new Quaternion();
    controllerGripLeft: Group;
    controllerGripRight: Group;
    // leftHandPhysicsBody: any = null;
    // rightHandPhysicsBody: any = null;

  static _schema = {
    // headPosition: { type: Types.Ref, default: null },
    // headRotation: { type: Types.Ref, default: null },
    // onStarted: { type: Ref },
    // onEnded: { type: Ref }
    head: { type: Types.Ref, default: null },
    controllerLeft: { type: Types.Ref, default: null },
    controllerRight: { type: Types.Ref, default: null },
    // controllerPositionLeft: { type: Types.Ref, default: null },
    // controllerPositionRight: { type: Types.Ref, default: null },
    // controllerRotationLeft: { type: Types.Ref, default: null },
    // controllerRotationRight: { type: Types.Ref, default: null },
    controllerGripLeft: { type: Types.Ref, default: null },
    controllerGripRight: { type: Types.Ref, default: null },
    // leftHandPhysicsBody: { type: Types.Ref, default: null },
    // rightHandPhysicsBody: { type: Types.Ref, default: null }
  }
}
