import { XRJointAvatarBoneMap } from '@etherealengine/spatial/src/xr/XRComponents'
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'

export const applyHandRotationFK = (vrm: VRM, handedness: 'left' | 'right', rotations: Float32Array) => {
  const entries = Object.values(XRJointAvatarBoneMap)
  for (let i = 0; i < entries.length; i++) {
    const label = entries[i]
    const boneName = `${handedness}${label}` as VRMHumanBoneName
    const bone = vrm.humanoid.getNormalizedBone(boneName)
    if (!bone?.node) continue
    bone.node.quaternion.fromArray(rotations, i * 4)
  }
}
