import { Bone, Matrix4, Object3D, Quaternion, Skeleton, SkinnedMesh, Vector3 } from 'three'

function getBoneBindMatrix(skeleton: Skeleton, index: number, matrix: Matrix4) {
  const bone = skeleton.bones[index]

  if (bone.parent && (bone.parent as Bone).isBone) {
    const p = skeleton.bones.findIndex((value) => value.name === bone.parent!.name)
    matrix.copy(skeleton.boneInverses[p]).multiply(new Matrix4().copy(skeleton.boneInverses[index]).invert())
  } else {
    matrix.copy(skeleton.boneInverses[index]).invert()
  }
}

/**
 * Updates target bones to have orientations of source bones and
 * Positions of target bones so the the animation that is made for the source skeleton
 * Can be used on target skeleton as well.
 * Note: Target skeleton needs to be roughly the same pose as source.
 * @param targetSkeleton
 * @param sourceSkeleton
 */
export function retargetSkeleton(targetSkeleton: Skeleton, sourceSkeleton: Skeleton) {
  // Assuming target skeleton's bone names are same as source skeleton
  const rootBoneKey = 'Root'
  const targetPos = new Vector3()
  const sourceRot = new Quaternion()
  const mat1 = new Matrix4()
  const mat2 = new Matrix4()
  const mat3 = new Matrix4()

  for (let i = 0; i < targetSkeleton.bones.length; i++) {
    const bone = targetSkeleton.bones[i]

    // Skip the root bone if present
    if (bone.name === rootBoneKey) {
      // this is only tested on root bone, might not work with other bones
      targetSkeleton.boneInverses[i].identity()
      continue
    }

    const j = sourceSkeleton.bones.findIndex((value) => value.name === bone.name)

    if (j < 0) {
      continue
    }

    // retargetedTranslation = retargetedWorldBindPoseInverse[p] * modelWorldBindPose[p] * modelBindPose[i].Translation;
    // retargetedBindPose[i] = retargetedTranslationMatrix * animBindPoseRotationMatrix[i]
    // retargetedWorldBindPose[i] = retargetedWorldBindPose[p] * retargetedBindPose[i];

    mat1.identity()

    if (bone.parent && (bone.parent as Bone).isBone) {
      const parentName = bone.parent.name
      const p = targetSkeleton.bones.findIndex((value) => value.name === parentName)
      if (p > -1) mat1.copy(targetSkeleton.boneInverses[p])
    }

    mat2.copy(targetSkeleton.boneInverses[i]).invert()
    mat2.decompose(targetPos, new Quaternion(), new Vector3())
    targetPos.applyMatrix4(mat1)

    getBoneBindMatrix(sourceSkeleton, j, mat2)
    mat2.decompose(new Vector3(), sourceRot, new Vector3())
    mat3.makeRotationFromQuaternion(sourceRot)
    mat2.makeTranslation(targetPos.x, targetPos.y, targetPos.z).multiply(mat3)

    mat1.invert()
    targetSkeleton.boneInverses[i].copy(mat1).multiply(mat2).invert()
  }

  targetSkeleton.pose()
}

/**
 * Syncs all skinned meshes bone inverses with given skeleton
 * Bones should be same in all skeletons (e.g. same reference)
 * @param model
 * @param skeleton
 */
export function syncModelSkeletons(model: Object3D, skeleton: Skeleton) {
  let meshes: SkinnedMesh[] = []
  model.traverse((obj: SkinnedMesh) => {
    if (obj.isSkinnedMesh) {
      meshes.push(obj)
    }
  })

  const { bones, boneInverses } = skeleton

  for (let i = 0; i < skeleton.bones.length; i++) {
    const bone = bones[i]

    meshes.forEach((mesh) => {
      const { bones: meshBones, boneInverses: meshBoneInverses } = mesh.skeleton
      const j = meshBones.findIndex((b) => b === bone)
      if (j > -1) {
        meshBoneInverses[j].copy(boneInverses[i])
      }
    })
  }
}
