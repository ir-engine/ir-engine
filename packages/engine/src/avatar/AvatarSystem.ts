import { Group, Object3D, Quaternion, Vector3 } from 'three'

import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { isClient } from '../common/functions/isClient'
import { Object3DUtils } from '../common/functions/Object3DUtils'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery
} from '../ecs/functions/ComponentFunctions'
import { NetworkObjectOwnedTag } from '../networking/components/NetworkObjectOwnedTag'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { WorldState } from '../networking/interfaces/WorldState'
import {
  XRHandsInputComponent,
  XRInputSourceComponent,
  XRLGripButtonComponent,
  XRRGripButtonComponent
} from '../xr/XRComponents'
import { playTriggerPressAnimation, playTriggerReleaseAnimation } from '../xr/XRControllerFunctions'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { AvatarArmsTwistCorrectionComponent } from './components/AvatarArmsTwistCorrectionComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarHandsIKComponent } from './components/AvatarHandsIKComponent'
import { AvatarHeadDecapComponent } from './components/AvatarHeadDecapComponent'
import { AvatarHeadIKComponent } from './components/AvatarHeadIKComponent'
import { loadAvatarForUser } from './functions/avatarFunctions'

const EPSILON = 1e-6

export function avatarDetailsReceptor(
  action: ReturnType<typeof WorldNetworkAction.avatarDetails>,
  world = Engine.instance.currentWorld
) {
  const userAvatarDetails = getState(WorldState).userAvatarDetails
  userAvatarDetails[action.$from].set(action.avatarDetail)
  if (isClient) {
    const entity = world.getUserAvatarEntity(action.$from)
    loadAvatarForUser(entity, action.avatarDetail.avatarURL)
  }
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

export default async function AvatarSystem(world: World) {
  const avatarDetailsQueue = createActionQueue(WorldNetworkAction.avatarDetails.matches)
  const xrHandsConnectedQueue = createActionQueue(WorldNetworkAction.xrHandsConnected.matches)
  const headDecapQuery = defineQuery([AvatarHeadDecapComponent])

  // const xrInputQuery = defineQuery([AvatarComponent, XRInputSourceComponent, AvatarAnimationComponent])
  // const xrHandsInputQuery = defineQuery([AvatarComponent, XRHandsInputComponent, XRInputSourceComponent])
  // const xrLGripQuery = defineQuery([AvatarComponent, XRLGripButtonComponent, XRInputSourceComponent])
  // const xrRGripQuery = defineQuery([AvatarComponent, XRRGripButtonComponent, XRInputSourceComponent])

  const execute = () => {
    for (const action of avatarDetailsQueue()) avatarDetailsReceptor(action)
    for (const action of xrHandsConnectedQueue()) xrHandsConnectedReceptor(action)

    // for (const entity of xrHandsInputQuery.enter(world)) {
    //   const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
    //   const xrHandsComponent = getComponent(entity, XRHandsInputComponent)
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

    for (const entity of headDecapQuery(world)) {
      if (!hasComponent(entity, AvatarAnimationComponent)) continue
      const rig = getComponent(entity, AvatarAnimationComponent).rig
      rig.Head?.scale.setScalar(EPSILON)
    }

    for (const entity of headDecapQuery.exit(world)) {
      if (!hasComponent(entity, AvatarAnimationComponent)) continue
      const rig = getComponent(entity, AvatarAnimationComponent).rig
      rig.Head?.scale.setScalar(1)
    }
  }

  const cleanup = async () => {
    removeActionQueue(avatarDetailsQueue)
    removeActionQueue(xrHandsConnectedQueue)
    removeQuery(world, headDecapQuery)
    // removeQuery(world, xrInputQuery)
    // removeQuery(world, xrHandsInputQuery)
    // removeQuery(world, xrLGripQuery)
    // removeQuery(world, xrRGripQuery)
  }

  return { execute, cleanup, subsystems: [] }
}
