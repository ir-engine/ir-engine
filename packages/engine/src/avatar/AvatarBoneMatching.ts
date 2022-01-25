//TODO:
// This retargeting logic is based exokitxr retargeting system
// https://github.com/exokitxr/avatars

import { Bone, Matrix4, Quaternion, Vector3 } from 'three'

export type BoneNames =
  | 'Root'
  | 'Hips'
  | 'Spine'
  | 'Spine1'
  | 'Spine2'
  | 'Neck'
  | 'Head'
  | 'LeftEye'
  | 'RightEye'
  | 'LeftShoulder'
  | 'LeftArm'
  | 'LeftForeArm'
  | 'LeftHand'
  | 'LeftUpLeg'
  | 'LeftLeg'
  | 'LeftFoot'
  | 'RightShoulder'
  | 'RightArm'
  | 'RightForeArm'
  | 'RightHand'
  | 'RightUpLeg'
  | 'RightLeg'
  | 'RightFoot'

export type BoneStructure = {
  [bone in BoneNames]: Bone
}

const _getTailBones = (skeleton) => {
  const result: any[] = []
  const _recurse = (bones) => {
    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i]
      if (bone.children.length === 0) {
        if (!result.includes(bone)) {
          result.push(bone)
        }
      } else {
        _recurse(bone.children)
      }
    }
  }
  _recurse(skeleton.bones)
  return result
}
const _findClosestParentBone = (bone, pred) => {
  for (; bone; bone = bone.parent) {
    if (pred(bone)) {
      return bone
    }
  }
  return null
}
const _findFurthestParentBone = (bone, pred) => {
  let result = null
  for (; bone; bone = bone.parent) {
    if (pred(bone)) {
      result = bone
    }
  }
  return result
}
const _distanceToParentBone = (bone, parentBone) => {
  for (let i = 0; bone; bone = bone.parent, i++) {
    if (bone === parentBone) {
      return i
    }
  }
  return Infinity
}
const _findClosestChildBone = (bone, pred) => {
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
const _traverseChild = (bone, distance) => {
  if (distance <= 0) {
    return bone
  } else {
    for (let i = 0; i < bone.children.length; i++) {
      const child = bone.children[i]
      const subchild = _traverseChild(child, distance - 1)
      if (subchild !== null) {
        return subchild
      }
    }
    return null
  }
}
const _countCharacters = (name, regex) => {
  let result = 0
  for (let i = 0; i < name.length; i++) {
    if (regex.test(name[i])) {
      result++
    }
  }
  return result
}
const _findHips = (skeleton) => skeleton.bones.find((bone) => /hip|pelvis/i.test(bone.name))
const _findHead = (tailBones) => {
  const headBones = tailBones
    .map((tailBone) => {
      const headBone = _findFurthestParentBone(tailBone, (bone) => /head/i.test(bone.name))
      if (headBone) {
        return headBone
      } else {
        return null
      }
    })
    .filter((bone) => bone)
  const headBone = headBones.length > 0 ? headBones[0] : null
  if (headBone) {
    return headBone
  } else {
    return null
  }
}
const _findEye = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const eyeBones = tailBones
    .map((tailBone) => {
      const eyeBone = _findFurthestParentBone(
        tailBone,
        (bone) => /eye/i.test(bone.name) && regexp.test(bone.name.replace(/eye/gi, ''))
      )
      if (eyeBone) {
        return eyeBone
      } else {
        return null
      }
    })
    .filter((spec) => spec)
    .sort((a, b) => {
      const aName = a.name.replace(/shoulder|clavicle/gi, '')
      const aLeftBalance = _countCharacters(aName, /l/i) - _countCharacters(aName, /r/i)
      const bName = b.name.replace(/shoulder|clavicle/gi, '')
      const bLeftBalance = _countCharacters(bName, /l/i) - _countCharacters(bName, /r/i)
      if (!left) {
        return aLeftBalance - bLeftBalance
      } else {
        return bLeftBalance - aLeftBalance
      }
    })
  const eyeBone = eyeBones.length > 0 ? eyeBones[0] : null
  if (eyeBone) {
    return eyeBone
  } else {
    return null
  }
}
const _findSpine = (chest, hips) => {
  for (let bone = chest; bone; bone = bone.parent) {
    if (bone.parent === hips) {
      return bone
    }
  }
  return null
}
const _findShoulder = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const shoulderBones = tailBones
    .map((tailBone) => {
      const shoulderBone = _findClosestParentBone(
        tailBone,
        (bone) => /shoulder|clavicle/i.test(bone.name) && regexp.test(bone.name.replace(/shoulder|clavicle/gi, ''))
      )
      if (shoulderBone) {
        const distance = _distanceToParentBone(tailBone, shoulderBone)
        if (distance >= 3) {
          return {
            bone: shoulderBone,
            distance
          }
        } else {
          return null
        }
      } else {
        return null
      }
    })
    .filter((spec) => spec)
    .sort((a, b) => {
      const diff = b.distance - a.distance
      if (diff !== 0) {
        return diff
      } else {
        const aName = a.bone.name.replace(/shoulder|clavicle/gi, '')
        const aLeftBalance = _countCharacters(aName, /l/i) - _countCharacters(aName, /r/i)
        const bName = b.bone.name.replace(/shoulder|clavicle/gi, '')
        const bLeftBalance = _countCharacters(bName, /l/i) - _countCharacters(bName, /r/i)
        if (!left) {
          return aLeftBalance - bLeftBalance
        } else {
          return bLeftBalance - aLeftBalance
        }
      }
    })
  const shoulderBone = shoulderBones.length > 0 ? shoulderBones[0].bone : null
  if (shoulderBone) {
    return shoulderBone
  } else {
    return null
  }
}
const _findHand = (shoulderBone) => _findClosestChildBone(shoulderBone, (bone) => /hand|wrist/i.test(bone.name))
const _findFoot = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const legBones = tailBones
    .map((tailBone) => {
      const footBone = _findFurthestParentBone(
        tailBone,
        (bone) => /foot|ankle/i.test(bone.name) && regexp.test(bone.name.replace(/foot|ankle/gi, ''))
      )
      if (footBone) {
        const legBone = _findFurthestParentBone(
          footBone,
          (bone) => /leg|thigh/i.test(bone.name) && regexp.test(bone.name.replace(/leg|thigh/gi, ''))
        )
        if (legBone) {
          const distance = _distanceToParentBone(footBone, legBone)
          if (distance >= 2) {
            return {
              footBone,
              distance
            }
          } else {
            return null
          }
        } else {
          return null
        }
      } else {
        return null
      }
    })
    .filter((spec) => spec)
    .sort((a, b) => {
      const diff = b.distance - a.distance
      if (diff !== 0) {
        return diff
      } else {
        const aName = a.footBone.name.replace(/foot|ankle/gi, '')
        const aLeftBalance = _countCharacters(aName, /l/i) - _countCharacters(aName, /r/i)
        const bName = b.footBone.name.replace(/foot|ankle/gi, '')
        const bLeftBalance = _countCharacters(bName, /l/i) - _countCharacters(bName, /r/i)
        if (!left) {
          return aLeftBalance - bLeftBalance
        } else {
          return bLeftBalance - aLeftBalance
        }
      }
    })
  const footBone = legBones.length > 0 ? legBones[0].footBone : null
  if (footBone) {
    return footBone
  } else {
    return null
  }
}

