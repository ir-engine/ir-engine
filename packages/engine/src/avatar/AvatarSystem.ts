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
import { AvatarRigComponent } from './components/AvatarAnimationComponent'
import {
  AvatarIKTargetsComponent,
  AvatarLeftHandIKComponent,
  AvatarRightHandIKComponent
} from './components/AvatarIKComponents'
import { AvatarHeadDecapComponent } from './components/AvatarIKComponents'
import { AvatarHeadIKComponent } from './components/AvatarIKComponents'
import { loadAvatarForUser } from './functions/avatarFunctions'

const _vec = new Vector3()

export function avatarDetailsReceptor(
  action: ReturnType<typeof WorldNetworkAction.avatarDetails>,
  world = Engine.instance.currentWorld
) {
  const userAvatarDetails = getState(WorldState).userAvatarDetails
  userAvatarDetails[action.$from].set(action.avatarDetail)
  if (isClient && action.avatarDetail.avatarURL) {
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
  const target = new Object3D()
  target.name = `ik-head-target-${entity}`

  setComponent(entity, AvatarHeadIKComponent, {
    target,
    rotationClamp: 0.785398
  })

  const headIK = getComponent(entity, AvatarHeadIKComponent)
  proxifyVector3(AvatarHeadIKComponent.target.position, entity, headIK.target.position)
  proxifyQuaternion(AvatarHeadIKComponent.target.quaternion, entity, headIK.target.quaternion)
}

export function setupLeftHandIK(entity: Entity) {
  const leftHint = new Object3D()
  leftHint.name = `ik-left-hint-${entity}`
  const leftOffset = new Object3D()
  leftOffset.name = `ik-left-offset-${entity}`

  const rig = getComponent(entity, AvatarRigComponent)

  leftOffset.rotation.set(-Math.PI * 0.5, Math.PI, 0)

  if (isClient) {
    rig.rig.LeftShoulder.getWorldPosition(leftHint.position)
    rig.rig.LeftArm.getWorldPosition(_vec)
    _vec.subVectors(_vec, leftHint.position).normalize()
    leftHint.position.add(_vec)
    rig.rig.LeftShoulder.attach(leftHint)
  }

  const target = new Object3D()
  target.name = `ik-right-target-${entity}`

  setComponent(entity, AvatarLeftHandIKComponent, {
    target,
    hint: leftHint,
    targetOffset: leftOffset,
    targetPosWeight: 1,
    targetRotWeight: 1,
    hintWeight: 1
  })

  const lefthand = getComponent(entity, AvatarLeftHandIKComponent)
  proxifyVector3(AvatarLeftHandIKComponent.target.position, entity, lefthand.target.position)
  proxifyQuaternion(AvatarLeftHandIKComponent.target.quaternion, entity, lefthand.target.quaternion)
}
// setComponent(entity, AvatarArmsTwistCorrectionComponent, {
//   LeftHandBindRotationInv: new Quaternion(),
//   LeftArmTwistAmount: 0.6,
//   RightHandBindRotationInv: new Quaternion(),
//   RightArmTwistAmount: 0.6
// })

export function setupRightHandIK(entity: Entity) {
  const rightHint = new Object3D()
  rightHint.name = `ik-right-hint-${entity}`
  const rightOffset = new Object3D()
  rightOffset.name = `ik-right-offset-${entity}`

  const rig = getComponent(entity, AvatarRigComponent)

  rightOffset.rotation.set(-Math.PI * 0.5, 0, 0)

  if (isClient) {
    rig.rig.RightShoulder.getWorldPosition(rightHint.position)
    rig.rig.RightArm.getWorldPosition(_vec)
    _vec.subVectors(_vec, rightHint.position).normalize()
    rightHint.position.add(_vec)
    rig.rig.RightShoulder.attach(rightHint)
  }

  const target = new Object3D()
  target.name = `ik-right-target-${entity}`

  setComponent(entity, AvatarRightHandIKComponent, {
    target,
    hint: rightHint,
    targetOffset: rightOffset,
    targetPosWeight: 1,
    targetRotWeight: 1,
    hintWeight: 1
  })

  const rightHand = getComponent(entity, AvatarRightHandIKComponent)
  proxifyVector3(AvatarRightHandIKComponent.target.position, entity, rightHand.target.position)
  proxifyQuaternion(AvatarRightHandIKComponent.target.quaternion, entity, rightHand.target.quaternion)
}

export default async function AvatarSystem(world: World) {
  const avatarDetailsQueue = createActionQueue(WorldNetworkAction.avatarDetails.matches)
  const avatarIKTargetsQuery = defineQuery([AvatarIKTargetsComponent, AvatarRigComponent])

  const avatarIKTargetsQueue = createActionQueue(WorldNetworkAction.avatarIKTargets.matches)

  const execute = () => {
    for (const action of avatarDetailsQueue()) avatarDetailsReceptor(action)

    for (const action of avatarIKTargetsQueue()) {
      const entity = world.getUserAvatarEntity(action.$from)
      const targets = getComponent(entity, AvatarIKTargetsComponent)

      targets.head = action.head
      targets.leftHand = action.leftHand
      targets.rightHand = action.rightHand
    }

    /** Add & remove IK Targets based on active target data */
    for (const entity of avatarIKTargetsQuery()) {
      const targets = getComponent(entity, AvatarIKTargetsComponent)

      if (targets.head && !hasComponent(entity, AvatarHeadIKComponent)) setupHeadIK(entity)
      if (!targets.head && hasComponent(entity, AvatarHeadIKComponent)) removeComponent(entity, AvatarHeadIKComponent)

      if (targets.leftHand && !hasComponent(entity, AvatarLeftHandIKComponent)) setupLeftHandIK(entity)
      if (!targets.leftHand && hasComponent(entity, AvatarLeftHandIKComponent)) {
        const leftHand = getComponent(entity, AvatarLeftHandIKComponent)
        leftHand?.hint?.removeFromParent()
        removeComponent(entity, AvatarLeftHandIKComponent)
      }

      if (targets.rightHand && !hasComponent(entity, AvatarRightHandIKComponent)) setupRightHandIK(entity)
      if (!targets.rightHand && hasComponent(entity, AvatarRightHandIKComponent)) {
        const rightHand = getComponent(entity, AvatarRightHandIKComponent)
        rightHand?.hint?.removeFromParent()
        removeComponent(entity, AvatarRightHandIKComponent)
      }

      // removeComponent(entity, AvatarArmsTwistCorrectionComponent)
    }
  }

  const cleanup = async () => {
    removeActionQueue(avatarDetailsQueue)
  }

  return { execute, cleanup, subsystems: [] }
}
