import { AnimationClip, Bone, SkinnedMesh } from 'three'

import { AssetLoader } from '../assets/classes/AssetLoader'
import { GLTF } from '../assets/loaders/gltf/GLTFLoader'
import { applySkeletonPose, makeTPose } from './animation/avatarPose'
import { findRootBone, processRootAnimation } from './animation/Util'
import avatarBoneMatching, { findSkinnedMeshes } from './AvatarBoneMatching'
import { makeDefaultSkinnedMesh } from './functions/avatarFunctions'

export class AnimationManager {
  static instance: AnimationManager = new AnimationManager()

  _animations: AnimationClip[]
  _defaultSkinnedMesh: SkinnedMesh
  _rootAnimationData: {}
  _defaultRootBone: Bone

  getAnimationDuration(name: string): number {
    const animation = this._animations.find((a) => a.name === name)
    return animation ? animation.duration : 0
  }

  async loadDefaultAnimations(path: string = '/default_assets/Animations.glb') {
    if (this._animations) {
      return this._animations
    }

    const gltf = (await AssetLoader.loadAsync(path)) as GLTF

    const defaultRig = makeDefaultSkinnedMesh()
    const rig = avatarBoneMatching(defaultRig)
    const rootBone = rig.Hips
    rootBone.updateWorldMatrix(true, true)
    const skinnedMeshes = findSkinnedMeshes(defaultRig)
    makeTPose(rig)
    rootBone.updateWorldMatrix(true, true)
    skinnedMeshes.forEach((mesh) => mesh.skeleton.calculateInverses())
    skinnedMeshes.forEach((mesh) => mesh.skeleton.computeBoneTexture())

    this._defaultSkinnedMesh = defaultRig.children[0] as SkinnedMesh

    this._defaultRootBone = findRootBone(this._defaultSkinnedMesh)!
    this._rootAnimationData = {}
    this._animations = gltf.animations
    this._animations?.forEach((clip) => {
      // TODO: make list of morph targets names
      clip.tracks = clip.tracks.filter((track) => !track.name.match(/^CC_Base_/))

      const rootData = processRootAnimation(clip, this._defaultRootBone)

      if (rootData) {
        this._rootAnimationData[clip.name] = rootData
      }
    })
    return this._animations
  }
}