const _findArmature = (bone) => {
  for (; ; bone = bone.parent) {
    if (!bone.isBone) {
      return bone
    }
  }
  return null // can't happen
}

const _findFinger = (r, left, parent) => {
  const fingerTipBone = parent.tailBones
    .filter(
      (bone) =>
        r.test(bone.name) &&
        _findClosestParentBone(bone, (bone) => bone === parent.Left_wrist || bone === parent.Right_wrist)
    )
    .sort((a, b) => {
      const aName = a.name.replace(r, '')
      const aLeftBalance = _countCharacters(aName, /l/i) - _countCharacters(aName, /r/i)
      const bName = b.name.replace(r, '')
      const bLeftBalance = _countCharacters(bName, /l/i) - _countCharacters(bName, /r/i)
      if (!left) {
        return aLeftBalance - bLeftBalance
      } else {
        return bLeftBalance - aLeftBalance
      }
    })
  const fingerRootBone =
    fingerTipBone.length > 0 ? _findFurthestParentBone(fingerTipBone[0], (bone) => r.test(bone.name)) : null
  return fingerRootBone
}

function fixSkeletonZForward(rootBone, context) {
  context = context || {}
  precalculateZForwards(rootBone, context)
  if (context.exclude) {
    var bones = [rootBone]
    rootBone.traverse((b) => bones.push(b))
    bones.forEach((b) => {
      if (~context.exclude.indexOf(b.id) || ~context.exclude.indexOf(b.name)) {
        delete context.averagedDirs[b.id]
      }
    })
  }
  return setZForward(rootBone, context)
}

function precalculateZForwards(rootBone, context) {
  context = context || rootBone
  context.worldPos = context.worldPos || {}
  context.averagedDirs = context.averagedDirs || {}
  context.preRotations = context.preRotations || {}
  getOriginalWorldPositions(rootBone, context.worldPos)
  calculateAverages(rootBone, context.worldPos, context.averagedDirs)
  return context
}

