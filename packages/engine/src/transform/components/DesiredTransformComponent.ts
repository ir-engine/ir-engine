import { Component } from '../../ecs/classes/Component';
import { Vector3, Quaternion, Euler } from 'three';
import { Types } from '../../ecs/types/Types';

export class DesiredTransformComponent extends Component<DesiredTransformComponent> {
  position: Vector3|null
  rotation: Quaternion|null
  positionRate: number
  rotationRate: number

  constructor () {
    super();
    this.reset();
  }

  copy(src: { position?: Vector3, rotation?: Quaternion }): this {
    if (src.position) {
      if (this.position) {
        this.position.copy(src.position);
      } else {
        this.position = src.position.clone();
      }
    }
    if (src.rotation) {
      if (this.rotation) {
        this.rotation.copy(src.rotation);
      } else {
        this.rotation = src.rotation.clone();
      }
    }

    return this;
  }

  reset (): void {
    this.position = null;
    this.rotation = null;
  }
}

DesiredTransformComponent._schema = {
  position: { default: null, type: Types.Ref },
  rotation: { default: null, type: Types.Ref },
  positionRate: { default: 5, type: Types.Number },
  rotationRate: { default: 3.5, type: Types.Number }
};
