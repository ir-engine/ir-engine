import { Quaternion, Vector3 } from 'three'

export class PoseMetrics {
  position: Vector3 | null = null
  orientation: Quaternion | null = null

  deltaPosition = new Vector3()
  deltaRotation = new Quaternion()

  update(newPosition?: Vector3 | DOMPointReadOnly | null, newOrientation?: Quaternion | DOMPointReadOnly) {
    if (!newPosition || !newOrientation) {
      if (this.position || this.orientation) {
        this.position = null
        this.orientation = null
        this.deltaPosition.set(0, 0, 0)
        this.deltaRotation.identity()
      }
      return
    }

    if (!this.position) this.position = new Vector3().copy(newPosition as any)
    if (!this.orientation) this.orientation = new Quaternion().copy(newOrientation as any)

    // final - initial
    this.deltaPosition.copy(newPosition as any).sub(this.position)
    this.deltaRotation
      .copy(newOrientation as any)
      .invert()
      .multiply(this.orientation)
    this.position.copy(newPosition as any)
    this.orientation.copy(newOrientation as any)
  }
}
