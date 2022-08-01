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
  _defaultSkinnedMesh = [] as SkinnedMesh[]
  _rootAnimationData: {}
  _defaultRootBone: Bone[] = []
  clipRootBoneMap = new Map<string, Bone>()

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
    this._defaultSkinnedMesh = []

    gltfs.forEach((gltf, i) => {
      gltf.scene.traverse((child: SkinnedMesh) => {
        if (child.type === 'SkinnedMesh') {
          this._defaultSkinnedMesh[i] = child
        }
      })

      if (!this._defaultSkinnedMesh[i]) {
        // reconstruct skeleton from stored data
        this._defaultSkinnedMesh[i] = makeDefaultSkinnedMesh()
      }

      this._defaultRootBone[i] = findRootBone(this._defaultSkinnedMesh[i])!

      gltf.animations?.forEach((clip) => {
        // TODO: make list of morph targets names
        clip.tracks = clip.tracks.filter((track) => !track.name.match(/^CC_Base_/))

        const rootData = processRootAnimation(clip, this._defaultRootBone[i])

        if (rootData) {
          this._rootAnimationData[clip.name] = rootData
        }

        this.clipRootBoneMap.set(clip.name, this._defaultRootBone[i])
        this._animations.push(clip)
      })
    })

    return this._animations
  }
}
