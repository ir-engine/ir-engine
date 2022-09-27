import { Bone, Matrix3, Matrix4, Quaternion, SkinnedMesh, Vector3, Vector4 } from 'three'

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
const conformArmToTpose = (coformingBoneReference: Bone, conformingBone: Bone, targetBone: Bone, side: 1 | -1) => {
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
   * @todo add complete rig t-pose compliance here
   * should we use the retargeting source skeleton as a reference?
   */

  // conform from hips towards extremedies

  conformArmToTpose(rig.LeftShoulder, rig.LeftArm, rig.LeftForeArm, 1)
  conformArmToTpose(rig.LeftArm, rig.LeftForeArm, rig.LeftHand, 1)

  conformArmToTpose(rig.RightShoulder, rig.RightArm, rig.RightForeArm, -1)
  conformArmToTpose(rig.RightArm, rig.RightForeArm, rig.RightHand, -1)
}

/**
 * Apply bone transformations to mesh vertexes and normals
 * @param mesh
 */
export function applySkeletonPose(mesh: SkinnedMesh) {
  const target = new Vector3()
  const posAttr = mesh.geometry.attributes.position
  const normalAttr = mesh.geometry.attributes.normal
  const { bones } = mesh.skeleton

  bones.forEach((bone) => {
    bone.updateMatrixWorld()
  })

  for (let i = 0; i < posAttr.count; i++) {
    target.fromBufferAttribute(posAttr, i)
    mesh.boneTransform(i, target)
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
    .fromBufferAttribute(geometry.attributes.normal, index)
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
