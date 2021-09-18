import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { IKRigComponent } from '../components/IKRigComponent'
import { Not } from 'bitecs'
// import DebugComponent from '../classes/Debug'
import { IKPoseComponent } from '../components/IKPoseComponent'
import {
  applyIKPoseToIKRig,
  computeIKPose,
  visualizeHip,
  visualizeLimb,
  visualizeLookTwist,
  visualizeSpine
} from '../functions/IKFunctions'

import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'
// export class DebugComponent {
//   static points = null
//   static lines = null

//   static init() {
//     const entity = createEntity()
//     addComponent(entity, Obj, {})
//     addComponent(entity, PointsComponent, {})

//     this.points = getComponent(entity, PointsComponent)
//     this.points.init()

//     addComponent(entity, Lines, {})
//     this.lines = getComponent(entity, Lines, {})
//     this.lines.init()
//     return this
//   }

//   static reset() {
//     this.points.reset()
//     this.lines.reset()
//     return this
//   }

//   static setPoint(p, hex: any = 0xff0000, shape = null, size = null) {
//     this.points.add(p, hex, shape, size)
//     return this
//   }
//   static setLine(p0, p1, hex_0: any = 0xff0000, hex_1 = null, is_dash = false) {
//     this.lines.add(p0, p1, hex_0, hex_1, is_dash)
//     return this
//   }
// }

export const IKRigSystem = async (world: World): Promise<System> => {
  const targetRigsQuery = defineQuery([IKRigComponent, Not(IKPoseComponent)])
  const ikposeQuery = defineQuery([IKPoseComponent, IKRigComponent])

  return () => {
    // d.reset() // For this example, Lets reset visual debug for every compute.

    // RUN
    for (const entity of ikposeQuery()) {
      const ikPose = getComponent(entity, IKPoseComponent)
      const rig = getComponent(entity, IKRigComponent)
      if (!ikPose.targetRigs) {
        continue
      }

      // // COMPUTE
      computeIKPose(rig, ikPose)

      // // // VISUALIZE
      // visualizeHip(rig, ikPose);

      // visualizeLimb(rig.pose, rig.chains.leg_l, ikPose.leg_l);
      // visualizeLimb(rig.pose, rig.chains.leg_r, ikPose.leg_r);
      // visualizeLimb(rig.pose, rig.chains.arm_l, ikPose.arm_l);
      // visualizeLimb(rig.pose, rig.chains.arm_r, ikPose.arm_r);

      // visualizeLookTwist(rig, rig.points.foot_l, pose.foot_l);
      // visualizeLookTwist(rig, rig.points.foot_r, pose.foot_r);
      // visualizeSpine(rig, rig.chains.spine, ikPose.spine);
      // visualizeLookTwist(rig, rig.points.head, pose.head);

      // APPLY
      for (const targetEntity of targetRigsQuery()) {
        const targetRig = getComponent(targetEntity, IKRigComponent)
        applyIKPoseToIKRig(targetRig, ikPose)
      }
    }
  }
}
