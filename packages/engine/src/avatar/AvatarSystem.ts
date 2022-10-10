import { Object3D, Vector3 } from 'three'

import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { isClient } from '../common/functions/isClient'
import { proxifyQuaternion, proxifyVector3 } from '../common/proxies/createThreejsProxy'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { WorldState } from '../networking/interfaces/WorldState'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { AvatarArmsTwistCorrectionComponent } from './components/AvatarArmsTwistCorrectionComponent'
import { AvatarLeftHandIKComponent, AvatarRightHandIKComponent } from './components/AvatarHandsIKComponent'
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

/**
 * Setup head-ik for entity
 * @param entity
 * @returns
 */
export function setupHeadIK(entity: Entity) {
  // Add head IK Solver
  setComponent(entity, AvatarHeadIKComponent, {
    camera: new Object3D(),
    rotationClamp: 0.785398
  })

  const headIK = getComponent(entity, AvatarHeadIKComponent)
  proxifyVector3(AvatarHeadIKComponent.camera.position, entity, headIK.camera.position)
  proxifyQuaternion(AvatarHeadIKComponent.camera.quaternion, entity, headIK.camera.quaternion)
}

export function setupHandIK(entity: Entity) {
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
    animation.rig.LeftShoulder.getWorldPosition(leftHint.position)
    animation.rig.LeftArm.getWorldPosition(vec)
    vec.subVectors(vec, leftHint.position).normalize()
    leftHint.position.add(vec)
    animation.rig.LeftShoulder.attach(leftHint)

    animation.rig.RightShoulder.getWorldPosition(rightHint.position)
    animation.rig.RightArm.getWorldPosition(vec)
    vec.subVectors(vec, rightHint.position).normalize()
    rightHint.position.add(vec)
    animation.rig.RightShoulder.attach(rightHint)
  }

  /** proxify so they can be networked */
  setComponent(entity, AvatarLeftHandIKComponent, {
    target: new Object3D(),
    hint: leftHint,
    targetOffset: leftOffset,
    targetPosWeight: 1,
    targetRotWeight: 1,
    hintWeight: 1
  })

  const lefthand = getComponent(entity, AvatarLeftHandIKComponent)
  proxifyVector3(AvatarLeftHandIKComponent.target.position, entity, lefthand.target.position)
  proxifyQuaternion(AvatarLeftHandIKComponent.target.quaternion, entity, lefthand.target.quaternion)

  setComponent(entity, AvatarRightHandIKComponent, {
    target: new Object3D(),
    hint: rightHint,
    targetOffset: rightOffset,
    targetPosWeight: 1,
    targetRotWeight: 1,
    hintWeight: 1
  })

  const rightHand = getComponent(entity, AvatarRightHandIKComponent)
  proxifyVector3(AvatarRightHandIKComponent.target.position, entity, rightHand.target.position)
  proxifyQuaternion(AvatarRightHandIKComponent.target.quaternion, entity, rightHand.target.quaternion)

  // setComponent(entity, AvatarArmsTwistCorrectionComponent, {
  //   LeftHandBindRotationInv: new Quaternion(),
  //   LeftArmTwistAmount: 0.6,
  //   RightHandBindRotationInv: new Quaternion(),
  //   RightArmTwistAmount: 0.6
  // })
}

export default async function AvatarSystem(world: World) {
  const avatarDetailsQueue = createActionQueue(WorldNetworkAction.avatarDetails.matches)
  const headDecapQuery = defineQuery([AvatarHeadDecapComponent])

  const setXRModeQueue = createActionQueue(WorldNetworkAction.setXRMode.matches)

  const execute = () => {
    for (const action of avatarDetailsQueue()) avatarDetailsReceptor(action)

    for (const action of setXRModeQueue()) {
      const entity = world.getUserAvatarEntity(action.$from)
      if (action.enabled) {
        setupHeadIK(entity)
        setupHandIK(entity)
      } else {
        removeComponent(entity, AvatarHeadIKComponent)
        const leftHand = getComponent(entity, AvatarLeftHandIKComponent, true)
        const rightHand = getComponent(entity, AvatarRightHandIKComponent, true)
        leftHand?.hint?.removeFromParent()
        rightHand?.hint?.removeFromParent()
        removeComponent(entity, AvatarLeftHandIKComponent)
        removeComponent(entity, AvatarRightHandIKComponent)
        removeComponent(entity, AvatarArmsTwistCorrectionComponent)
      }
    }

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
    removeQuery(world, headDecapQuery)
  }

  return { execute, cleanup, subsystems: [] }
}
