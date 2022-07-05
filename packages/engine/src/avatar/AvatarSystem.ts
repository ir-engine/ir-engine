import { Group, Object3D, Vector3 } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

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
import { isEntityLocalClient } from '../networking/functions/isEntityLocalClient'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { RaycastComponent } from '../physics/components/RaycastComponent'
import { VelocityComponent } from '../physics/components/VelocityComponent'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRLGripButtonComponent, XRRGripButtonComponent } from '../xr/components/XRGripButtonComponent'
import { XRHandsInputComponent } from '../xr/components/XRHandsInputComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'
import { initializeHandModel, initializeXRInputs } from '../xr/functions/addControllerModels'
import { playTriggerPressAnimation, playTriggerReleaseAnimation } from '../xr/functions/controllerAnimation'
import { proxifyXRInputs, setupXRInputSourceComponent } from '../xr/functions/WebXRFunctions'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarEffectComponent } from './components/AvatarEffectComponent'
import { AvatarHandsIKComponent } from './components/AvatarHandsIKComponent'
import { AvatarHeadIKComponent } from './components/AvatarHeadIKComponent'
import { loadAvatarForUser } from './functions/avatarFunctions'

export function avatarDetailsReceptor(
  action: ReturnType<typeof WorldNetworkAction.avatarDetails>,
  world = Engine.instance.currentWorld
) {
  const client = world.users.get(action.$from)
  if (!client) throw Error(`Avatar details action received for a client that does not exist: ${action.$from}`)
  if (client.avatarDetail?.avatarURL === action.avatarDetail.avatarURL)
    return console.log('[AvatarSystem]: ignoring same avatar url')
  client.avatarDetail = action.avatarDetail
  if (isClient) {
    const entity = world.getUserAvatarEntity(action.$from)
    loadAvatarForUser(entity, action.avatarDetail.avatarURL)
  }
}

export function setXRModeReceptor(
  action: ReturnType<typeof WorldNetworkAction.setXRMode>,
  world = Engine.instance.currentWorld
) {
  const entity = world.getUserAvatarEntity(action.$from)
  if (!entity) return

  if (action.enabled) {
    if (!hasComponent(entity, XRInputSourceComponent)) {
      setupXRInputSourceComponent(entity)
    }
  } else if (hasComponent(entity, XRInputSourceComponent)) {
    removeComponent(entity, XRInputSourceComponent)
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

export function teleportObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.teleportObject>,
  world = Engine.instance.currentWorld
) {
  const [x, y, z] = action.pose
  const entity = world.getNetworkObject(action.object.ownerId, action.object.networkId)!
  const controllerComponent = getComponent(entity, AvatarControllerComponent)
  if (controllerComponent) {
    const velocity = getComponent(entity, VelocityComponent)
    const avatar = getComponent(entity, AvatarComponent)
    controllerComponent.controller.setPosition({ x, y: y + avatar.avatarHalfHeight, z })
    velocity.linear.setScalar(0)
    velocity.angular.setScalar(0)
  }
}

export default async function AvatarSystem(world: World) {
  const avatarDetailsQueue = createActionQueue(WorldNetworkAction.avatarDetails.matches)
  const setXRModeQueue = createActionQueue(WorldNetworkAction.setXRMode.matches)
  const xrHandsConnectedQueue = createActionQueue(WorldNetworkAction.xrHandsConnected.matches)
  const teleportObjectQueue = createActionQueue(WorldNetworkAction.teleportObject.matches)

  const raycastQuery = defineQuery([AvatarComponent, RaycastComponent])
  const xrInputQuery = defineQuery([AvatarComponent, XRInputSourceComponent, AvatarAnimationComponent])
  const xrHandsInputQuery = defineQuery([AvatarComponent, XRHandsInputComponent, XRInputSourceComponent])
  const xrLGripQuery = defineQuery([AvatarComponent, XRLGripButtonComponent, XRInputSourceComponent])
  const xrRGripQuery = defineQuery([AvatarComponent, XRRGripButtonComponent, XRInputSourceComponent])

  return () => {
    for (const action of avatarDetailsQueue()) avatarDetailsReceptor(action)
    for (const action of setXRModeQueue()) setXRModeReceptor(action)
    for (const action of xrHandsConnectedQueue()) xrHandsConnectedReceptor(action)
    for (const action of teleportObjectQueue()) teleportObjectReceptor(action)

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

    for (const entity of raycastQuery(world)) {
      const raycastComponent = getComponent(entity, RaycastComponent)
      const transform = getComponent(entity, TransformComponent)
      const avatar = getComponent(entity, AvatarComponent)
      raycastComponent.origin.copy(transform.position).y += avatar.avatarHalfHeight
      avatar.isGrounded = Boolean(raycastComponent.hits.length > 0)
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

  const ik = getComponent(entity, AvatarHandsIKComponent)
  ik.leftHint?.removeFromParent()
  ik.rightHint?.removeFromParent()
  removeComponent(entity, AvatarHandsIKComponent)
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
    leftTarget: xrInputSourceComponent.controllerGripLeftParent,
    leftHint: leftHint,
    leftTargetOffset: leftOffset,
    leftTargetPosWeight: 1,
    leftTargetRotWeight: 0,
    leftHintWeight: 1,

    rightTarget: xrInputSourceComponent.controllerGripRightParent,
    rightHint: rightHint,
    rightTargetOffset: rightOffset,
    rightTargetPosWeight: 1,
    rightTargetRotWeight: 0,
    rightHintWeight: 1
  })
}

export function xrInputQueryEnter(entity: Entity) {
  if (isClient) initializeXRInputs(entity)

  setupXRInputSourceContainer(entity)

  if (!isEntityLocalClient(entity)) {
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
