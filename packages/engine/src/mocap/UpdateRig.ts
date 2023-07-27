import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Euler, Quaternion, Vector3 } from 'three'

const updateRigPosition = (name, position, dampener, lerpAmount, rig) => {
  const Part = rig.vrm.humanoid!.getRawBoneNode(VRMHumanBoneName[name])
  if (!Part) {
    console.log(`can't position ${name}`)
    return
  }
  const vector = new Vector3(
    (position?.x || 0) * dampener,
    (position?.y || 0) * dampener,
    (position?.z || 0) * dampener
  )
  Part.position.lerp(vector, lerpAmount) // interpolate
  Part.updateMatrixWorld()
}

const updateRigRotation = (name, rotation, dampener, lerpAmount, rig) => {
  const Part = rig.vrm.humanoid!.getRawBoneNode(VRMHumanBoneName[name])
  if (!Part) {
    console.log(`can't rotate ${name}`)
    return
  }

  const euler = new Euler((rotation?.x || 0) * dampener, (rotation?.y || 0) * dampener, (rotation?.z || 0) * dampener)
  const quaternion = new Quaternion().setFromEuler(euler)
  Part.quaternion.slerp(quaternion, lerpAmount) // interpolate
  Part.updateMatrixWorld()
}

export { updateRigPosition, updateRigRotation }
