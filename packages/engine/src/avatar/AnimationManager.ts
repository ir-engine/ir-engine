import { AnimationClip, Bone, SkinnedMesh } from 'three'

import { AssetLoader } from '../assets/classes/AssetLoader'
import { GLTF } from '../assets/loaders/gltf/GLTFLoader'
import { Engine } from '../ecs/classes/Engine'
import { findRootBone, processRootAnimation } from './animation/Util'
import { getDefaultSkeleton } from './functions/avatarFunctions'

export class AnimationManager {
  static instance: AnimationManager = new AnimationManager()

  _animations: AnimationClip[]
  _defaultSkeleton: SkinnedMesh
  _rootAnimationData: {}
  _defaultRootBone: Bone

  getAnimationDuration(name: string): number {
    const animation = this._animations.find((a) => a.name === name)
    return animation ? animation.duration : 0
  }

  async getDefaultAnimations() {
    const gltf = await AssetLoader.loadAsync('/default_assets/Animations.glb')
    this.getAnimations(gltf)
  }

  getAnimations(gltf: GLTF): AnimationClip[] {
    if (this._animations) {
      return this._animations
    }
    gltf.scene.traverse((child: SkinnedMesh) => {
      if (child.type === 'SkinnedMesh' && !this._defaultSkeleton) {
        this._defaultSkeleton = child
      }
    })

    if (!this._defaultSkeleton) {
      // reconstruct skeleton from stored data
      this._defaultSkeleton = getDefaultSkeleton()
    }

    this._defaultRootBone = findRootBone(this._defaultSkeleton)!
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
