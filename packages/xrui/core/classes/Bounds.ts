export class Bounds {
  left = 0
  top = 0
  width = 0
  height = 0
  copy(rect: Bounds) {
    this.top = rect.top
    this.left = rect.left
    this.width = rect.width
    this.height = rect.height
    return this
  }
}
