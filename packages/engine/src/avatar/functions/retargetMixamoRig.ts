/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { VRM } from '@pixiv/three-vrm'
import { AnimationClip, KeyframeTrack, Object3D, Quaternion, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three'

import { mixamoVRMRigMap, recursiveHipsLookup } from '../AvatarBoneMatching'

const restRotationInverse = new Quaternion()
const parentRestWorldRotation = new Quaternion()
const _quatA = new Quaternion()

/**Retargets an animation clip into normalized bone space for use with any T-Posed normalized humanoid rig */
export const retargetAnimationClip = (clip: AnimationClip, mixamoScene: Object3D) => {
  const hipsPositionScale = recursiveHipsLookup(mixamoScene).parent.scale.y

  for (let i = 0; i < clip.tracks.length; i++) {
    const track = clip.tracks[i]
    const trackSplitted = track.name.split('.')
    const rigNodeName = trackSplitted[0]
    const rigNode = mixamoScene.getObjectByName(rigNodeName)!

    mixamoScene.updateWorldMatrix(true, true)

    // Store rotations of rest-pose
    rigNode.getWorldQuaternion(restRotationInverse).invert()
    rigNode.parent!.getWorldQuaternion(parentRestWorldRotation)

    if (track instanceof QuaternionKeyframeTrack) {
      // Retarget rotation of mixamoRig to NormalizedBone
      for (let i = 0; i < track.values.length; i += 4) {
        const flatQuaternion = track.values.slice(i, i + 4)

        _quatA.fromArray(flatQuaternion)

        _quatA.premultiply(parentRestWorldRotation).multiply(restRotationInverse)

        _quatA.toArray(flatQuaternion)

        flatQuaternion.forEach((v, index) => {
          track.values[index + i] = v
        })
      }
    } else if (track instanceof VectorKeyframeTrack) {
      const value = track.values.map((v) => v * hipsPositionScale)
      value.forEach((v, index) => {
        track.values[index] = v
      })
    }
  }
}

/**Clones and binds a mixamo animation clip to a given VRM humanoid's normalized bones */
export const bindAnimationClipFromMixamo = (clip: AnimationClip, vrm: VRM) => {
  const tracks = [] as KeyframeTrack[]
  for (let i = 0; i < clip.tracks.length; i++) {
    const trackClone = clip.tracks[i].clone()
    const trackSplitted = trackClone.name.split('.')
    const mixamoPrefix = trackSplitted[0].includes('mixamorig') ? '' : 'mixamorig'
    const mixamoBoneName = mixamoPrefix + trackSplitted[0]
    const vrmBoneName = mixamoVRMRigMap[mixamoBoneName]
    const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name

    if (vrmNodeName != null) {
      const propertyName = trackSplitted[1]
      trackClone.name = `${vrmNodeName}.${propertyName}`
      tracks.push(trackClone)
    }
  }
  return new AnimationClip(clip.name, clip.duration, tracks)
}
