import { Component } from '../../ecs/classes/Component';
import { Vector3, Quaternion, Euler } from 'three';
import { Types } from '../../ecs/types/Types';

export class TransformComponent extends Component<TransformComponent> {
  position: Vector3
  rotation: Quaternion
  velocity: Vector3
  scale: Vector3

  static _schema = {
    position: { default: new Vector3(), type: Types.Ref },
    rotation: { default: new Quaternion(), type: Types.Ref },
    velocity: { default: new Vector3(), type: Types.Ref },
    scale: { default: new Vector3(1,1,1), type: Types.Ref }
  }

  constructor () {
    super();
    this.reset();
  }

  copy(src: { position?: Vector3, rotation?: Quaternion, scale?: Vector3, velocity?: Vector3 }): this {
    if (src.position) {
      this.position.copy(src.position);
    }
    if (src.rotation) {
      this.rotation.copy(src.rotation);
    }
    if (src.velocity) {
      this.velocity.copy(src.velocity);
    }
    if (src.scale) {
      this.scale.copy(src.scale);
    }

    return this;
  }

  reset (): void {
    this.position = new Vector3();
    this.rotation = new Quaternion();
    this.velocity = new Vector3();
    this.scale = new Vector3(1,1,1);
  }
}
