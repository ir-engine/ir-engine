import { Component } from '../../ecs/classes/Component';
import { Vector3, Quaternion } from 'three';

export class TransformComponent extends Component<TransformComponent> {
  position: Vector3
  rotation: Quaternion
  velocity: Vector3

  constructor () {
    super();
    this.reset()
  }

  copy (src: this): this {
   this.position = src.position;
   this.rotation = src.rotation;
   this.velocity = src.velocity;

    return this;
  }

  reset (): void {
    this.position = new Vector3();
    this.rotation = new Quaternion();
    this.velocity = new Vector3();
  }
}
