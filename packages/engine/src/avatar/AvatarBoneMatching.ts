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

// This retargeting logic is based exokitxr retargeting system
// https://github.com/exokitxr/avatars

import { Bone, Object3D, Quaternion, Skeleton, SkinnedMesh, Vector3 } from 'three'

import { Entity, getComponent } from '@ir-engine/ecs'
import { Object3DUtils } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'

export type MixamoBoneNames =
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
  // | 'LeftForeArmTwist'
  | 'LeftHand'
  | 'LeftUpLeg'
  | 'LeftLeg'
  | 'LeftFoot'
  | 'RightShoulder'
  | 'RightArm'
  | 'RightForeArm'
  // | 'RightForeArmTwist'
  | 'RightHand'
  | 'RightUpLeg'
  | 'RightLeg'
  | 'RightFoot'
  | 'LeftHandPinky1'
  | 'LeftHandPinky2'
  | 'LeftHandPinky3'
  | 'LeftHandPinky4'
  | 'LeftHandPinky5'
  | 'LeftHandRing1'
  | 'LeftHandRing2'
  | 'LeftHandRing3'
  | 'LeftHandRing4'
  | 'LeftHandRing5'
  | 'LeftHandMiddle1'
  | 'LeftHandMiddle2'
  | 'LeftHandMiddle3'
  | 'LeftHandMiddle4'
  | 'LeftHandMiddle5'
  | 'LeftHandIndex1'
  | 'LeftHandIndex2'
  | 'LeftHandIndex3'
  | 'LeftHandIndex4'
  | 'LeftHandIndex5'
  | 'LeftHandThumb1'
  | 'LeftHandThumb2'
  | 'LeftHandThumb3'
  | 'LeftHandThumb4'
  | 'RightHandPinky1'
  | 'RightHandPinky2'
  | 'RightHandPinky3'
  | 'RightHandPinky4'
  | 'RightHandPinky5'
  | 'RightHandRing1'
  | 'RightHandRing2'
  | 'RightHandRing3'
  | 'RightHandRing4'
  | 'RightHandRing5'
  | 'RightHandMiddle1'
  | 'RightHandMiddle2'
  | 'RightHandMiddle3'
  | 'RightHandMiddle4'
  | 'RightHandMiddle5'
  | 'RightHandIndex1'
  | 'RightHandIndex2'
  | 'RightHandIndex3'
  | 'RightHandIndex4'
  | 'RightHandIndex5'
  | 'RightHandThumb1'
  | 'RightHandThumb2'
  | 'RightHandThumb3'
  | 'RightHandThumb4'

export type MixamoBoneStructure = {
  [bone in MixamoBoneNames]: Bone
}

const _getTailBones = (root: Bone): Bone[] => {
  const result: any[] = []

  root.traverse((bone: Bone) => {
    if (bone.children.length === 0) {
      if (!result.includes(bone)) {
        result.push(bone)
      }
    }
  })

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
const _findHips = (root: Bone) => {
  let hips
  Object3DUtils.traverse(root, (bone: Bone) => {
    if (/hip|pelvis/i.test(bone.name)) {
      hips = bone
      return true
    }
  })
  return hips
}
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
    const bones = [rootBone]
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
  const rootBoneWorldPos = rootBone.getWorldPosition(new Vector3())
  worldPos[rootBone.id] = [rootBoneWorldPos]
  rootBone.children.forEach((child) => {
    getOriginalWorldPositions(child, worldPos)
  })
}

function calculateAverages(parentBone, worldPos, averagedDirs) {
  const averagedDir = new Vector3()
  parentBone.children.forEach((childBone) => {
    //average the child bone world pos
    const childBonePosWorld = worldPos[childBone.id][0]
    averagedDir.add(childBonePosWorld)
  })

  averagedDir.multiplyScalar(1 / parentBone.children.length)
  averagedDirs[parentBone.id] = averagedDir

  parentBone.children.forEach((childBone) => {
    calculateAverages(childBone, worldPos, averagedDirs)
  })
}

