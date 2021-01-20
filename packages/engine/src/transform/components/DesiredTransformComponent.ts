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
    this.position = null;
    this.rotation = null;
  }
}

DesiredTransformComponent._schema = {
  position: { default: null, type: Types.Ref },
  rotation: { default: null, type: Types.Ref },
  positionRate: { default: 1.5, type: Types.Number },
  rotationRate: { default: 3.5, type: Types.Number }
};