function setZForward(rootBone, context) {
  if (!context || !context.worldPos) {
    context = context || {}
    precalculateZForwards(rootBone, context)
  }
  updateTransformations(rootBone, context.worldPos, context.averagedDirs, context.preRotations)
  return context
}

function getOriginalWorldPositions(rootBone, worldPos) {
  var rootBoneWorldPos = rootBone.getWorldPosition(new Vector3())
  worldPos[rootBone.id] = [rootBoneWorldPos]
  rootBone.children.forEach((child) => {
    getOriginalWorldPositions(child, worldPos)
  })
}

function calculateAverages(parentBone, worldPos, averagedDirs) {
  var averagedDir = new Vector3()
  parentBone.children.forEach((childBone) => {
    //average the child bone world pos
    var childBonePosWorld = worldPos[childBone.id][0]
    averagedDir.add(childBonePosWorld)
  })

  averagedDir.multiplyScalar(1 / parentBone.children.length)
  averagedDirs[parentBone.id] = averagedDir

  parentBone.children.forEach((childBone) => {
    calculateAverages(childBone, worldPos, averagedDirs)
  })
}

function updateTransformations(parentBone, worldPos, averagedDirs, preRotations) {
  var averagedDir = averagedDirs[parentBone.id]
  if (averagedDir) {
    //set quaternion
    const RESETQUAT = new Quaternion()
    parentBone.quaternion.copy(RESETQUAT)
    // parentBone.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI*2));
    parentBone.updateMatrixWorld()

    //get the child bone position in local coordinates
    // var childBoneDir = parentBone.worldToLocal(averagedDir.clone()).normalize();

    //set direction to face child
    // setQuaternionFromDirection(childBoneDir, Y_AXIS, parentBone.quaternion)
    // console.log('new quaternion', parentBone.quaternion.toArray().join(','));
  }
  var preRot = preRotations[parentBone.id] || preRotations[parentBone.name]
  if (preRot) parentBone.quaternion.multiply(preRot)
  // parentBone.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
  parentBone.updateMatrixWorld()

  //set child bone position relative to the new parent matrix.
  parentBone.children.forEach((childBone) => {
    var childBonePosWorld = worldPos[childBone.id][0].clone()
    parentBone.worldToLocal(childBonePosWorld)
    childBone.position.copy(childBonePosWorld)
  })

  parentBone.children.forEach((childBone) => {
    updateTransformations(childBone, worldPos, averagedDirs, preRotations)
  })
}

function getSkeleton(model) {
  let skeletonSkinnedMesh
  model.traverse((o) => {
    if (o.isSkinnedMesh && o.skeleton && o.skeleton.bones) {
      const hips = _findHips(o.skeleton)
      if (hips) skeletonSkinnedMesh = o
    }
  })
  const skeleton = skeletonSkinnedMesh && skeletonSkinnedMesh.skeleton
  return skeleton
}

const foundRoot = (bone) => {
  if (bone.parent && bone.parent.parent) {
    return foundRoot(bone.parent)
  } else {
    return bone.parent
  }
}

