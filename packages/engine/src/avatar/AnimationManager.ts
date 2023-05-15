import { VRM, VRMHumanBone, VRMHumanBoneList, VRMHumanBones } from '@pixiv/three-vrm'
import { AnimationClip, Bone, Euler, Object3D, Quaternion, SkinnedMesh, Vector3 } from 'three'

import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../assets/classes/AssetLoader'
import { GLTF } from '../assets/loaders/gltf/GLTFLoader'
import { applySkeletonPose, makeTPose } from './animation/avatarPose'
import { findRootBone, processRootAnimation } from './animation/Util'
import avatarBoneMatching, { findSkinnedMeshes, makeBindPose } from './AvatarBoneMatching'
import { makeDefaultSkinnedMesh } from './functions/avatarFunctions'

export interface ikTargets {
  rightHandTarget: Object3D
  leftHandTarget: Object3D
  rightFootTarget: Object3D
  leftFootTarget: Object3D
}

//Create all IK targets as object 3ds, stored in
//a named struct and in an object 3d hierarchy
//the former allows easy accessability while the
//latter allows for threejs keyframe animation
export const animationManager = defineState({
  name: 'animationManager',
  initial: () => ({
    targets: new Object3D(),
    ikTargetsMap: {
      rightHandTarget: new Object3D(),
      leftHandTarget: new Object3D(),
      rightFootTarget: new Object3D(),
      leftFootTarget: new Object3D()
    } as ikTargets,
    targetsAnimation: [] as AnimationClip[]
  }),
  onCreate: () => {
    const ikTargetHolder = new Object3D()
    ikTargetHolder.name = 'Hips'
    const state = getMutableState(animationManager)

    for (const [key, value] of Object.entries(state.ikTargetsMap.value)) {
      value.name = key
      ikTargetHolder.add(value)
    }

    state.targets.set(ikTargetHolder)
  }
})
