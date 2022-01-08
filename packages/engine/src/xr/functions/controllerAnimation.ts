import { AnimationMixer, Group, LoopOnce } from 'three'

import { useWorld } from '../../ecs/functions/SystemHooks'
import { XRInputSourceComponentType } from '../components/XRInputSourceComponent'

export const updateXRControllerAnimations = (inputSource: XRInputSourceComponentType) => {
  const world = useWorld()
  const mixers = [inputSource.controllerGripLeft.userData.mixer, inputSource.controllerGripRight.userData.mixer]

  for (const mixer of mixers) {
    if (!mixer) continue
    mixer.update(world.delta)
  }
}

export const initializeXRControllerAnimations = (controller: Group) => {
  if (!controller.userData?.animations) return
  const animations = controller.userData.animations
  const mixer = new AnimationMixer(controller.userData.mesh)
  const fistAction = mixer.clipAction(animations[0])
  fistAction.loop = LoopOnce
  fistAction.clampWhenFinished = true
  controller.userData.mixer = mixer
  controller.userData.actions = [fistAction]
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
