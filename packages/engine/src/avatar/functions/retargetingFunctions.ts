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

import { AnimationClip, Quaternion, QuaternionKeyframeTrack, Vector3, VectorKeyframeTrack } from 'three'

import { Entity, EntityUUID, getComponent, getMutableComponent, UUIDComponent } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { getHips } from '../AvatarBoneMatching'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'

const restRotationInverse = new Quaternion()
const parentRestWorldRotation = new Quaternion()
const _quatA = new Quaternion()
const _scale = new Vector3()

/**Converts an animation clip to normalized bone space for use with any T-Posed normalized humanoid rig
 */
export const normalizeAnimationClips = (gltfEntity: Entity) => {
  const hips = getHips(gltfEntity)
  if (!hips) return
  const hipsPositionScale = TransformComponent.getWorldScale(hips, _scale).y
  getComponent(hips, GroupComponent)[0].updateWorldMatrix(false, true)

  for (const clip of getComponent(gltfEntity, AnimationComponent).animations)
    for (let i = 0; i < clip.tracks.length; i++) {
      const track = clip.tracks[i]
      const trackSplitted = track.name.lastIndexOf('.')
      const rigNodeName = track.name.slice(0, trackSplitted)
      const rigNodeEntity = UUIDComponent.getEntityByUUID(rigNodeName as EntityUUID)
      if (!rigNodeEntity) continue

      // Store rotations of rest-pose
      TransformComponent.getWorldRotation(rigNodeEntity, restRotationInverse).invert()
      const parentEntity = getComponent(rigNodeEntity, EntityTreeComponent).parentEntity
      TransformComponent.getWorldRotation(parentEntity, parentRestWorldRotation)

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
        const isPosition = track.name.includes('position')
        track.values.forEach((v, index) => {
          track.values[index] = isPosition ? v * hipsPositionScale : v
        })
      }
    }
}

/**Retargets animation clips from the source to the VRM schema
 */
export const retargetAnimationClips = (sourceAnimationEntity) => {
  const animationClips = [] as AnimationClip[]
  const clips = getComponent(sourceAnimationEntity, AnimationComponent).animations
  const sourceRigMap = getComponent(sourceAnimationEntity, AvatarRigComponent).entitiesToBones
  for (const clip of clips) {
    const newClip = new AnimationClip(clip.name, clip.duration, [], clip.blendMode)
    for (const track of clip.tracks) {
      const sourceEntity = UUIDComponent.getEntityByUUID(
        track.name.substring(0, track.name.lastIndexOf('.')) as EntityUUID
      )
      if (!sourceEntity) continue
      const vrmBone = sourceRigMap[sourceEntity] as VRMHumanBoneName
      if (!vrmBone) continue
      const newTrack = track.clone()
      newTrack.name = vrmBone + '.' + track.name.substring(track.name.lastIndexOf('.') + 1)
      newClip.tracks.push(newTrack)
    }
    animationClips.push(newClip)
  }
  getMutableComponent(sourceAnimationEntity, AnimationComponent).animations.set(animationClips)
}
