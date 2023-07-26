import { VRM } from '@pixiv/three-vrm'
import {
  AnimationClip,
  KeyframeTrack,
  Object3D,
  Quaternion,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack
} from 'three'
import { mixamoVRMRigMap } from '../AvatarBoneMatching'

/**
 * Retargets mixamo animation to a VRM rig
 * Based upon https://github.com/pixiv/three-vrm/blob/dev/packages/three-vrm-core/examples/humanoidAnimation/loadMixamoAnimation.js
 *
 * @param {string} url A url of mixamo animation data
 * @param {VRM} vrm A target VRM
 * @returns {Promise<AnimationClip>} The converted AnimationClip
 */
export function retargetMixamoAnimation(clip: AnimationClip, mixamoRig: Object3D, vrm: VRM) {
  const tracks = [] as KeyframeTrack[] // KeyframeTracks compatible with VRM will be added here

  const restRotationInverse = new Quaternion()
  const parentRestWorldRotation = new Quaternion()
  const _quatA = new Quaternion()
  const _vec3 = new Vector3()

  // Adjust with reference to hips height.
  const motionHipsHeight = mixamoRig.getObjectByName('mixamorigHips')!.position.y
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

    if (vrmNodeName != null) {
      console.log(vrmNodeName)

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

        tracks.push(
          new QuaternionKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            track.times,
            track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 2 === 0 ? -v : v))
          )
        )
      } else if (track instanceof VectorKeyframeTrack) {
        const value = track.values.map(
          (v, i) => (vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? -v : v) * hipsPositionScale
        )
        tracks.push(new VectorKeyframeTrack(`${vrmNodeName}.${propertyName}`, track.times, value))
      }
    }
  })

  return new AnimationClip('vrmAnimation', clip.duration, tracks)
}
