import { Quaternion, Vector3 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Axis } from '../classes/Axis'

export type IKPoseLimbData = { lengthScale: number; dir: Vector3; jointDirection: Vector3 }
export type IKPoseLookTwist = { lookDirection: Vector3; twistDirection: Vector3 }
export type IKPoseHipData = {
  bind_height: number
  movement: Vector3
  dir: Vector3
  twist: number
}
export type IKPoseSpineData = [IKPoseLookTwist, IKPoseLookTwist]

export type IKPoseComponentType = {
  startPosition: Vector3 // Start of chain (world space position of shoulder for an arm chain)
  endPosition: Vector3 // Target position for chain to reach (end effector)
  axis: Axis // Axis of rotation toward the end position
  length: number

  spineParentQuaternion: Quaternion
  spineParentPosition: Vector3
  spineParentScale: Vector3

  spineChildQuaternion: Quaternion
  spineChildPosition: Vector3
  spineChildScale: Vector3

  hip: IKPoseHipData

  foot_l: IKPoseLookTwist
  foot_r: IKPoseLookTwist

  // IK Data for limbs is first the Direction toward the End Effector,
  // The scaled length to the end effector, plus the direction that
  // the KNEE or ELBOW is pointing. For IK Targeting, Dir is FORWARD and
  // joint dir is UP
  leg_l: IKPoseLimbData
  leg_r: IKPoseLimbData
  arm_l: IKPoseLimbData
  arm_r: IKPoseLimbData

  spine: IKPoseSpineData

  head: IKPoseLookTwist
}

export const defaultIKPoseComponentValues = (): IKPoseComponentType => {
  return {
    startPosition: new Vector3(), // Start of chain (world space position of shoulder for an arm chain)
    endPosition: new Vector3(), // Target position for chain to reach (end effector)
    axis: new Axis(), // Axis of rotation toward the end position
    length: 0,

    spineParentQuaternion: new Quaternion(),
    spineParentPosition: new Vector3(),
    spineParentScale: new Vector3(),

    spineChildQuaternion: new Quaternion(),
    spineChildPosition: new Vector3(),
    spineChildScale: new Vector3(),

    hip: {
      bind_height: 0,
      movement: new Vector3(),
      dir: new Vector3(),
      twist: 0
    },

    foot_l: { lookDirection: new Vector3(), twistDirection: new Vector3() },
    foot_r: { lookDirection: new Vector3(), twistDirection: new Vector3() },

    // IK Data for limbs is first the Direction toward the End Effector,
    // The scaled length to the end effector, plus the direction that
    // the KNEE or ELBOW is pointing. For IK Targeting, Dir is FORWARD and
    // joint dir is UP
    leg_l: { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() },
    leg_r: { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() },
    arm_l: { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() },
    arm_r: { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() },

    spine: [
      { lookDirection: new Vector3(), twistDirection: new Vector3() },
      { lookDirection: new Vector3(), twistDirection: new Vector3() }
    ],

    head: { lookDirection: new Vector3(), twistDirection: new Vector3() }
  }
}

export const IKPoseComponent = createMappedComponent<IKPoseComponentType>('IKPoseComponent')
