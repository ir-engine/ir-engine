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

import ECS, { Entity } from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import {
  VRMHandsToXRJointMap,
  XRHandJointToIndexMap,
  XRJointParentMap
} from '@etherealengine/spatial/src/xr/XRComponents'
import { ReferenceSpace, XRState } from '@etherealengine/spatial/src/xr/XRState'
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { Matrix4 } from 'three'

/**
 * Hand joint names (VRMBoneName) without the handedness prefix.
 * Wrist and tips are excluded because we do not need to apply rotation to them
 * when applying hand rotation FK.
 */
const vrmUnprefixedHandJointNames = [
  'ThumbMetacarpal',
  'ThumbProximal',
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

const jointPoses = new Float32Array(16 * 25)
const invMatrices = new Array(25).fill(0).map(() => new Matrix4())
const matrices = new Array(25).fill(0).map(() => new Matrix4())
const localMatrix = new Matrix4()

export const applyXRHandPoses = (vrm: VRM, inputSourceEid: Entity) => {
  const inputSource = ECS.getComponent(inputSourceEid, InputSourceComponent)
  if (!inputSource.source.hand) return
  const handedness = inputSource.source?.handedness
  const vrmJointNames = handedness === 'left' ? vrmLeftHandJointNames : vrmRightHandJointNames
  const xrFrame = getState(XRState).xrFrame
  xrFrame?.fillPoses?.(inputSource.source.hand.values(), ReferenceSpace.localFloor!, jointPoses)

  matrices.forEach((matrix, i) => {
    matrix.fromArray(jointPoses, i * 16)
  })

  invMatrices.forEach((invMatrix, i) => {
    invMatrix.copy(matrices[i]).invert()
  })

  for (const name of vrmJointNames) {
    const bone = vrm.humanoid.getNormalizedBone(name)
    const xrJointName = VRMHandsToXRJointMap[name]!
    const xrParentJointName = XRJointParentMap[xrJointName]
    const xrJoint = inputSource.source.hand!.get(xrJointName)
    const xrParentJoint = inputSource.source.hand!.get(xrParentJointName)
    if (!bone || !xrJoint || !xrParentJoint) continue
    const index = XRHandJointToIndexMap[xrJointName]
    const matrix = matrices[index]
    const parentInvMatrix = invMatrices[XRHandJointToIndexMap[xrParentJointName]]
    localMatrix.copy(matrix).premultiply(parentInvMatrix)
    bone.node.position.setFromMatrixPosition(localMatrix)
    bone.node.quaternion.setFromRotationMatrix(localMatrix)
  }
}
