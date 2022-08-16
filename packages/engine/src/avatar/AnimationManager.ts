import { AnimationClip, Bone, SkinnedMesh } from 'three'

import { AssetLoader } from '../assets/classes/AssetLoader'
import { GLTF } from '../assets/loaders/gltf/GLTFLoader'
import { findRootBone, processRootAnimation } from './animation/Util'
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
    const gltf = await AssetLoader.loadAsync(path)
    this.getAnimations(gltf)
  }

  getAnimations(gltf: GLTF): AnimationClip[] {
    if (this._animations) {
      return this._animations
    }
    gltf.scene.traverse((child: SkinnedMesh) => {
      if (child.type === 'SkinnedMesh' && !this._defaultSkinnedMesh) {
        this._defaultSkinnedMesh = child
      }
    })

    if (!this._defaultSkinnedMesh) {
      // reconstruct skeleton from stored data
      this._defaultSkinnedMesh = makeDefaultSkinnedMesh()
    }

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
