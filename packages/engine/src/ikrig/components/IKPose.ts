import { Component } from '@xrengine/engine/src/ecs/classes/Component'
import { Quaternion, Vector3 } from 'three'
import Axis from '../classes/Axis'
import IKRig from './IKRig'
export class IKPose extends Component <IKPose> {
  startPosition: Vector3 = new Vector3() // Start of chain (world space position of shoulder for an arm chain)
  endPosition: Vector3 = new Vector3() // Target position for chain to reach (end effector)
  axis: Axis = new Axis() // Axis of rotation toward the end position
  length = 0

  targetRigs: IKRig[] = []

  spineParentQuaternion = new Quaternion()
  spineParentPosition = new Vector3(0, 0, 0)
  spineParentScale = new Vector3(1, 1, 1)

  spineChildQuaternion = new Quaternion()
  spineChildPosition = new Vector3(0, 0, 0)
  spineChildScale = new Vector3(1, 1, 1)

  hip = {
    bind_height: 0,
    movement: new Vector3(),
    dir: new Vector3(),
    twist: 0
  }

  foot_l = { lookDirection: new Vector3(), twistDirection: new Vector3() }
  foot_r = { lookDirection: new Vector3(), twistDirection: new Vector3() }

  // IK Data for limbs is first the Direction toward the End Effector,
  // The scaled length to the end effector, plus the direction that
  // the KNEE or ELBOW is pointing. For IK Targeting, Dir is FORWARD and
  // joint dir is UP
  leg_l = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() }
  leg_r = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() }
  arm_l = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() }
  arm_r = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() }

  spine = [
    { lookDirection: new Vector3(), twistDirection: new Vector3() },
    { lookDirection: new Vector3(), twistDirection: new Vector3() }
  ]

  head = { lookDirection: new Vector3(), twistDirection: new Vector3() }
}
