import { Component } from '../../ecs/classes/Component';

const vector3Identity: number[] = [0, 0, 0];
const quaternionIdentity: number[] = [0, 0, 0, 1];

interface PropTypes {
  position: number[]
  rotation: number[]
  velocity: number[]
}

export class TransformComponent extends Component<TransformComponent> {
  position: number[] = [...vector3Identity]
  rotation: number[] = [...quaternionIdentity]
  velocity: number[] = [...vector3Identity]

  constructor () {
    super();
    this.position = [...vector3Identity];
    this.rotation = [...quaternionIdentity];
    this.velocity = [...vector3Identity];
  }

  copy (src: this): this {
    this.position[0] = src.position[0];
    this.position[1] = src.position[1];
    this.position[2] = src.position[2];

    this.rotation[0] = src.rotation[0];
    this.rotation[1] = src.rotation[1];
    this.rotation[2] = src.rotation[2];
    this.rotation[3] = src.rotation[3];

    this.velocity[0] = src.velocity[0];
    this.velocity[1] = src.velocity[1];
    this.velocity[2] = src.velocity[2];

    return this;
  }

  reset (): void {
    this.position = [...vector3Identity];
    this.rotation = [...quaternionIdentity];
    this.velocity = [...vector3Identity];
  }
}
