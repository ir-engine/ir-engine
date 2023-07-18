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

import {
  Bone,
  BufferAttribute,
  InterleavedBufferAttribute,
  Matrix3,
  Matrix4,
  Quaternion,
  SkinnedMesh,
  Vector3,
  Vector4
} from 'three'

import { BoneStructure } from '../AvatarBoneMatching'

const baseNormal = new Vector3()
const skinIndex = new Vector4()
const skinWeight = new Vector4()
const vector = new Vector3()
const matrix = new Matrix4()
const matrix3 = new Matrix3()

/**
 * Checks if the the upper arm bones are horizontal
 * @param rig
 * @returns
 */
export function isSkeletonInTPose(rig: BoneStructure) {
  const vec1 = new Vector3()
  const vec2 = new Vector3()

  const { LeftArm, LeftForeArm } = rig

  LeftArm.getWorldPosition(vec1)
  LeftForeArm.getWorldPosition(vec2)

  vec2.sub(vec1).normalize()
  const cos = new Vector3(1, 0, 0).dot(vec2)

  // ~10 degrees
  return cos >= 0.98
}

const vec1 = new Vector3()
const vec2 = new Vector3()
const quat = new Quaternion()
const quat2 = new Quaternion()

/**
 * @param coformingBoneReference parent rerefence bone to conform to
 * @param conformingBone bone to conform to
 * @param targetBone target bone to derive angle from
 * @param {1 | -1} side 1 is left, -1 is right
 */
const conformArmToTpose = (
  coformingBoneReference: Bone | undefined,
  conformingBone: Bone | undefined,
  targetBone: Bone | undefined,
  side: 1 | -1
) => {
  if (!coformingBoneReference || !conformingBone || !targetBone) return
  conformingBone.getWorldPosition(vec1)
  targetBone.getWorldPosition(vec2)
  vec2.sub(vec1).normalize()
  coformingBoneReference!.getWorldQuaternion(quat2)
  quat2.invert()
  vec2.applyQuaternion(quat2)
  vec1.set(side, 0, 0).applyQuaternion(quat2)
  conformingBone.quaternion.premultiply(quat.setFromUnitVectors(vec2, vec1))
  conformingBone.updateMatrixWorld()
}

/**
 * Attempts to rotate and straighten the arms so they create a T shape with avatar's body
 *
 * @param rig
 */
