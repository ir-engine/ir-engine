import { Quaternion, Vector3 } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class PortalComponent extends Component<PortalComponent> {
  location: string;
  displayText: string;
  spawnPosition: Vector3;
  spawnRotation: Quaternion;
}

PortalComponent._schema = {
  location: { type: Types.String, default: '' },
  displayText: { type: Types.String, default: '' },
  spawnPosition: { type: Types.Vector3Type, default: new Vector3() },
  spawnRotation: { type: Types.QuaternionType, default: new Quaternion() }
};
