import { AnimationClip, Bone, Matrix4, Object3D, Quaternion, SkinnedMesh, Vector3 } from 'three'
import { fixSkeletonZForward } from '../../xr/classes/SkeletonUtils'
import {
  findEye,
  findFoot,
  findHead,
  findHips,
  findShoulder,
  findSpine,
  getTailBones
} from '../../xr/functions/AvatarFunctions'
import { AnimationManager } from '../AnimationManager'
import { SkeletonUtils } from '../SkeletonUtils'

const localVector = new Vector3()
const localVector2 = new Vector3()
const localMatrix = new Matrix4()

export const standardizeSkeletion = (target: SkinnedMesh, source: SkinnedMesh) => {
  // console.log('target', ...target.skeleton.bones)
  // console.log('source', ...source.skeleton.bones)
  // const targetBones = GetBones(target);
  // const sourceBones = GetBones(source);
  // // console.log("Targetbones are ", targetBones)
  // Object.values(targetBones).forEach((element, id) => {
  //   const boneType = Object.keys(targetBones)[id];
  //   if(element.name === 'root') {
  //     element.position.copy(sourceBones[boneType].position);
  //   }
  //   // console.log("Target bone is", element.name);
  //   // console.log("Source bone is", sourceBones[boneType].name);
  //   // console.log(element.position, sourceBones[boneType].position)
  //   // console.log(element.rotation, sourceBones[boneType].rotation)
  //   if(sourceBones[boneType] === undefined || sourceBones[boneType] === ""){
  //     console.warn("Can't rename boneType", boneType, "to", element.name)
  //   }
  //   element.name = sourceBones[boneType].name;
  // })
  // const newClips: AnimationClip[] = [];
  // AnimationManager.instance._animations.forEach((clip) => {
  //   // const newClip = SkeletonUtils.retargetClip(target, source, clip, { hip: sourceBones.Hips.name });
  //   newClips.push(clip);
  //   // console.log(newClip)
  // })
  // target.animations = newClips;
}

