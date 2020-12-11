import { Component } from '../../ecs/classes/Component';
import { Vector3, Quaternion, Euler } from 'three';
import { Types } from '../../ecs/types/Types';

export class DesiredTransformComponent extends Component<DesiredTransformComponent> {
  position: Vector3
  rotation: Quaternion

  constructor () {
    super();
    this.reset();
  }

  copy(src: { position?: Vector3, rotation?: Vector3 }): this {
    if (src.position) {
      this.position.copy(src.position);
    }
    if (src.rotation) {
      this.rotation.setFromEuler(new Euler().setFromVector3(src.rotation,'XYZ'));
    }

    return this;
  }

  reset (): void {
    this.position = new Vector3();
    this.rotation = new Quaternion();
  }
}

DesiredTransformComponent._schema = {
  position: { default: new Vector3(), type: Types.Ref },
  rotation: { default: new Quaternion(), type: Types.Ref }
};
