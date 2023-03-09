import { AnimationMixer, Group, LoopOnce } from 'three'

import { getMutableState } from '@etherealengine/hyperflux'

import { AvatarControllerType, AvatarInputSettingsState } from '../avatar/state/AvatarInputSettingsState'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { AssetLoader } from './../assets/classes/AssetLoader'
import { SkeletonUtils } from './../avatar/SkeletonUtils'
import { Entity } from './../ecs/classes/Entity'
import { XRHandMeshModel } from './XRHandMeshModel'

export const initializeControllerModel = async (entity: Entity, handedness: string) => {
  const avatarInputState = getMutableState(AvatarInputSettingsState)
  const avatarInputControllerType = avatarInputState.controlType.value
  if (avatarInputControllerType !== AvatarControllerType.OculusQuest) return

  const gltf = await AssetLoader.loadAsync(`/default_assets/controllers/hands/${handedness}_controller.glb`)
  let handMesh = gltf?.scene?.children[0]

  if (!handMesh) {
    console.error(`Could not load mesh`)
    return
  }

  handMesh = SkeletonUtils.clone(handMesh)

  const controller = new Group()
  controller.name = `controller-model-${entity}`
  addObjectToGroup(entity, controller)

  if (controller.userData.mesh) {
    controller.remove(controller.userData.mesh)
  }

  controller.userData.mesh = handMesh
  controller.add(controller.userData.mesh)
  controller.userData.handedness = handedness

  const winding = handedness == 'left' ? 1 : -1
  controller.userData.mesh.rotation.x = Math.PI * 0.25
  controller.userData.mesh.rotation.y = Math.PI * 0.5 * winding
  controller.userData.mesh.rotation.z = Math.PI * 0.02 * -winding
}

export const initializeHandModel = async (entity: Entity, handedness: string) => {
  const avatarInputState = getMutableState(AvatarInputSettingsState)
  const avatarInputControllerType = avatarInputState.controlType.value

  // if is hands and 'none' type enabled (instead we use IK to move hands in avatar model)
  if (avatarInputControllerType === AvatarControllerType.None) return

  const gltf = await AssetLoader.loadAsync(`/default_assets/controllers/hands/${handedness}.glb`)
  let handMesh = gltf?.scene?.children[0]

  const controller = new Group()
  controller.name = `controller-hand-model-${entity}`
  addObjectToGroup(entity, controller)

  if (controller.userData.mesh) {
    controller.remove(controller.userData.mesh)
  }

  controller.userData.mesh = new XRHandMeshModel(entity, controller, handMesh, handedness)
  controller.add(controller.userData.mesh)
  controller.userData.handedness = handedness

  if (gltf?.animations?.length) {
    controller.userData.animations = gltf.animations
  }

  const animations = controller.userData.animations
  const mixer = new AnimationMixer(controller.userData.mesh)
  const fistAction = mixer.clipAction(animations[0])
  fistAction.loop = LoopOnce
  fistAction.clampWhenFinished = true
  controller.userData.mixer = mixer
  controller.userData.actions = [fistAction]
}
