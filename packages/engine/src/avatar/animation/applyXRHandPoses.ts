/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { VRM, VRMHumanBoneName, VRMHumanBoneParentMap } from '@pixiv/three-vrm'
import { Quaternion } from 'three'

/**
 * Hand joint names (VRMBoneName) without the handedness prefix.
 * Wrist and tips are excluded because we do not need to apply rotation to them
 * when applying hand rotation FK.
 */
const vrmUnprefixedHandJointNames = [
  'ThumbMetacarpal',
  'ThumbProxal',
  'ThumbDistal',
  'IndexMetacarpal',
  'IndexProximal',
  'IndexIntermediate',
  'IndexDistal',
  'MiddleMetacarpal',
  'MiddleProximal',
  'MiddleIntermediate',
  'MiddleDistal',
  'RingMetacarpal',
  'RingProximal',
  'RingIntermediate',
  'RingDistal',
  'LittleMetacarpal',
  'LittleProximal',
  'LittleIntermediate',
  'LittleDistal'
] as string[]

const vrmLeftHandJointNames = vrmUnprefixedHandJointNames.map((bone) => `left${bone}` as VRMHumanBoneName)
const vrmRightHandJointNames = vrmUnprefixedHandJointNames.map((bone) => `right${bone}` as VRMHumanBoneName)

const restHandSpaceRotationInv = new Quaternion()

export const applyXRHandPoses = (vrm: VRM, handedness: 'left' | 'right', rotations: Float32Array) => {
  const vrmJointNames = handedness === 'left' ? vrmLeftHandJointNames : vrmRightHandJointNames
  for (const vrmJointName of vrmJointNames) {
    const parentBoneName = VRMHumanBoneParentMap[vrmJointName]
    const bone = vrm.humanoid.getNormalizedBone(vrmJointName)
    const restRotation = vrm.humanoid.normalizedRestPose[vrmJointName]?.rotation
    if (!bone?.node || !parentBoneName || !restRotation) continue
    restHandSpaceRotationInv.fromArray(restRotation).invert()

    const parentRestHandSpaceRotation = vrm.humanoid.normalizedRestPose[parentBoneName]?.rotation

    bone.node.quaternion.fromArray(rotations, i * 4)
  }
}
