import {
  AdditiveBlending,
  AnimationMixer,
  BoxGeometry,
  BufferAttribute,
  Group,
  LoopOnce,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry
} from 'three'

import { getState } from '@xrengine/hyperflux'

import { AvatarInputSettingsState } from '../avatar/state/AvatarInputSettingsState'
import { Engine } from '../ecs/classes/Engine'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { AssetLoader } from './../assets/classes/AssetLoader'
import { SkeletonUtils } from './../avatar/SkeletonUtils'
import { Entity } from './../ecs/classes/Entity'
import { getComponent, hasComponent } from './../ecs/functions/ComponentFunctions'
import { AvatarControllerType } from './../input/enums/InputEnums'
import { NetworkObjectOwnedTag } from './../networking/components/NetworkObjectOwnedTag'
import { EngineRenderer } from './../renderer/WebGLRendererSystem'
import {
  ControllerGroup,
  XRControllerGripComponent,
  XRHandComponent,
  XRInputSourceComponent,
  XRInputSourceComponentType
} from './XRComponents'
import { XRHandMeshModel } from './XRHandMeshModel'

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

export const cleanXRInputs = (entity) => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  const controllersGrip = [xrInputSourceComponent.controllerGripLeft, xrInputSourceComponent.controllerGripRight]

  controllersGrip.forEach((controller) => {
    if (controller.userData.mesh) {
      controller.remove(controller.userData.mesh)
      controller.userData.mesh = null
      controller.userData.initialized = false
    }
  })
}

export const updateXRControllerAnimations = (inputSource: XRInputSourceComponentType) => {
  const world = Engine.instance.currentWorld
  const mixers = [inputSource.controllerGripLeft.userData.mixer, inputSource.controllerGripRight.userData.mixer]

  for (const mixer of mixers) {
    if (!mixer) continue
    mixer.update(world.deltaSeconds)
  }
}

const playTriggerAction = (action, timeScale) => {
  const time = action.time
  action.reset()
  action.time = time
  action.timeScale = timeScale
  action.play()
}

/**
 * Make a fist on controller's trigger button press
 * @param controller XR controller grip
 */
export const playTriggerPressAnimation = (controller: Group): void => {
  if (!controller.userData.actions) return
  const fistAction = controller.userData.actions[0]
  playTriggerAction(fistAction, 1)
}

/**
 * Go back to normal pose on controllers trigger button release
 * @param controller XR controller grip
 */
export const playTriggerReleaseAnimation = (controller: Group) => {
  if (!controller.userData.actions) return
  const fistAction = controller.userData.actions[0]
  playTriggerAction(fistAction, -1)
}
