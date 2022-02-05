import { AnimationClip, SkinnedMesh } from 'three'
import { AssetLoader } from '../assets/classes/AssetLoader'
import { Engine } from '../ecs/classes/Engine'
import { getDefaultSkeleton } from './functions/avatarFunctions'

export class AnimationManager {
  static instance: AnimationManager = new AnimationManager()

  _animations: AnimationClip[]
  _defaultSkeleton: SkinnedMesh

  getAnimationDuration(name: string): number {
    const animation = this._animations.find((a) => a.name === name)
    return animation ? animation.duration : 0
  }

  async getAnimations(): Promise<AnimationClip[]> {
    if (this._animations) {
      return this._animations
    }
    const gltf = await AssetLoader.loadAsync({ url: Engine.publicPath + '/default_assets/Animations.glb' })
    gltf.scene.traverse((child: SkinnedMesh) => {
      if (child.type === 'SkinnedMesh' && !this._defaultSkeleton) {
        this._defaultSkeleton = child
      }
    })

    if (!this._defaultSkeleton) {
      // reconstruct skeleton from stored data
      this._defaultSkeleton = getDefaultSkeleton()
    }

    this._animations = gltf.animations
    this._animations?.forEach((clip) => {
      // TODO: make list of morph targets names
      clip.tracks = clip.tracks.filter((track) => !track.name.match(/^CC_Base_/))
    })
    return this._animations
  }
}
