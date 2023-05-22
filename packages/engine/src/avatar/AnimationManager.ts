import { VRM, VRMHumanBone, VRMHumanBoneList, VRMHumanBones } from '@pixiv/three-vrm'
import { AnimationClip, Bone, Euler, Object3D, Quaternion, SkinnedMesh, Vector3 } from 'three'

import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../assets/classes/AssetLoader'
import { GLTF } from '../assets/loaders/gltf/GLTFLoader'
import { applySkeletonPose, makeTPose } from './animation/avatarPose'
import { findRootBone, processRootAnimation } from './animation/Util'
import avatarBoneMatching, { findSkinnedMeshes, makeBindPose } from './AvatarBoneMatching'
import { makeDefaultSkinnedMesh } from './functions/avatarFunctions'

//Create all IK targets as object 3ds, stored in
//a named struct and in an object 3d hierarchy
//the former allows easy accessability while the
//latter allows for threejs keyframe animation
export const AnimationManager = defineState({
  name: 'animationManager',
  initial: () => ({
    targetsAnimation: undefined as AnimationClip[] | undefined
  })
})
