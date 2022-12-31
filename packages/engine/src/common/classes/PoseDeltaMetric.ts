import { DualQuaternion } from './DualQuaternion'

export class PoseDeltaMetric {
  pose: DualQuaternion | null
  delta = new DualQuaternion()

  update(newPose: DualQuaternion | null) {
    if (!newPose) {
      this.pose = null
      return
    }

    if (!this.pose) {
      this.pose = new DualQuaternion().copy(newPose)
    }

    this.delta.copy(this.pose).invert().premultiply(newPose)
    this.pose.copy(newPose)
  }
}
