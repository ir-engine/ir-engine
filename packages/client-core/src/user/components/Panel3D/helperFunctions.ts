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

import { t } from 'i18next'
import { AnimationMixer, Box3, Camera, Object3D, Scene, Vector3, WebGLRenderer } from 'three'

import { MAX_ALLOWED_TRIANGLES } from '@etherealengine/common/src/constants/AvatarConstants'
import { AnimationComponent } from '@etherealengine/engine/src/avatar/components/AnimationComponent'
import { AvatarAnimationComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { loadAvatarModelAsset, setupAvatarModel } from '@etherealengine/engine/src/avatar/functions/avatarFunctions'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { addObjectToGroup, removeGroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'

export const validate = (obj: Object3D, renderer: WebGLRenderer, scene: Scene, camera: Camera) => {
  const objBoundingBox = new Box3().setFromObject(obj)
  let maxBB = new Vector3(2, 3, 2)

  let bone = false
  let skinnedMesh = false
  obj.traverse((o) => {
    if (o.type.toLowerCase() === 'bone') bone = true
    if (o.type.toLowerCase() === 'skinnedmesh') skinnedMesh = true
  })

  const size = new Vector3().subVectors(maxBB, objBoundingBox.getSize(new Vector3()))
  if (size.x <= 0 || size.y <= 0 || size.z <= 0) return t('user:avatar.outOfBound')

  if (!bone || !skinnedMesh) return t('user:avatar.noBone')

  renderer.render(scene, camera)
  if (renderer.info.render.triangles > MAX_ALLOWED_TRIANGLES)
    return t('user:avatar.selectValidFile', { allowedTriangles: MAX_ALLOWED_TRIANGLES })

  if (renderer.info.render.triangles <= 0) return t('user:avatar.emptyObj')

  return ''
}

export const resetAnimationLogic = (entity: Entity) => {
  setComponent(entity, AnimationComponent, {
    // empty object3d as the mixer gets replaced when model is loaded
    mixer: new AnimationMixer(new Object3D()),
    animations: [],
    animationSpeed: 1
  })
  setComponent(entity, AvatarAnimationComponent, {
    animationGraph: {
      states: {},
      transitionRules: {},
      currentState: null!,
      stateChanged: null!
    },
    rootYRatio: 1,
    locomotion: new Vector3()
  })
  setComponent(entity, VisibleComponent, true)
}

export const loadAvatarForPreview = async (entity: Entity, avatarURL: string) => {
  const parent = await loadAvatarModelAsset(avatarURL)
  if (!parent) return
  setupAvatarModel(entity)(parent)
  removeGroupComponent(entity)
  addObjectToGroup(entity, parent)
  parent.traverse((obj: Object3D) => {
    obj.layers.set(ObjectLayers.Panel)
  })
  parent.removeFromParent()
  // animateModel(entity)
  return parent
}

export const loadModelForPreview = async (entity: Entity, avatarURL: string) => {
  const parent = await loadAvatarModelAsset(avatarURL)
  if (!parent) return
  removeGroupComponent(entity)
  addObjectToGroup(entity, parent)
  parent.traverse((obj: Object3D) => {
    obj.layers.set(ObjectLayers.Panel)
  })
  parent.removeFromParent()
  return parent
}
