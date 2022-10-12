import { AnimationMixer, Group, LoopOnce, Object3D } from 'three'

import { getState } from '@xrengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import {
  AvatarHeadIKComponent,
  AvatarLeftHandIKComponent,
  AvatarRightHandIKComponent
} from '../avatar/components/AvatarIKComponents'
import { AvatarInputSettingsState } from '../avatar/state/AvatarInputSettingsState'
import { ParityValue } from '../common/enums/ParityValue'
import { Engine } from '../ecs/classes/Engine'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { AssetLoader } from './../assets/classes/AssetLoader'
import { SkeletonUtils } from './../avatar/SkeletonUtils'
import { Entity } from './../ecs/classes/Entity'
import { getComponent, hasComponent } from './../ecs/functions/ComponentFunctions'
import { AvatarControllerType } from './../input/enums/InputEnums'
import { XRControllerGripComponent, XRHandComponent } from './XRComponents'
import { XRHandMeshModel } from './XRHandMeshModel'
import { XRState } from './XRState'

export const initializeControllerModel = async (entity: Entity) => {
  const avatarInputState = getState(AvatarInputSettingsState)
  const avatarInputControllerType = avatarInputState.controlType.value
  if (avatarInputControllerType !== AvatarControllerType.OculusQuest) return

  const { handedness } = getComponent(entity, XRControllerGripComponent)

  const gltf = await AssetLoader.loadAsync(`/default_assets/controllers/hands/${handedness}_controller.glb`)
  let handMesh = gltf?.scene?.children[0]

  if (!handMesh) {
    console.error(`Could not load mesh`)
    return
  }

  handMesh = SkeletonUtils.clone(handMesh)

  const controller = new Group()
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

export const initializeHandModel = async (entity: Entity) => {
  const avatarInputState = getState(AvatarInputSettingsState)
  const avatarInputControllerType = avatarInputState.controlType.value

  // if is hands and 'none' type enabled (instead we use IK to move hands in avatar model)
  if (avatarInputControllerType === AvatarControllerType.None) return

  const { handedness } = getComponent(entity, XRHandComponent)

  const gltf = await AssetLoader.loadAsync(`/default_assets/controllers/hands/${handedness}.glb`)
  let handMesh = gltf?.scene?.children[0]

  const controller = new Group()
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
