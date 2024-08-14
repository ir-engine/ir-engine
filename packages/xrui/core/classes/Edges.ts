export class Edges {
  left = 0
  top = 0
  right = 0
  bottom = 0
  copy(rect: Edges) {
    this.top = rect.top
    this.left = rect.left
    this.right = rect.right
    this.bottom = rect.bottom
    return this
  }
}
