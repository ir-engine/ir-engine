import { Component } from "../../ecs/Component"

const vector3Identity: number[] = [0, 0, 0]
const quaternionIdentity: number[] = [0, 0, 0, 1]

interface PropTypes {
  position: number[]
  rotation: number[]
  velocity: number[]
}

export class TransformComponent extends Component<PropTypes> {
  position: number[] = vector3Identity
  rotation: number[] = quaternionIdentity
  velocity: number[] = vector3Identity

  constructor() {
    super()
    this.position = vector3Identity
    this.rotation = quaternionIdentity
    this.velocity = vector3Identity
  }
  copy(src: this): this {
    this.position = src.position
    this.rotation = src.rotation
    this.velocity = src.velocity
    return this
  }
  reset(): void {
    this.position = vector3Identity
    this.rotation = quaternionIdentity
    this.velocity = vector3Identity
  }
}