const GetBones = (armature: SkinnedMesh) => {
  const skeleton = armature.skeleton
  // console.log("Getting bones!");
  // console.log(skeleton);
  const findClosestChildBone = (bone, pred) => {
    const _recurse = (bone) => {
      if (pred(bone)) {
        return bone
      } else {
        for (let i = 0; i < bone.children.length; i++) {
          const result = _recurse(bone.children[i])
          if (result) {
            return result
          }
        }
        return null
      }
    }
    return _recurse(bone)
  }
  const findHand = (shoulderBone) => findClosestChildBone(shoulderBone, (bone) => /hand|wrist/i.test(bone.name))
  const findFinger = (handBone, r) => findClosestChildBone(handBone, (bone) => r.test(bone.name))

  const getOptional = (o) => o || new Bone()

  const ensureParent = (o, parent?) => {
    if (!o.parent) {
      if (!parent) {
        parent = new Bone()
      }
      parent.add(o)
    }
    return o.parent
  }

  const tailBones = getTailBones(skeleton)
  const Eye_L = findEye(tailBones, true)
  const Eye_R = findEye(tailBones, false)
  const Head = findHead(tailBones)
  const Neck = Head.parent
  const Chest = Neck.parent
  const Hips = findHips(skeleton)
  const Spine = findSpine(Chest, Hips)
  const Left_shoulder = findShoulder(tailBones, true)
  const Left_wrist = findHand(Left_shoulder)
  const Left_thumb2 = getOptional(
    findFinger(Left_wrist, /thumb3_end|thumb2_|handthumb3|thumb_distal|thumb02l|l_thumb3|thumb002l/i)
  )
  const Left_thumb1 = ensureParent(Left_thumb2)
  const Left_thumb0 = ensureParent(Left_thumb1, Left_wrist)
  const Left_indexFinger3 = getOptional(
    findFinger(Left_wrist, /index(?:finger)?3|index_distal|index02l|indexfinger3_l|index002l/i)
  )
  const Left_indexFinger2 = ensureParent(Left_indexFinger3)
  const Left_indexFinger1 = ensureParent(Left_indexFinger2, Left_wrist)
  const Left_middleFinger3 = getOptional(
    findFinger(Left_wrist, /middle(?:finger)?3|middle_distal|middle02l|middlefinger3_l|middle002l/i)
  )
  const Left_middleFinger2 = ensureParent(Left_middleFinger3)
  const Left_middleFinger1 = ensureParent(Left_middleFinger2, Left_wrist)
  const Left_ringFinger3 = getOptional(
    findFinger(Left_wrist, /ring(?:finger)?3|ring_distal|ring02l|ringfinger3_l|ring002l/i)
  )
  const Left_ringFinger2 = ensureParent(Left_ringFinger3)
  const Left_ringFinger1 = ensureParent(Left_ringFinger2, Left_wrist)
  const Left_littleFinger3 = getOptional(
    findFinger(Left_wrist, /little(?:finger)?3|pinky3|little_distal|little02l|lifflefinger3_l|little002l/i)
  )
  const Left_littleFinger2 = ensureParent(Left_littleFinger3)
  const Left_littleFinger1 = ensureParent(Left_littleFinger2, Left_wrist)
  const Left_elbow = Left_wrist.parent
  const Left_arm = Left_elbow.parent
  const Right_shoulder = findShoulder(tailBones, false)
  const Right_wrist = findHand(Right_shoulder)
  const Right_thumb2 = getOptional(
    findFinger(Right_wrist, /thumb3_end|thumb2_|handthumb3|thumb_distal|thumb02r|r_thumb3|thumb002r/i)
  )
  const Right_thumb1 = ensureParent(Right_thumb2)
  const Right_thumb0 = ensureParent(Right_thumb1, Right_wrist)
  const Right_indexFinger3 = getOptional(
    findFinger(Right_wrist, /index(?:finger)?3|index_distal|index02r|indexfinger3_r|index002r/i)
  )
  const Right_indexFinger2 = ensureParent(Right_indexFinger3)
  const Right_indexFinger1 = ensureParent(Right_indexFinger2, Right_wrist)
  const Right_middleFinger3 = getOptional(
    findFinger(Right_wrist, /middle(?:finger)?3|middle_distal|middle02r|middlefinger3_r|middle002r/i)
  )
  const Right_middleFinger2 = ensureParent(Right_middleFinger3)
  const Right_middleFinger1 = ensureParent(Right_middleFinger2, Right_wrist)
  const Right_ringFinger3 = getOptional(
    findFinger(Right_wrist, /ring(?:finger)?3|ring_distal|ring02r|ringfinger3_r|ring002r/i)
  )
  const Right_ringFinger2 = ensureParent(Right_ringFinger3)
  const Right_ringFinger1 = ensureParent(Right_ringFinger2, Right_wrist)
  const Right_littleFinger3 = getOptional(
    findFinger(Right_wrist, /little(?:finger)?3|pinky3|little_distal|little02r|lifflefinger3_r|little002r/i)
  )
  const Right_littleFinger2 = ensureParent(Right_littleFinger3)
  const Right_littleFinger1 = ensureParent(Right_littleFinger2, Right_wrist)
  const Right_elbow = Right_wrist.parent
  const Right_arm = Right_elbow.parent
  const Left_ankle = findFoot(tailBones, true)
  const Left_knee = Left_ankle.parent
  const Left_leg = Left_knee.parent
  const Right_ankle = findFoot(tailBones, false)
  const Right_knee = Right_ankle.parent
  const Right_leg = Right_knee.parent

  const modelBones = {
    Hips,
    Spine,
    Chest,
    Neck,
    Head,
    Eye_L,
    Eye_R,

    Left_shoulder,
    Left_arm,
    Left_elbow,
    Left_wrist,
    Left_thumb2,
    Left_thumb1,
    Left_thumb0,
    Left_indexFinger3,
    Left_indexFinger2,
    Left_indexFinger1,
    Left_middleFinger3,
    Left_middleFinger2,
    Left_middleFinger1,
    Left_ringFinger3,
    Left_ringFinger2,
    Left_ringFinger1,
    Left_littleFinger3,
    Left_littleFinger2,
    Left_littleFinger1,
    Left_leg,
    Left_knee,
    Left_ankle,

    Right_shoulder,
    Right_arm,
    Right_elbow,
    Right_wrist,
    Right_thumb2,
    Right_thumb1,
    Right_thumb0,
    Right_indexFinger3,
    Right_indexFinger2,
    Right_indexFinger1,
    Right_middleFinger3,
    Right_middleFinger2,
    Right_middleFinger1,
    Right_ringFinger3,
    Right_ringFinger2,
    Right_ringFinger1,
    Right_littleFinger3,
    Right_littleFinger2,
    Right_littleFinger1,
    Right_leg,
    Right_knee,
    Right_ankle
  }

  return modelBones

  // everything below this is from webaverse, doesnt seem to have an impact on the models

  const _getEyePosition = () => {
    if (Eye_L && Eye_R) {
      return Eye_L.getWorldPosition(new Vector3()).add(Eye_R.getWorldPosition(new Vector3())).divideScalar(2)
    } else {
      const neckToHeadDiff = Head.getWorldPosition(new Vector3()).sub(Neck.getWorldPosition(new Vector3()))
      if (neckToHeadDiff.z < 0) {
        neckToHeadDiff.z *= -1
      }
      return Head.getWorldPosition(new Vector3()).add(neckToHeadDiff)
    }
  }

  // const eyeDirection = _getEyePosition().sub(Head.getWorldPosition(new Vector3()));
  const leftArmDirection = Left_wrist.getWorldPosition(new Vector3()).sub(Head.getWorldPosition(new Vector3()))
  const flipZ = leftArmDirection.x < 0 //eyeDirection.z < 0;
  const armatureDirection = new Vector3(0, 1, 0).applyQuaternion(armature.quaternion)
  const flipY = armatureDirection.z < -0.5
  const legDirection = new Vector3(0, 0, -1).applyQuaternion(
    Left_leg.getWorldQuaternion(new Quaternion()).premultiply(armature.quaternion.clone().invert())
  )
  const flipLeg = legDirection.y < 0.5

  const armatureQuaternion = armature.quaternion.clone()
  const armatureMatrixInverse = armature.matrixWorld.clone().invert()
  armature.position.set(0, 0, 0)
  armature.quaternion.set(0, 0, 0, 1)
  armature.scale.set(1, 1, 1)
  armature.updateMatrix()

  Head.traverse((o) => {
    o.savedPosition = o.position.clone()
    o.savedMatrixWorld = o.matrixWorld.clone()
  })

  const allHairBones = []
  const _recurseAllHairBones = (bones) => {
    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i]
      if (/hair/i.test(bone.name)) {
        allHairBones.push(bone)
      }
      _recurseAllHairBones(bone.children)
    }
  }
  _recurseAllHairBones(skeleton.bones)

  const preRotations = {}
  const _ensurePrerotation = (k) => {
    const boneName = modelBones[k].name
    if (!preRotations[boneName]) {
      preRotations[boneName] = new Quaternion()
    }
    return preRotations[boneName]
  }
  if (flipY) {
    _ensurePrerotation('Hips').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))
  }
  if (flipZ) {
    _ensurePrerotation('Hips').premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI))
  }
  if (flipLeg) {
    ;['Left_leg', 'Right_leg'].forEach((k) => {
      _ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2))
    })
  }

  const _recurseBoneAttachments = (o) => {
    for (const child of o.children) {
      if (child.isBone) {
        _recurseBoneAttachments(child)
      } else {
        child.matrix
          .premultiply(
            localMatrix.compose(
              localVector.set(0, 0, 0),
              new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI),
              localVector2.set(1, 1, 1)
            )
          )
          .decompose(child.position, child.quaternion, child.scale)
      }
    }
  }
  _recurseBoneAttachments(modelBones['Hips'])

  const qrArm = flipZ ? Left_arm : Right_arm
  const qrElbow = flipZ ? Left_elbow : Right_elbow
  const qrWrist = flipZ ? Left_wrist : Right_wrist
  const qr = new Quaternion()
    .setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2)
    .premultiply(
      new Quaternion().setFromRotationMatrix(
        new Matrix4().lookAt(
          new Vector3(0, 0, 0),
          qrElbow
            .getWorldPosition(new Vector3())
            .applyMatrix4(armatureMatrixInverse)
            .sub(qrArm.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
            .applyQuaternion(armatureQuaternion),
          new Vector3(0, 1, 0)
        )
      )
    )
  const qr2 = new Quaternion()
    .setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2)
    .premultiply(
      new Quaternion().setFromRotationMatrix(
        new Matrix4().lookAt(
          new Vector3(0, 0, 0),
          qrWrist
            .getWorldPosition(new Vector3())
            .applyMatrix4(armatureMatrixInverse)
            .sub(qrElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
            .applyQuaternion(armatureQuaternion),
          new Vector3(0, 1, 0)
        )
      )
    )
  const qlArm = flipZ ? Right_arm : Left_arm
  const qlElbow = flipZ ? Right_elbow : Left_elbow
  const qlWrist = flipZ ? Right_wrist : Left_wrist
  const ql = new Quaternion()
    .setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
    .premultiply(
      new Quaternion().setFromRotationMatrix(
        new Matrix4().lookAt(
          new Vector3(0, 0, 0),
          qlElbow
            .getWorldPosition(new Vector3())
            .applyMatrix4(armatureMatrixInverse)
            .sub(qlArm.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
            .applyQuaternion(armatureQuaternion),
          new Vector3(0, 1, 0)
        )
      )
    )
  const ql2 = new Quaternion()
    .setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
    .premultiply(
      new Quaternion().setFromRotationMatrix(
        new Matrix4().lookAt(
          new Vector3(0, 0, 0),
          qlWrist
            .getWorldPosition(new Vector3())
            .applyMatrix4(armatureMatrixInverse)
            .sub(qlElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
            .applyQuaternion(armatureQuaternion),
          new Vector3(0, 1, 0)
        )
      )
    )

  _ensurePrerotation('Right_arm').multiply(qr.clone().invert())
  _ensurePrerotation('Right_elbow').multiply(qr.clone()).premultiply(qr2.clone().invert())
  _ensurePrerotation('Left_arm').multiply(ql.clone().invert())
  _ensurePrerotation('Left_elbow').multiply(ql.clone()).premultiply(ql2.clone().invert())

  _ensurePrerotation('Left_leg').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))
  _ensurePrerotation('Right_leg').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))

  for (const k in preRotations) {
    preRotations[k].invert()
  }
  fixSkeletonZForward(skeleton.bones[0], {
    preRotations
  })
  // model.traverse(o => {
  //   if (o.isSkinnedMesh) {
  //     o.bind((o.skeleton.bones.length === skeleton.bones.length && o.skeleton.bones.every((bone, i) => bone === skeleton.bones[i])) ? skeleton : o.skeleton);
  //   }
  // });
  if (flipY) {
    modelBones.Hips.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))
  }
  if (!flipZ) {
    /* ['Left_arm', 'Right_arm'].forEach((name, i) => {
      const bone = modelBones[name];
      if (bone) {
        bone.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), (i === 0 ? 1 : -1) * Math.PI*0.25));
      }
    }); */
  } else {
    modelBones.Hips.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI))
  }
  modelBones.Right_arm.quaternion.premultiply(qr.clone().invert())
  modelBones.Right_elbow.quaternion.premultiply(qr).premultiply(qr2.clone().invert())
  modelBones.Left_arm.quaternion.premultiply(ql.clone().invert())
  modelBones.Left_elbow.quaternion.premultiply(ql).premultiply(ql2.clone().invert())
  armature.updateMatrixWorld(true)

  Hips.traverse((bone) => {
    if (bone.isBone) {
      bone.initialQuaternion = bone.quaternion.clone()
    }
  })

  return modelBones
}
