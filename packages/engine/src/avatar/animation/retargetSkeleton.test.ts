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

import assert from 'assert'
import { Bone, Group, Matrix4, Quaternion, SkinnedMesh, Vector3 } from 'three'

import { quatNearEqual } from '../../../tests/util/MathTestUtils'
import avatarBoneMatching from '../AvatarBoneMatching'
import { makeDefaultSkinnedMesh, makeSkinnedMeshFromBoneData } from '../functions/avatarFunctions'
import { retargetSkeleton } from './retargetSkeleton'
import { targetSkeletonData } from './retargetSkeleton.test-data'

const EPSILON = 0.001
const EPSILON_SQ = EPSILON * EPSILON
const tempVec3 = new Vector3()

function vec3NearEqual(a: Vector3, b: Vector3, epsilon: number = EPSILON_SQ): boolean {
  return tempVec3.subVectors(a, b).lengthSq() < epsilon
}

function formatQuat(q: Quaternion) {
  return `${q.x} ${q.y} ${q.z} ${q.w}`
}

function formatVec3(v: Vector3) {
  return `${v.x} ${v.y} ${v.z}`
}

// quaternions sometimes hit numbers slightly above 1e-15
const QUAT_EPSILON = 1e-14

describe('retargetSkeleton', () => {
  it('Check retargetSkeleton Rotations', () => {
    const defaultSkeleton = (makeDefaultSkinnedMesh().children[0] as SkinnedMesh).skeleton
    const targetMesh = makeSkinnedMeshFromBoneData(targetSkeletonData).children[0] as SkinnedMesh
    const targetSkeleton = targetMesh.skeleton
    const parent = new Group()
    parent.add(targetMesh)
    parent.add(targetSkeleton.bones[0])

    // renames the bones to be compatible with the default skeleton
    const rig = avatarBoneMatching(parent)
    retargetSkeleton(targetSkeleton, defaultSkeleton)

    // Check for same bone orientations of source and target skeleton
    defaultSkeleton.bones[0].traverse((bone: Bone) => {
      const targetBone = rig[bone.name]

      if (!targetBone) {
        return
      }

      let message =
        bone.name +
        ' Quaternion / Source: ' +
        formatQuat(bone.quaternion) +
        ' / Target: ' +
        formatQuat(targetBone.quaternion)
      assert(quatNearEqual(bone.quaternion, targetBone.quaternion, QUAT_EPSILON), message)
    })
  })

  it('Check retargetSkeleton Positions', () => {
    const defaultSkeleton = (makeDefaultSkinnedMesh().children[0] as SkinnedMesh).skeleton
    const targetMesh = makeSkinnedMeshFromBoneData(targetSkeletonData).children[0] as SkinnedMesh
    const targetSkeleton = targetMesh.skeleton
    const parent = new Group()
    parent.add(targetMesh)
    parent.add(targetSkeleton.bones[0])

    // renames the bones to be compatible with the default skeleton
    const rig = avatarBoneMatching(parent)
    retargetSkeleton(targetSkeleton, defaultSkeleton)

    const targetSkeletonUnmodified = (makeSkinnedMeshFromBoneData(targetSkeletonData).children[0] as SkinnedMesh)
      .skeleton

    // Check for same bone world positions with original target skeleton
    rig.Hips.traverse((bone: Bone) => {
      // Find the bone index
      const i = targetSkeleton.bones.findIndex((b) => b.name === bone.name)
      assert(i > -1, `Could not find bone ${bone.name}`)

      const origWorldMat = new Matrix4().copy(targetSkeletonUnmodified.boneInverses[i]).invert()
      const modWorldMat = new Matrix4().copy(targetSkeleton.boneInverses[i]).invert()
      const origPos = new Vector3()
      const modPos = new Vector3()

      origWorldMat.decompose(origPos, new Quaternion(), new Vector3())
      modWorldMat.decompose(modPos, new Quaternion(), new Vector3())

      let message = bone.name + ' Position / Original: ' + formatVec3(origPos) + ' / Modified: ' + formatVec3(modPos)

      assert(vec3NearEqual(origPos, modPos), message)
    })
  })
})
