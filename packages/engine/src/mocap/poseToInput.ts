import { Vector3 } from 'three'
import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { Entity } from '../ecs/classes/Entity'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'

const rightThighDirection = new Vector3(),
  leftThighDirection = new Vector3(),
  minSeatedAngle = 1.25, //radians
  poseHoldTime = 0.5 //seconds
let seatedTimer = 0

export const evaluatePose = (entity: Entity) => {
  const rig = getComponent(entity, AvatarRigComponent).rig

  if (!MotionCaptureRigComponent.solvingLowerBody[entity]) return

  const seated = () => {
    rig.rightUpperLeg.node.quaternion.angleTo(rig.spine.node.quaternion) > minSeatedAngle &&
      rig.leftUpperLeg.node.quaternion.angleTo(rig.spine.node.quaternion) > minSeatedAngle
  }
}