function updateTransformations(parentBone, worldPos, averagedDirs, preRotations) {
  const averagedDir = averagedDirs[parentBone.id]
  if (averagedDir) {
    //set quaternion
    const RESETQUAT = new Quaternion()
    parentBone.quaternion.copy(RESETQUAT)
    // parentBone.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI*2));
    parentBone.updateMatrixWorld()

    //get the child bone position in local coordinates
    // const childBoneDir = parentBone.worldToLocal(averagedDir.clone()).normalize();

    //set direction to face child
    // setQuaternionFromDirection(childBoneDir, Y_AXIS, parentBone.quaternion)
    // console.log('new quaternion', parentBone.quaternion.toArray().join(','));
  }
  const preRot = preRotations[parentBone.id] || preRotations[parentBone.name]
  if (preRot) parentBone.quaternion.multiply(preRot)
  // parentBone.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
  parentBone.updateMatrixWorld()

  //set child bone position relative to the new parent matrix.
  parentBone.children.forEach((childBone) => {
    const childBonePosWorld = worldPos[childBone.id][0].clone()
    parentBone.worldToLocal(childBonePosWorld)
    childBone.position.copy(childBonePosWorld)
  })

  parentBone.children.forEach((childBone) => {
    updateTransformations(childBone, worldPos, averagedDirs, preRotations)
  })
}

function findHandBones(handBone: Object3D) {
  let pinky1,
    pinky2,
    pinky3,
    pinky4,
    pinky5,
    ring1,
    ring2,
    ring3,
    ring4,
    ring5,
    middle1,
    middle2,
    middle3,
    middle4,
    middle5,
    index1,
    index2,
    index3,
    index4,
    index5,
    thumb1,
    thumb2,
    thumb3,
    thumb4

  const findBone = (parent: Object3D, name: string, index: string) => {
    const re = new RegExp(name, 'i')
    let result = null

    Object3DUtils.traverse(parent, (bone) => {
      if (re.test(bone.name) && bone.name.includes(index)) {
        result = bone
        return true
      }
    })

    return result
  }

  pinky1 = findBone(handBone, 'pinky', '1')
  pinky2 = findBone(handBone, 'pinky', '2')
  pinky3 = findBone(handBone, 'pinky', '3')
  pinky4 = findBone(handBone, 'pinky', '4')
  pinky5 = findBone(handBone, 'pinky', '5')
  ring1 = findBone(handBone, 'ring', '1')
  ring2 = findBone(handBone, 'ring', '2')
  ring3 = findBone(handBone, 'ring', '3')
  ring4 = findBone(handBone, 'ring', '4')
  ring5 = findBone(handBone, 'ring', '5')
  middle1 = findBone(handBone, 'middle', '1')
  middle2 = findBone(handBone, 'middle', '2')
  middle3 = findBone(handBone, 'middle', '3')
  middle4 = findBone(handBone, 'middle', '4')
  middle5 = findBone(handBone, 'middle', '5')
  index1 = findBone(handBone, 'index', '1')
  index2 = findBone(handBone, 'index', '2')
  index3 = findBone(handBone, 'index', '3')
  index4 = findBone(handBone, 'index', '4')
  index5 = findBone(handBone, 'index', '5')
  thumb1 = findBone(handBone, 'thumb', '1')
  thumb2 = findBone(handBone, 'thumb', '2')
  thumb3 = findBone(handBone, 'thumb', '3')
  thumb4 = findBone(handBone, 'thumb', '4')

  return {
    pinky1,
    pinky2,
    pinky3,
    pinky4,
    pinky5,
    ring1,
    ring2,
    ring3,
    ring4,
    ring5,
    middle1,
    middle2,
    middle3,
    middle4,
    middle5,
    index1,
    index2,
    index3,
    index4,
    index5,
    thumb1,
    thumb2,
    thumb3,
    thumb4
  } as Record<string, Bone>
}

export function findSkinnedMeshes(model: Object3D) {
  const meshes: SkinnedMesh[] = []
  model.traverse((obj: SkinnedMesh) => {
    if (obj.isSkinnedMesh) {
      meshes.push(obj)
    }
  })

  return meshes
}

/**
 * Creates a skeleton form given bone chain
 * @param bone first bone in the chain
 * @returns Skeleton
 */
