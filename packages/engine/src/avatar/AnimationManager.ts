import { AnimationClip, Bone, SkinnedMesh } from 'three'

import { AssetLoader } from '../assets/classes/AssetLoader'
import { GLTF } from '../assets/loaders/gltf/GLTFLoader'
import { findRootBone, processRootAnimation } from './animation/Util'
import { makeDefaultSkinnedMesh } from './functions/avatarFunctions'

export class AnimationManager {
  static instance: AnimationManager = new AnimationManager()
  private defaultPaths = [
    '/default_assets/Animations.glb',
    '/default_assets/SitIdle.glb',
    '/default_assets/SitToStand.glb',
    '/default_assets/StandToSit.glb'
  ]

  _animations: AnimationClip[]
  _defaultSkinnedMesh: SkinnedMesh
  _rootAnimationData: {}
  _defaultRootBone: Bone

  getAnimationDuration(name: string): number {
    const animation = this._animations.find((a) => a.name === name)
    return animation ? animation.duration : 0
  }

  async loadDefaultAnimations(paths: string[] = this.defaultPaths) {
    const gltfs = await Promise.all(paths.map((path) => AssetLoader.loadAsync(path)))
    this.getAnimations(gltfs)
  }

  getAnimations(gltfs: GLTF[]): AnimationClip[] {
    if (this._animations) {
      return this._animations
    }

    this._animations = []
    this._rootAnimationData = {}

    for (const gltf of gltfs) {
      gltf.scene.traverse((child: SkinnedMesh) => {
        if (child.type === 'SkinnedMesh' && !this._defaultSkinnedMesh) {
          this._defaultSkinnedMesh = child
        }
      })

      if (this._defaultSkinnedMesh) break
    }

    if (!this._defaultSkinnedMesh) {
      // reconstruct skeleton from stored data
      this._defaultSkinnedMesh = makeDefaultSkinnedMesh()
    }

    this._defaultRootBone = findRootBone(this._defaultSkinnedMesh)!

    gltfs.forEach((gltf) => {
      gltf.animations?.forEach((clip) => {
        // TODO: make list of morph targets names
        clip.tracks = clip.tracks.filter((track) => !track.name.match(/^CC_Base_/))

        const rootData = processRootAnimation(clip, this._defaultRootBone)

        if (rootData) {
          this._rootAnimationData[clip.name] = rootData
        }

        this._animations.push(clip)
      })
    })

    return this._animations
  }
}
