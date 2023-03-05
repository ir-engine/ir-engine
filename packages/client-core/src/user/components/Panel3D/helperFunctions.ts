import { t } from 'i18next'
import { AnimationMixer, Box3, Camera, Mesh, Object3D, Scene, Vector3, WebGLRenderer } from 'three'

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
