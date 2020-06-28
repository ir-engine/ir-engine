import Vector2 from "../interfaces/Vector2"

export default class MousePosition {
  current: Vector2
  prev: Vector2
  constructor() {
    this.current = {
      x: 0,
      y: 0
    }
    this.prev = {
      x: 0,
      y: 0
    }
  }

  copy(source: MousePosition): MousePosition {
    this.current = source.current
    this.prev = source.prev
    return this
  }

  set(current: Vector2, prev: Vector2): MousePosition {
    this.current = current
    this.prev = prev
    return this
  }

  clone(): MousePosition {
    return new MousePosition().set(this.current, this.prev)
  }
}