export function createSkeletonFromBone(bone: Bone): Skeleton {
  const bones: Bone[] = []
  bone.traverse((b: Bone) => {
    if (b.isBone) bones.push(b)
  })

  const meshes = findSkinnedMeshes(Object3DUtils.findRoot(bone)!)
  const skeleton = new Skeleton(bones)

  // Calculated inverse matrixes by Skeleton class might not work
  // Copy from the source
  for (let i = 0; i < bones.length; i++) {
    const bone = bones[i]
    let found = false

    for (let j = 0; j < meshes.length; j++) {
      const mesh = meshes[j]
      const { bones: meshBones, boneInverses } = mesh.skeleton
      const k = meshBones.findIndex((b) => b === bone)
      if (k < 0) continue
      skeleton.boneInverses[i].copy(boneInverses[k])
      found = true
      break
    }

    if (!found) {
      console.warn('Could not find the bone inverse', i)
    }
  }

  return skeleton
}

export const hipsRegex = /hip|pelvis/i

const _dir = new Vector3()
export function getAPose(rightHand: Vector3, _rightUpperArmPos: Vector3): boolean {
  //get direction of right arm
  _dir.subVectors(rightHand, _rightUpperArmPos).normalize()
  const angle = _dir.angleTo(new Vector3(0, 1, 0))
  return angle > 2
}

export const getHips = (root: Entity) => {
  return iterateEntityNode(
    root,
    (entity) => entity,
    (entity) => hipsRegex.test(getComponent(entity, NameComponent)),
    false,
    true
  )?.[0]
}

export const mixamoVRMRigMap = {
  mixamorigHips: 'hips',
  mixamorigSpine: 'spine',
  mixamorigSpine1: 'chest',
  mixamorigSpine2: 'upperChest',
  mixamorigNeck: 'neck',
  mixamorigHead: 'head',
  mixamorigLeftShoulder: 'leftShoulder',
  mixamorigLeftArm: 'leftUpperArm',
  mixamorigLeftForeArm: 'leftLowerArm',
  mixamorigLeftHand: 'leftHand',
  mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
  mixamorigLeftHandThumb2: 'leftThumbProximal',
  mixamorigLeftHandThumb3: 'leftThumbDistal',
  mixamorigLeftHandIndex1: 'leftIndexProximal',
  mixamorigLeftHandIndex2: 'leftIndexIntermediate',
  mixamorigLeftHandIndex3: 'leftIndexDistal',
  mixamorigLeftHandMiddle1: 'leftMiddleProximal',
  mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
  mixamorigLeftHandMiddle3: 'leftMiddleDistal',
  mixamorigLeftHandRing1: 'leftRingProximal',
  mixamorigLeftHandRing2: 'leftRingIntermediate',
  mixamorigLeftHandRing3: 'leftRingDistal',
  mixamorigLeftHandPinky1: 'leftLittleProximal',
  mixamorigLeftHandPinky2: 'leftLittleIntermediate',
  mixamorigLeftHandPinky3: 'leftLittleDistal',
  mixamorigRightShoulder: 'rightShoulder',
  mixamorigRightArm: 'rightUpperArm',
  mixamorigRightForeArm: 'rightLowerArm',
  mixamorigRightHand: 'rightHand',
  mixamorigRightHandPinky1: 'rightLittleProximal',
  mixamorigRightHandPinky2: 'rightLittleIntermediate',
  mixamorigRightHandPinky3: 'rightLittleDistal',
  mixamorigRightHandRing1: 'rightRingProximal',
  mixamorigRightHandRing2: 'rightRingIntermediate',
  mixamorigRightHandRing3: 'rightRingDistal',
  mixamorigRightHandMiddle1: 'rightMiddleProximal',
  mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
  mixamorigRightHandMiddle3: 'rightMiddleDistal',
  mixamorigRightHandIndex1: 'rightIndexProximal',
  mixamorigRightHandIndex2: 'rightIndexIntermediate',
  mixamorigRightHandIndex3: 'rightIndexDistal',
  mixamorigRightHandThumb1: 'rightThumbMetacarpal',
  mixamorigRightHandThumb2: 'rightThumbProximal',
  mixamorigRightHandThumb3: 'rightThumbDistal',
  mixamorigLeftUpLeg: 'leftUpperLeg',
  mixamorigLeftLeg: 'leftLowerLeg',
  mixamorigLeftFoot: 'leftFoot',
  mixamorigLeftToeBase: 'leftToes',
  mixamorigRightUpLeg: 'rightUpperLeg',
  mixamorigRightLeg: 'rightLowerLeg',
  mixamorigRightFoot: 'rightFoot',
  mixamorigRightToeBase: 'rightToes'
}

export const hipRigMap = {
  CC_Base_Hip: 'hips'
}
