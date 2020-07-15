import { Component } from "ecsy"

const vector3Identity: number[] = [0, 0, 0]
const vector3ScaleIdentity: number[] = [1, 1, 1]
const quaternionIdentity: number[] = [0, 0, 0, 1]

interface PropTypes {
  position: number[]
  rotation: number[]
  scale: number[]
  velocity: number[]
}

export class TransformComponent extends Component<PropTypes> {
  position: number[] = vector3Identity
  rotation: number[] = quaternionIdentity
  scale: number[] = vector3ScaleIdentity
  velocity: number[] = vector3Identity

  constructor() {
    super()
    this.position = vector3Identity
    this.rotation = quaternionIdentity
    this.scale = vector3ScaleIdentity
    this.velocity = vector3Identity
  }
  copy(src: this): this {
    this.position = src.position
    this.rotation = src.rotation
    this.scale = src.scale
    this.velocity = src.velocity
    return this
  }
  reset(): void {
    this.position = vector3Identity
    this.rotation = quaternionIdentity
    this.scale = vector3ScaleIdentity
    this.velocity = vector3Identity
  }
}
