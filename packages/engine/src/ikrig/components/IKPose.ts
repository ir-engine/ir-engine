import { Quaternion, Vector3 } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import { Axis } from '../classes/Axis'
import { IKRig } from './IKRig'

type IKPoseComponentType = {
  startPosition: Vector3 // Start of chain (world space position of shoulder for an arm chain)
  endPosition: Vector3 // Target position for chain to reach (end effector)
  axis: Axis // Axis of rotation toward the end position
  length: number

  targetRigs: IKRig[]

  spineParentQuaternion: Quaternion
  spineParentPosition: Vector3
  spineParentScale: Vector3

  spineChildQuaternion: Quaternion
  spineChildPosition: Vector3
  spineChildScale: Vector3

  hip: {
    bind_height: number
    movement: Vector3
    dir: Vector3
    twist: number
  }

  foot_l: { lookDirection: Vector3; twistDirection: Vector3 }
  foot_r: { lookDirection: Vector3; twistDirection: Vector3 }

  // IK Data for limbs is first the Direction toward the End Effector,
  // The scaled length to the end effector, plus the direction that
  // the KNEE or ELBOW is pointing. For IK Targeting, Dir is FORWARD and
  // joint dir is UP
  leg_l: { lengthScale: 0; dir: Vector3; jointDirection: Vector3 }
  leg_r: { lengthScale: 0; dir: Vector3; jointDirection: Vector3 }
  arm_l: { lengthScale: 0; dir: Vector3; jointDirection: Vector3 }
  arm_r: { lengthScale: 0; dir: Vector3; jointDirection: Vector3 }

  spine: [{ lookDirection: Vector3; twistDirection: Vector3 }, { lookDirection: Vector3; twistDirection: Vector3 }]

  head: { lookDirection: Vector3; twistDirection: Vector3 }
}

export const IKPose = createMappedComponent<IKPoseComponentType>()
