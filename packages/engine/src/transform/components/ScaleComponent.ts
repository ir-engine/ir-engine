import { Component } from '../../ecs/classes/Component';

const vector3ScaleIdentity: number[] = [1, 1, 1];

interface PropTypes {
  scale: number[];
}

export class ScaleComponent extends Component<ScaleComponent> {
  scale: number[] = [...vector3ScaleIdentity]

  constructor () {
    super();
    this.scale = [...vector3ScaleIdentity];
  }

  copy (src: this): this {
    this.scale = [...src.scale];
    return this;
  }

  reset (): void {
    this.scale = [...vector3ScaleIdentity];
  }
}