export function makeTPose(rig: BoneStructure) {
  /**
   * @todo add complete rig t-pose compliance here #7264
   * should we use the retargeting source skeleton as a reference?
   */

  // conform from hips towards extremedies

  conformArmToTpose(rig.LeftShoulder, rig.LeftArm, rig.LeftForeArm, 1)
  conformArmToTpose(rig.LeftArm, rig.LeftForeArm, rig.LeftHand, 1)

  conformArmToTpose(rig.LeftHand, rig.LeftHandThumb1, rig.LeftHandThumb2, 1)
  conformArmToTpose(rig.LeftHandThumb1, rig.LeftHandThumb2, rig.LeftHandThumb3, 1)
  conformArmToTpose(rig.LeftHandThumb2, rig.LeftHandThumb3, rig.LeftHandThumb4, 1)

  conformArmToTpose(rig.LeftHand, rig.LeftHandIndex1, rig.LeftHandIndex2, 1)
  conformArmToTpose(rig.LeftHandIndex1, rig.LeftHandIndex2, rig.LeftHandIndex3, 1)
  conformArmToTpose(rig.LeftHandIndex2, rig.LeftHandIndex3, rig.LeftHandIndex4, 1)
  conformArmToTpose(rig.LeftHandIndex3, rig.LeftHandIndex4, rig.LeftHandIndex5, 1)

  conformArmToTpose(rig.LeftHand, rig.LeftHandMiddle1, rig.LeftHandMiddle2, 1)
  conformArmToTpose(rig.LeftHandMiddle1, rig.LeftHandMiddle2, rig.LeftHandMiddle3, 1)
  conformArmToTpose(rig.LeftHandMiddle2, rig.LeftHandMiddle3, rig.LeftHandMiddle4, 1)
  conformArmToTpose(rig.LeftHandMiddle3, rig.LeftHandMiddle4, rig.LeftHandMiddle5, 1)

  conformArmToTpose(rig.LeftHand, rig.LeftHandRing1, rig.LeftHandRing2, 1)
  conformArmToTpose(rig.LeftHandRing1, rig.LeftHandRing2, rig.LeftHandRing3, 1)
  conformArmToTpose(rig.LeftHandRing2, rig.LeftHandRing3, rig.LeftHandRing4, 1)
  conformArmToTpose(rig.LeftHandRing3, rig.LeftHandRing4, rig.LeftHandRing5, 1)

  conformArmToTpose(rig.LeftHand, rig.LeftHandPinky1, rig.LeftHandPinky2, 1)
  conformArmToTpose(rig.LeftHandPinky1, rig.LeftHandPinky2, rig.LeftHandPinky3, 1)
  conformArmToTpose(rig.LeftHandPinky2, rig.LeftHandPinky3, rig.LeftHandPinky4, 1)
  conformArmToTpose(rig.LeftHandPinky3, rig.LeftHandPinky4, rig.LeftHandPinky5, 1)

  conformArmToTpose(rig.RightShoulder, rig.RightArm, rig.RightForeArm, -1)
  conformArmToTpose(rig.RightArm, rig.RightForeArm, rig.RightHand, -1)

  conformArmToTpose(rig.RightHand, rig.RightHandThumb1, rig.RightHandThumb2, -1)
  conformArmToTpose(rig.RightHandThumb1, rig.RightHandThumb2, rig.RightHandThumb3, -1)
  conformArmToTpose(rig.RightHandThumb2, rig.RightHandThumb3, rig.RightHandThumb4, -1)

  conformArmToTpose(rig.RightHand, rig.RightHandIndex1, rig.RightHandIndex2, -1)
  conformArmToTpose(rig.RightHandIndex1, rig.RightHandIndex2, rig.RightHandIndex3, -1)
  conformArmToTpose(rig.RightHandIndex2, rig.RightHandIndex3, rig.RightHandIndex4, -1)
  conformArmToTpose(rig.RightHandIndex3, rig.RightHandIndex4, rig.RightHandIndex5, -1)

  conformArmToTpose(rig.RightHand, rig.RightHandMiddle1, rig.RightHandMiddle2, -1)
  conformArmToTpose(rig.RightHandMiddle1, rig.RightHandMiddle2, rig.RightHandMiddle3, -1)
  conformArmToTpose(rig.RightHandMiddle2, rig.RightHandMiddle3, rig.RightHandMiddle4, -1)
  conformArmToTpose(rig.RightHandMiddle3, rig.RightHandMiddle4, rig.RightHandMiddle5, -1)

  conformArmToTpose(rig.RightHand, rig.RightHandRing1, rig.RightHandRing2, -1)
  conformArmToTpose(rig.RightHandRing1, rig.RightHandRing2, rig.RightHandRing3, -1)
  conformArmToTpose(rig.RightHandRing2, rig.RightHandRing3, rig.RightHandRing4, -1)
  conformArmToTpose(rig.RightHandRing3, rig.RightHandRing4, rig.RightHandRing5, -1)

  conformArmToTpose(rig.RightHand, rig.RightHandPinky1, rig.RightHandPinky2, -1)
  conformArmToTpose(rig.RightHandPinky1, rig.RightHandPinky2, rig.RightHandPinky3, -1)
  conformArmToTpose(rig.RightHandPinky2, rig.RightHandPinky3, rig.RightHandPinky4, -1)
  conformArmToTpose(rig.RightHandPinky3, rig.RightHandPinky4, rig.RightHandPinky5, -1)
}

/**
 * Apply bone transformations to mesh vertexes and normals
 * @param mesh
 */
export function applySkeletonPose(mesh: SkinnedMesh) {
  const target = new Vector3()
  const posAttr = mesh.geometry.attributes.position as BufferAttribute | InterleavedBufferAttribute
  const normalAttr = mesh.geometry.attributes.normal as BufferAttribute | InterleavedBufferAttribute
  const { bones } = mesh.skeleton

  bones.forEach((bone) => {
    bone.updateMatrixWorld()
  })

  for (let i = 0; i < posAttr.count; i++) {
    target.fromBufferAttribute(posAttr, i)
    mesh.applyBoneTransform(i, target)
    posAttr.setXYZ(i, target.x, target.y, target.z)

    target.fromBufferAttribute(normalAttr, i)
    boneNormalTransform(mesh, i, target)
    normalAttr.setXYZ(i, target.x, target.y, target.z)
  }

  posAttr.needsUpdate = true
  normalAttr.needsUpdate = true

  mesh.skeleton.calculateInverses()
}

export function boneNormalTransform(mesh: SkinnedMesh, index: number, target: Vector3) {
  const skeleton = mesh.skeleton
  const geometry = mesh.geometry

  skinIndex.fromBufferAttribute(geometry.attributes.skinIndex as any, index)
  skinWeight.fromBufferAttribute(geometry.attributes.skinWeight as any, index)
  baseNormal
    .fromBufferAttribute(geometry.attributes.normal as BufferAttribute | InterleavedBufferAttribute, index)
    .applyNormalMatrix(matrix3.getNormalMatrix(mesh.bindMatrix))

  target.set(0, 0, 0)

  for (let i = 0; i < 4; i++) {
    let weight = skinWeight.getComponent(i)

    if (weight !== 0) {
      let boneIndex = skinIndex.getComponent(i)

      matrix.multiplyMatrices(skeleton.bones[boneIndex].matrixWorld, skeleton.boneInverses[boneIndex])

      target.addScaledVector(vector.copy(baseNormal).applyNormalMatrix(matrix3.getNormalMatrix(matrix)), weight)
    }
  }

  matrix3.getNormalMatrix(mesh.bindMatrixInverse)
  return target.applyNormalMatrix(matrix3)
}
