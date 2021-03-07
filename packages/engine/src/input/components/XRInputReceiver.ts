import { Quaternion, Vector3 } from 'three';
import { Component } from '../../ecs/classes/Component';

export class XRInputReceiver extends Component<XRInputReceiver> {
    headPosition = new Vector3(0,0,0);
    headRotation = new Quaternion();
    controllerLeft: any = null;
    controllerRight: any = null;
    controllerPositionLeft = new Vector3();
    controllerPositionRight = new Vector3();
    controllerRotationLeft = new Quaternion();
    controllerRotationRight = new Quaternion();
    controllerGripLeft: any = null;
    controllerGripRight: any = null;
    leftHandPhysicsBody: any = null;
    rightHandPhysicsBody: any = null;
}
