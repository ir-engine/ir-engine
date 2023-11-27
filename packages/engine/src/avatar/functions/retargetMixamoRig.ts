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

import { VRM } from '@pixiv/three-vrm'
import { cloneDeep } from 'lodash'
import {
  AnimationClip,
  Euler,
  KeyframeTrack,
  Object3D,
  Quaternion,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack
} from 'three'
import { mixamoVRMRigMap } from '../AvatarBoneMatching'

const hipsOffset = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))
const rightArmOffset = new Quaternion().setFromEuler(new Euler(Math.PI * 0.325, 0, -Math.PI * 0.1))
const leftArmOffset = new Quaternion().setFromEuler(new Euler(Math.PI * 0.325, 0, Math.PI * 0.1))

/**
 * Retargets mixamo animation to a VRM rig,
 * based upon https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm-core/examples/humanoidAnimation/loadMixamoAnimation.js
 *
 */
export function retargetMixamoAnimation(clip: AnimationClip, mixamoScene: Object3D, vrm: VRM) {
  const tracks = [] as KeyframeTrack[] // KeyframeTracks compatible with VRM will be added here

  const restRotationInverse = new Quaternion()
  const parentRestWorldRotation = new Quaternion()
  const _quatA = new Quaternion()
  const _vec3 = new Vector3()

  const mixamoRig = cloneDeep(mixamoScene)

  // Adjust with reference to hips height.
  // Additional logic present to handle known transform differences
  const hips = mixamoRig.getObjectByName('mixamorigHips')!
  const rightArm = mixamoRig.getObjectByName('mixamorigRightArm')!
  const leftArm = mixamoRig.getObjectByName('mixamorigLeftArm')!

  const userData = (vrm as any).userData
  if (userData?.flipped) {
    hips.quaternion.copy(hipsOffset)
  }
  if (userData?.useAPose) {
    rightArm.quaternion.copy(rightArmOffset)
    leftArm.quaternion.copy(leftArmOffset)
  }

  const motionHipsHeight = hips!.position.y
  const vrmHipsY = vrm.humanoid.getNormalizedBoneNode('hips')!.getWorldPosition(_vec3).y
  const vrmRootY = vrm.scene.getWorldPosition(_vec3).y
  const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY)
  const hipsPositionScale = vrmHipsHeight / motionHipsHeight

  clip.tracks.forEach((track) => {
    // Convert each tracks for VRM use, and push to `tracks`
    const trackSplitted = track.name.split('.')
    const mixamoRigName = trackSplitted[0]
    const vrmBoneName = mixamoVRMRigMap[mixamoRigName]
    const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name
    const mixamoRigNode = mixamoRig.getObjectByName(mixamoRigName)!

    mixamoRig.updateWorldMatrix(true, true)

    if (vrmNodeName != null) {
      const propertyName = trackSplitted[1]

      // Store rotations of rest-pose.
      mixamoRigNode.getWorldQuaternion(restRotationInverse).invert()
      mixamoRigNode.parent!.getWorldQuaternion(parentRestWorldRotation)

      if (track instanceof QuaternionKeyframeTrack) {
        // Retarget rotation of mixamoRig to NormalizedBone.
        for (let i = 0; i < track.values.length; i += 4) {
          const flatQuaternion = track.values.slice(i, i + 4)

          _quatA.fromArray(flatQuaternion)

          _quatA.premultiply(parentRestWorldRotation).multiply(restRotationInverse)

          _quatA.toArray(flatQuaternion)

          flatQuaternion.forEach((v, index) => {
            track.values[index + i] = v
          })
        }

        tracks.push(new QuaternionKeyframeTrack(`${vrmNodeName}.${propertyName}`, track.times, track.values))
      } else if (track instanceof VectorKeyframeTrack) {
        const value = track.values.map((v) => v * hipsPositionScale)
        tracks.push(new VectorKeyframeTrack(`${vrmNodeName}.${propertyName}`, track.times, value))
      }
    }
  })

  return new AnimationClip(clip.name, clip.duration, tracks)
}
