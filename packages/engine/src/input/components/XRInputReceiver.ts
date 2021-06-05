import { Quaternion, Vector3, Group } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class XRInputReceiver extends Component<XRInputReceiver> {
    head: Group;
    headGroup: Group;
    controllerLeft: Group;
    controllerRight: Group;
    controllerGripLeft: Group;
    controllerGripRight: Group;

  static _schema = {
    head: { type: Types.Ref, default: null },
    headGroup: { type: Types.Ref, default: null },
    controllerLeft: { type: Types.Ref, default: null },
    controllerRight: { type: Types.Ref, default: null },
    controllerGripLeft: { type: Types.Ref, default: null },
    controllerGripRight: { type: Types.Ref, default: null },
  }
}
