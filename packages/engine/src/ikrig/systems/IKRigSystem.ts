import { System } from '@xrengine/engine/src/ecs/classes/System'
import { getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import IKRig from '@xrengine/engine/src/ikrig/components/IKRig'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import DebugComponent from '../classes/Debug'
import { IKPose } from '../components/IKPose'
import { FORWARD, UP } from '../constants/Vector3Constants'
import {
  applyHip,
  applyLimb,
  applyLookTwist,
  applySpine,
  computeHip,
  computeLimb,
  computeLookTwist,
  computeSpine,
  visualizeHip,
  visualizeLimb,
  visualizeLookTwist,
  visualizeSpine
} from '../functions/IKFunctions'

export class IKRigSystem extends System {
  updateType = SystemUpdateType.Fixed

  execute(deltaTime) {
    // DEBUG
    for (const entity of this.queryResults.debug.all) {
      const d = getComponent(entity, DebugComponent)
      d.reset() // For this example, Lets reset visual debug for every compute.
    }
    // RUN
    for (const entity of this.queryResults.ikpose.all) {
      const ikPose = getComponent(entity, IKPose)
      const rig = getComponent(entity, IKRig)

      // // COMPUTE
      computeHip(rig, ikPose)

      computeLimb(rig.pose, rig.chains.leg_l, ikPose.leg_l)
      computeLimb(rig.pose, rig.chains.leg_r, ikPose.leg_r)

      computeLookTwist(rig, rig.points.foot_l, ikPose.foot_l, FORWARD, UP) // Look = Fwd, Twist = Up
      computeLookTwist(rig, rig.points.foot_r, ikPose.foot_r, FORWARD, UP)

      computeSpine(rig, rig.chains.spine, ikPose, UP, FORWARD)

      computeLimb(rig.pose, rig.chains.arm_l, ikPose.arm_l)
      computeLimb(rig.pose, rig.chains.arm_r, ikPose.arm_r)

      computeLookTwist(rig, rig.points.head, ikPose.head, FORWARD, UP)

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
      applyHip(ikPose)

      applyLimb(ikPose, rig.chains.leg_l, ikPose.leg_l)
      applyLimb(ikPose, rig.chains.leg_r, ikPose.leg_r)

      applyLookTwist(entity, rig.points.foot_l, ikPose.foot_l, FORWARD, UP)
      applyLookTwist(entity, rig.points.foot_r, ikPose.foot_r, FORWARD, UP)
      applySpine(entity, rig.chains.spine, ikPose.spine, UP, FORWARD)

      applyLimb(ikPose, rig.chains.arm_l, ikPose.arm_l)
      applyLimb(ikPose, rig.chains.arm_r, ikPose.arm_r)

      // applyLookTwist(entity, rig.points.head, ikPose.head, FORWARD, UP);

      // rig.pose.apply();
    }
  }
}
IKRigSystem.queries = {
  ikrigs: {
    components: [IKRig]
  },
  ikpose: {
    components: [IKPose]
  },
  debug: {
    components: [DebugComponent]
  }
}
