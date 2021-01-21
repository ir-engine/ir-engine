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
<<<<<<< HEAD
  position: { default: new Vector3(), type: Types.Ref },
  rotation: { default: new Quaternion(), type: Types.Ref },
  positionRate: { default: 4.5, type: Types.Number },
  rotationRate: { default: 4.5, type: Types.Number }
=======
  position: { default: null, type: Types.Ref },
  rotation: { default: null, type: Types.Ref },
  positionRate: { default: 1.5, type: Types.Number },
  rotationRate: { default: 3.5, type: Types.Number }
>>>>>>> e6233927bbb1d9040b06aaddd7b98eedcbfab498
};
