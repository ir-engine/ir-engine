import { addComponent, createEntity, getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import IKRig from '@xrengine/engine/src/ikrig/components/IKRig'
import { defineQuery, defineSystem, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'
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

export class DebugComponent {
  static points = null
  static lines = null

  static init() {
    const entity = createEntity()
    addComponent(entity, Obj, {})
    addComponent(entity, PointsComponent, {})

    this.points = getComponent(entity, PointsComponent)
    this.points.init()

    addComponent(entity, Lines, {})
    this.lines = getComponent(entity, Lines, {})
    this.lines.init()
    return this
  }

  static reset() {
    this.points.reset()
    this.lines.reset()
    return this
  }

  static setPoint(p, hex: any = 0xff0000, shape = null, size = null) {
    this.points.add(p, hex, shape, size)
    return this
  }
  static setLine(p0, p1, hex_0: any = 0xff0000, hex_1 = null, is_dash = false) {
    this.lines.add(p0, p1, hex_0, hex_1, is_dash)
    return this
  }
}

export const IKRigSystem = async (): Promise<System> => {
  const ikrigsQuery = defineQuery([IKRig])
  const ikposeQuery = defineQuery([IKPose])

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    d.reset() // For this example, Lets reset visual debug for every compute.

    // RUN
    for (const entity of ikposeQuery(world)) {
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

    return world
  })
}
