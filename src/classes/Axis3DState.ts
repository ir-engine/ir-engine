import Axis3D from "../interfaces/Axis3D"

export default class Axis3DState {
  current: Axis3D
  prev: Axis3D
  constructor() {
    this.current = {
      x: 0,
      y: 0,
      z: 0
    }
    this.prev = {
      x: 0,
      y: 0,
      z: 0
    }
  }

  copy(source: Axis3DState): Axis3DState {
    this.current = source.current
    this.prev = source.prev
    return this
  }

  set(current: Axis3D, prev: Axis3D): Axis3DState {
    this.current = current
    this.prev = prev
    return this
  }

  clone(): Axis3DState {
    return new Axis3DState().set(this.current, this.prev)
  }
}
