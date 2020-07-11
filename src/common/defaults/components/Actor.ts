import { Component } from "ecsy"

interface PropTypes {
  rotationSpeedX: number
  rotationSpeedY: number
  maxSpeed: number
  accelerationSpeed: number
}

export class Actor extends Component<PropTypes> {
  rotationSpeedX: number
  rotationSpeedY: number
  maxSpeed: number
  accelerationSpeed: number

  constructor() {
    super()
    this.reset()
  }
  copy(src: this): this {
    this.rotationSpeedX = src.rotationSpeedX
    this.rotationSpeedY = src.rotationSpeedY
    this.maxSpeed = src.maxSpeed
    this.accelerationSpeed = src.accelerationSpeed
    return this
  }
  reset(): void {
    this.rotationSpeedX = 1
    this.rotationSpeedY = 1
    this.maxSpeed = 10
    this.accelerationSpeed = 1
  }
}