export default function AvatarBoneMatching(model): BoneStructure {
  try {
    const skeleton = getSkeleton(model)
    const Hips = _findHips(skeleton)
    const armature = _findArmature(Hips)
    const tailBones = _getTailBones(skeleton)
    const Eye_L = _findEye(tailBones, true)
    const Eye_R = _findEye(tailBones, false)
    const Head = _findHead(tailBones)
    const Neck = Head.parent
    const Chest = Neck.parent
    const Spine1 = Chest.parent
    const Spine = _findSpine(Chest, Hips)
    const Left_shoulder = _findShoulder(tailBones, true)
    const Left_wrist = _findHand(Left_shoulder)
    const Left_elbow = Left_wrist.parent
    const Left_arm = Left_elbow.parent
    const Right_shoulder = _findShoulder(tailBones, false)
    const Right_wrist = _findHand(Right_shoulder)
    const Right_elbow = Right_wrist.parent
    const Right_arm = Right_elbow.parent
    const Left_ankle = _findFoot(tailBones, true)
    const Left_knee = Left_ankle.parent
    const Left_leg = Left_knee.parent
    const Right_ankle = _findFoot(tailBones, false)
    const Right_knee = Right_ankle.parent
    const Right_leg = Right_knee.parent

    const fingerParentBones = {
      tailBones,
      Left_wrist,
      Right_wrist
    }

    const fingerBones = {
      left: {
        thumb: _findFinger(/thumb/gi, true, fingerParentBones),
        index: _findFinger(/index/gi, true, fingerParentBones),
        middle: _findFinger(/middle/gi, true, fingerParentBones),
        ring: _findFinger(/ring/gi, true, fingerParentBones),
        little: _findFinger(/little/gi, true, fingerParentBones) || _findFinger(/pinky/gi, true, fingerParentBones)
      },
      right: {
        thumb: _findFinger(/thumb/gi, false, fingerParentBones),
        index: _findFinger(/index/gi, false, fingerParentBones),
        middle: _findFinger(/middle/gi, false, fingerParentBones),
        ring: _findFinger(/ring/gi, false, fingerParentBones),
        little: _findFinger(/little/gi, false, fingerParentBones) || _findFinger(/pinky/gi, false, fingerParentBones)
      }
    }

    const modelBones = {
      Hips,
      Spine,
      Chest,
      Neck,
      Head,
      /* Eye_L,
      Eye_R, */

      Left_shoulder,
      Left_arm,
      Left_elbow,
      Left_wrist,
      Left_leg,
      Left_knee,
      Left_ankle,

      Right_shoulder,
      Right_arm,
      Right_elbow,
      Right_wrist,
      Right_leg,
      Right_knee,
      Right_ankle
    }

    //get flip state
    const leftArmDirection = Left_wrist.getWorldPosition(new Vector3()).sub(Head.getWorldPosition(new Vector3()))
    const flipZ = leftArmDirection.x < 0 //eyeDirection.z < 0;
    const armatureDirection = new Vector3(0, 1, 0).applyQuaternion(armature.quaternion)
    const flipY = armatureDirection.z < -0.5
    const legDirection = new Vector3(0, 0, -1).applyQuaternion(
      Left_leg.getWorldQuaternion(new Quaternion()).premultiply(armature.quaternion.clone().invert())
    )
    const flipLeg = legDirection.y < 0.5
    // console.log('flip', flipZ, flipY, flipLeg)

    const armatureQuaternion = armature.quaternion.clone()
    const armatureMatrixInverse = new Matrix4().copy(armature.matrixWorld).invert()
    armature.position.set(0, 0, 0)
    armature.quaternion.set(0, 0, 0, 1)
    armature.scale.set(1, 1, 1)
    armature.updateMatrix()

    const preRotations = {}
    const _ensurePrerotation = (k) => {
      const boneName = modelBones[k].name
      if (!preRotations[boneName]) {
        preRotations[boneName] = new Quaternion()
      }
      return preRotations[boneName]
    }

    if (flipY) {
      ;['Hips'].forEach((k) => {
        _ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2))
      })
    }
    if (flipZ) {
      ;['Hips'].forEach((k) => {
        _ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI))
      })
    }
    if (flipLeg) {
      ;['Left_leg', 'Right_leg'].forEach((k) => {
        _ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2))
      })
    }

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

    fixSkeletonZForward(armature.children[0], {
      preRotations
    })

    fixSkeletonZForward(armature.children[0], {
      preRotations
    })

    model.traverse((o) => {
      if (o.isSkinnedMesh) {
        try {
          o.bind(
            o.skeleton.bones.length === skeleton.bones.length &&
              o.skeleton.bones.every((bone, i) => bone === skeleton.bones[i])
              ? skeleton
              : o.skeleton
          )
        } catch (error) {
          console.error(error)
        }
      }
    })
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
    model.updateMatrixWorld(true)

    Hips.traverse((bone) => {
      bone.initialQuaternion = bone.quaternion.clone()
    })

    const Root = foundRoot(Hips)

    const targetModelBones = {
      Root,
      Hips,
      Spine,
      Spine1,
      Spine2: Chest,
      Neck,
      Head,
      LeftEye: Eye_L,
      RightEye: Eye_R,

      LeftShoulder: Left_shoulder,
      LeftArm: Left_arm,
      LeftForeArm: Left_elbow,
      LeftHand: Left_wrist,
      LeftUpLeg: Left_leg,
      LeftLeg: Left_knee,
      LeftFoot: Left_ankle,

      RightShoulder: Right_shoulder,
      RightArm: Right_arm,
      RightForeArm: Right_elbow,
      RightHand: Right_wrist,
      RightUpLeg: Right_leg,
      RightLeg: Right_knee,
      RightFoot: Right_ankle
    }

    //rename
    Object.keys(targetModelBones).forEach((key) => {
      if (targetModelBones[key]) targetModelBones[key].name = key
    })

    return targetModelBones
  } catch (error) {
    console.error(error)
    return null!
  }
}
