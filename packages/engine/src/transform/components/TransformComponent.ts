import { Component } from '../../ecs/classes/Component';
import { Vector3, Quaternion } from 'three';
import { Types } from '../../ecs/types/Types';

export class TransformComponent extends Component<TransformComponent> {
  position: Vector3
  rotation: Quaternion
  velocity: Vector3

  constructor () {
    super();
    this.reset();
  }

  copy(src: { position?: Vector3, rotation?: Quaternion, velocity?: Vector3 }): this {
    if (src.position) {
      this.position.copy(src.position);
    }
    if (src.rotation) {
      this.rotation.copy(src.rotation);
    }
    if (src.velocity) {
      this.velocity.copy(src.velocity);
    }

    return this;
  }

  reset (): void {
    this.position = new Vector3();
    this.rotation = new Quaternion();
    this.velocity = new Vector3();
  }
}

TransformComponent.schema = {
  position: { default: new Vector3(), type: Types.Ref },
  rotation: { default: new Quaternion(), type: Types.Ref },
  velocity: { default: new Vector3(), type: Types.Ref }
};