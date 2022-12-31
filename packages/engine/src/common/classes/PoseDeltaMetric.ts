import { Quaternion, Vector3 } from 'three'

import { DualQuaternion } from './DualQuaternion'

export class PoseDeltaMetric {
  // pose: {
  //   rotation: Quaternion
  //   translation: Vector3,
  // } | null
  // delta = {
  //   rotation: new Quaternion(),
  //   translation: new Vector3()
  // }

  // update(newPose: DualQuaternion | null) {
  //   if (!newPose) {
  //     this.pose = null
  //     return
  //   }

  //   if (!this.pose) {
  //     this.pose = {
  //       rotation: new Quaternion(),
  //       translation: new Vector3()
  //     }
  //     newPose.getRotation(this.pose.rotation)
  //     newPose.getTranslation(this.pose.translation)
  //   }

  //   newPose.getTranslation(this.delta.translation)
  //   this.delta.translation.negate().add(this.pose.translation)

  //   newPose.getRotation(this.delta.rotation)
  //   this.delta.rotation.invert().premultiply(this.pose.rotation)
  // }

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

    this.delta.copy(this.pose).invert().multiply(newPose)
    this.pose.copy(newPose)
  }
}
