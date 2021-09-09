import { addComponent, createEntity, getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { IKRig } from '../components/IKRig'
import { defineQuery, defineSystem, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
// import DebugComponent from '../classes/Debug'
import { IKPose } from '../components/IKPose'
import {
  applyIKPoseToIKRig,
  computeIKPose,
  visualizeHip,
  visualizeLimb,
  visualizeLookTwist,
  visualizeSpine
} from '../functions/IKFunctions'
import { Entity } from '../../ecs/classes/Entity'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { AnimationAction } from 'three'

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

export const IKRigSystem = async (): Promise<System> => {
  const ikrigsQuery = defineQuery([IKRig])
  const ikposeQuery = defineQuery([IKPose])

  // TODO remove this const, it's just for testing
  const processedAnimation = new Map<Entity, number>()

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    // d.reset() // For this example, Lets reset visual debug for every compute.

    // RUN
    for (const entity of ikposeQuery(world)) {
      const ikPose = getComponent(entity, IKPose)
      const rig = getComponent(entity, IKRig)
      if (!ikPose.targetRigs) {
        continue
      }

      {
        // TODO remove this block, it's just for testing
        const ac = getComponent(entity, AnimationComponent)
        // @ts-ignore
        const actions: AnimationAction[] = ac.mixer._actions
        if (!actions.length) {
          continue
        }
        const animationTime = actions[0].time
        if (processedAnimation.has(entity)) {
          if (processedAnimation.get(entity) === animationTime) {
            continue
          }
        }
        processedAnimation.set(entity, animationTime)
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
      ikPose.targetRigs.forEach((targetRig) => {
        applyIKPoseToIKRig(targetRig, ikPose)
      })
    }

    return world
  })
}
