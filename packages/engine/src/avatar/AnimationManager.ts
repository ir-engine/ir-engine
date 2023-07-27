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

import { AnimationClip, Bone, SkinnedMesh } from 'three'

import { config } from '@etherealengine/common/src/config'

import { AssetLoader } from '../assets/classes/AssetLoader'
import { GLTF } from '../assets/loaders/gltf/GLTFLoader'
import { makeTPose } from './animation/avatarPose'
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

  async loadDefaultAnimations(
    path: string = `${config.client.fileServer}/projects/default-project/assets/Animations.glb`
  ) {
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
