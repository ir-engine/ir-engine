import { Group, Object3D, Quaternion, Vector3 } from 'three'

import { createActionQueue, getState } from '@xrengine/hyperflux'

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
  removeComponent
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
import { initializeHandModel, initializeXRInputs } from '../xr/XRControllerFunctions'
import { playTriggerPressAnimation, playTriggerReleaseAnimation } from '../xr/XRControllerFunctions'
import { proxifyXRInputs } from '../xr/XRFunctions'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { AvatarArmsTwistCorrectionComponent } from './components/AvatarArmsTwistCorrectionComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarHandsIKComponent } from './components/AvatarHandsIKComponent'
import { AvatarHeadIKComponent } from './components/AvatarHeadIKComponent'
import { loadAvatarForUser } from './functions/avatarFunctions'

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

  if (!hasComponent(entity, XRHandsInputComponent)) {
    addComponent(entity, XRHandsInputComponent, {
      hands: [new Group(), new Group()]
    })
  }

  const xrInputSource = getComponent(entity, XRHandsInputComponent)

  xrInputSource.hands.forEach((controller: any, i: number) => {
    initializeHandModel(entity, controller, i === 0 ? 'left' : 'right')
  })

  return true
}

export default async function AvatarSystem(world: World) {
  const avatarDetailsQueue = createActionQueue(WorldNetworkAction.avatarDetails.matches)
  const xrHandsConnectedQueue = createActionQueue(WorldNetworkAction.xrHandsConnected.matches)

  const xrInputQuery = defineQuery([AvatarComponent, XRInputSourceComponent, AvatarAnimationComponent])
  const xrHandsInputQuery = defineQuery([AvatarComponent, XRHandsInputComponent, XRInputSourceComponent])
  const xrLGripQuery = defineQuery([AvatarComponent, XRLGripButtonComponent, XRInputSourceComponent])
  const xrRGripQuery = defineQuery([AvatarComponent, XRRGripButtonComponent, XRInputSourceComponent])

  return () => {
    for (const action of avatarDetailsQueue()) avatarDetailsReceptor(action)
    for (const action of xrHandsConnectedQueue()) xrHandsConnectedReceptor(action)

    for (const entity of xrInputQuery.enter(world)) {
      xrInputQueryEnter(entity)
    }

    for (const entity of xrInputQuery.exit(world)) {
      xrInputQueryExit(entity)
    }

    for (const entity of xrHandsInputQuery.enter(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const xrHandsComponent = getComponent(entity, XRHandsInputComponent)
      const container = xrInputSourceComponent.container
      container.add(...xrHandsComponent.hands)
    }

    for (const entity of xrLGripQuery.enter()) {
      const inputComponent = getComponent(entity, XRInputSourceComponent)
      playTriggerPressAnimation(inputComponent.controllerGripLeft)
    }

    for (const entity of xrRGripQuery.enter()) {
      const inputComponent = getComponent(entity, XRInputSourceComponent)
      playTriggerPressAnimation(inputComponent.controllerGripRight)
    }

    for (const entity of xrLGripQuery.exit()) {
      const inputComponent = getComponent(entity, XRInputSourceComponent, true)
      if (inputComponent) playTriggerReleaseAnimation(inputComponent.controllerGripLeft)
    }

    for (const entity of xrRGripQuery.exit()) {
      const inputComponent = getComponent(entity, XRInputSourceComponent, true)
      if (inputComponent) playTriggerReleaseAnimation(inputComponent.controllerGripRight)
    }
  }
}

export function xrInputQueryExit(entity: Entity) {
  const xrInputComponent = getComponent(entity, XRInputSourceComponent, true)
  xrInputComponent.container.removeFromParent()
  xrInputComponent.head.removeFromParent()
  removeComponent(entity, AvatarHeadIKComponent)
  const { leftHint, rightHint } = getComponent(entity, AvatarHandsIKComponent)
  leftHint?.removeFromParent()
  rightHint?.removeFromParent()
  removeComponent(entity, AvatarHandsIKComponent)
  removeComponent(entity, AvatarArmsTwistCorrectionComponent)
}

/**
 * Setup head-ik for entity
 * @param entity
 * @returns
 */
export function setupHeadIK(entity: Entity) {
  // Add head IK Solver
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  addComponent(entity, AvatarHeadIKComponent, {
    camera: xrInputSourceComponent.head,
    rotationClamp: 0.785398
  })
}

export function setupHandIK(entity: Entity) {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)

  // Hands IK solver
  const leftHint = new Object3D()
  const rightHint = new Object3D()
  const leftOffset = new Object3D()
  const rightOffset = new Object3D()
  const vec = new Vector3()

  const animation = getComponent(entity, AvatarAnimationComponent)

  leftOffset.rotation.set(-Math.PI * 0.5, Math.PI, 0)
  rightOffset.rotation.set(-Math.PI * 0.5, 0, 0)

  // todo: load the avatar & rig on the server
  if (isClient) {
    Object3DUtils.getWorldPosition(animation.rig.LeftShoulder, leftHint.position)
    Object3DUtils.getWorldPosition(animation.rig.LeftArm, vec)
    vec.subVectors(vec, leftHint.position).normalize()
    leftHint.position.add(vec)
    animation.rig.LeftShoulder.attach(leftHint)

    Object3DUtils.getWorldPosition(animation.rig.RightShoulder, rightHint.position)
    Object3DUtils.getWorldPosition(animation.rig.RightArm, vec)
    vec.subVectors(vec, rightHint.position).normalize()
    rightHint.position.add(vec)
    animation.rig.RightShoulder.attach(rightHint)
  }

  addComponent(entity, AvatarHandsIKComponent, {
    leftTarget: xrInputSourceComponent.controllerLeftParent,
    leftHint: leftHint,
    leftTargetOffset: leftOffset,
    leftTargetPosWeight: 1,
    leftTargetRotWeight: 1,
    leftHintWeight: 1,
    rightTarget: xrInputSourceComponent.controllerRightParent,
    rightHint: rightHint,
    rightTargetOffset: rightOffset,
    rightTargetPosWeight: 1,
    rightTargetRotWeight: 1,
    rightHintWeight: 1
  })

  addComponent(entity, AvatarArmsTwistCorrectionComponent, {
    LeftHandBindRotationInv: new Quaternion(),
    LeftArmTwistAmount: 0.6,
    RightHandBindRotationInv: new Quaternion(),
    RightArmTwistAmount: 0.6
  })
}

export function xrInputQueryEnter(entity: Entity) {
  if (isClient) initializeXRInputs(entity)

  setupXRInputSourceContainer(entity)

  if (!hasComponent(entity, NetworkObjectOwnedTag)) {
    proxifyXRInputs(entity)
    setupHeadIK(entity)
  }

  setupHandIK(entity)
}

export function setupXRInputSourceContainer(entity: Entity) {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)

  xrInputSourceComponent.container.add(
    xrInputSourceComponent.controllerLeftParent,
    xrInputSourceComponent.controllerGripLeftParent,
    xrInputSourceComponent.controllerRightParent,
    xrInputSourceComponent.controllerGripRightParent
  )

  xrInputSourceComponent.container.name = 'XR Container'
  xrInputSourceComponent.head.name = 'XR Head'
  Engine.instance.currentWorld.scene.add(xrInputSourceComponent.container, xrInputSourceComponent.head)
}
