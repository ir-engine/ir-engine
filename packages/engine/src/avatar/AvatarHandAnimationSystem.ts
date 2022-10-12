import { Group } from 'three'

import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarHeadDecapComponent } from './components/AvatarIKComponents'
import { AvatarHeadIKComponent } from './components/AvatarIKComponents'

export const updateXRControllerAnimations = (inputSource) => {
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

export function xrHandsConnectedReceptor(
  action: ReturnType<typeof WorldNetworkAction.xrHandsConnected>,
  world = Engine.instance.currentWorld
): boolean {
  if (action.$from === Engine.instance.userId) return false
  const entity = world.getUserAvatarEntity(action.$from)
  if (!entity) return false

  return true
}

export default async function AvatarHandAnimationSystem(world: World) {
  const xrHandsConnectedQueue = createActionQueue(WorldNetworkAction.xrHandsConnected.matches)
  const headDecapQuery = defineQuery([AvatarHeadDecapComponent])

  //   const xrHandsInputQuery = defineQuery([AvatarComponent, , AvatarHandsIKComponent])
  //   const xrLGripQuery = defineQuery([AvatarComponent, XRLGripButtonComponent, AvatarHandsIKComponent])
  //   const xrRGripQuery = defineQuery([AvatarComponent, XRRGripButtonComponent, AvatarHandsIKComponent])

  const execute = () => {
    for (const action of xrHandsConnectedQueue()) xrHandsConnectedReceptor(action)

    // for (const entity of xrHandsInputQuery.enter(world)) {
    //   const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
    //   const xrHandsComponent = getComponent(entity, )
    //   const container = xrInputSourceComponent.container
    //   container.add(...xrHandsComponent.hands)
    // }

    // for (const entity of xrLGripQuery.enter()) {
    //   const inputComponent = getComponent(entity, XRInputSourceComponent)
    //   playTriggerPressAnimation(inputComponent.controllerGripLeft)
    // }

    // for (const entity of xrRGripQuery.enter()) {
    //   const inputComponent = getComponent(entity, XRInputSourceComponent)
    //   playTriggerPressAnimation(inputComponent.controllerGripRight)
    // }

    // for (const entity of xrLGripQuery.exit()) {
    //   const inputComponent = getComponent(entity, XRInputSourceComponent, true)
    //   if (inputComponent) playTriggerReleaseAnimation(inputComponent.controllerGripLeft)
    // }

    // for (const entity of xrRGripQuery.exit()) {
    //   const inputComponent = getComponent(entity, XRInputSourceComponent, true)
    //   if (inputComponent) playTriggerReleaseAnimation(inputComponent.controllerGripRight)
    // }

    // //XR Controller mesh animation update
    // for (const entity of xrControllerQuery()) updateXRControllerAnimations(getComponent(entity, XRInputSourceComponent))
  }

  const cleanup = async () => {
    removeActionQueue(xrHandsConnectedQueue)
    removeQuery(world, headDecapQuery)
    // removeQuery(world, xrHandsInputQuery)
    // removeQuery(world, xrLGripQuery)
    // removeQuery(world, xrRGripQuery)
  }

  return { execute, cleanup }
}
