// Default component, holds data about what behaviors our character has.
import { Component } from "ecsy"

interface jumpVals {
  canJump: boolean
  t?: number
  height?: number
  duration?: number
}

const defaultJumpValues = {
  canJump: true,
  t: 0,
  height: 1.0,
  duration: 1
}

interface PropTypes {
  rotationSpeedX: number
  rotationSpeedY: number
  maxSpeed: number
  accelerationSpeed: number
  jump: jumpVals
}

export default class Actor extends Component<PropTypes> {
  rotationSpeedX: number
  rotationSpeedY: number
  maxSpeed: number
  accelerationSpeed: number
  rotationSpeedZ: number
  jump: jumpVals = defaultJumpValues

  constructor() {
    super()
    this.reset()
  }
  copy(src: this): this {
    this.rotationSpeedX = src.rotationSpeedX
    this.rotationSpeedY = src.rotationSpeedY
    this.maxSpeed = src.maxSpeed
    this.accelerationSpeed = src.accelerationSpeed
    this.jump = src.jump
    return this
  }
  reset(): void {
    this.rotationSpeedX = 1
    this.rotationSpeedY = 1
    this.maxSpeed = 10
    this.accelerationSpeed = 1
    this.jump = defaultJumpValues
  }
}
