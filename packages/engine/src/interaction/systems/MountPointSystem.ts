/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Box3, Quaternion, Vector3 } from 'three'

import { UUIDComponent } from '@etherealengine/ecs'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { useEffect } from 'react'
import { emoteAnimations, preloadedAnimations } from '../../avatar/animation/Util'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { MountPoint, MountPointComponent } from '../../scene/components/MountPointComponent'
import { SittingComponent } from '../../scene/components/SittingComponent'

import { AnimationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { BoundingBoxComponent } from '@etherealengine/spatial/src/transform/components/BoundingBoxComponents'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { AvatarRigComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { MotionCapturePoseComponent } from '../../mocap/MotionCapturePoseComponent'
import { MotionCaptureRigComponent } from '../../mocap/MotionCaptureRigComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { MountPointActions, MountPointState } from '../functions/MountPointActions'
import { InteractableState, InteractableUI } from './InteractableSystem'

/**
 * @todo refactor this into i18n and configurable
 */
const mountPointInteractMessages = {
  [MountPoint.seat]: 'Press E to Sit'
}

const unmountEntity = (entity: Entity) => {
  if (!hasComponent(entity, SittingComponent)) return
  const rigidBody = getComponent(entity, RigidBodyComponent)

  dispatchAction(
    AvatarNetworkAction.setAnimationState({
      animationAsset: preloadedAnimations.emotes,
      clipName: emoteAnimations.seated,
      needsSkip: true,
      entityUUID: getComponent(entity, UUIDComponent)
    })
  )

  const sittingComponent = getComponent(entity, SittingComponent)

  AvatarControllerComponent.releaseMovement(entity, sittingComponent.mountPointEntity)
  dispatchAction(
    MountPointActions.mountInteraction({
      mounted: false,
      mountedEntity: getComponent(entity, UUIDComponent),
      targetMount: getComponent(sittingComponent.mountPointEntity, UUIDComponent)
    })
  )
  const mountTransform = getComponent(sittingComponent.mountPointEntity, TransformComponent)
  const mountComponent = getComponent(sittingComponent.mountPointEntity, MountPointComponent)
  //we use teleport avatar only when rigidbody is not enabled, otherwise translation is called on rigidbody
  const dismountPoint = new Vector3().copy(mountComponent.dismountOffset).applyMatrix4(mountTransform.matrixWorld)
  teleportAvatar(entity, dismountPoint)
  rigidBody.body.setEnabled(true)
  removeComponent(entity, SittingComponent)
}

const mountEntity = (avatarEntity: Entity, mountEntity: Entity) => {
  const mountedEntities = getState(MountPointState)
  if (mountedEntities[getComponent(mountEntity, UUIDComponent)]) return //already sitting, exiting

  const avatarUUID = getComponent(avatarEntity, UUIDComponent)
  const mountPoint = getOptionalComponent(mountEntity, MountPointComponent)
  if (!mountPoint || mountPoint.type !== MountPoint.seat) return
  const mountPointUUID = getComponent(mountEntity, UUIDComponent)

  //check if we're already sitting or if the seat is occupied
  if (getState(MountPointState)[mountPointUUID] || hasComponent(avatarEntity, SittingComponent)) return

  setComponent(avatarEntity, SittingComponent, {
    mountPointEntity: mountEntity!
  })

  AvatarControllerComponent.captureMovement(avatarEntity, mountEntity)
  dispatchAction(
    AvatarNetworkAction.setAnimationState({
      animationAsset: preloadedAnimations.emotes,
      clipName: emoteAnimations.seated,
      loop: true,
      layer: 1,
      entityUUID: avatarUUID
    })
  )
  dispatchAction(
    MountPointActions.mountInteraction({
      mounted: true,
      mountedEntity: getComponent(avatarEntity, UUIDComponent),
      targetMount: getComponent(mountEntity, UUIDComponent)
    })
  )
}

const mountPointQuery = defineQuery([MountPointComponent])
const sittingIdleQuery = defineQuery([SittingComponent])

const execute = () => {
  if (getState(EngineState).isEditor) return
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()

  for (const entity of mountPointQuery.enter()) {
    const mountPoint = getComponent(entity, MountPointComponent)
    setComponent(entity, BoundingBoxComponent, {
      box: new Box3().setFromCenterAndSize(
        getComponent(entity, TransformComponent).position,
        new Vector3(0.1, 0.1, 0.1)
      )
    })
    setCallback(entity, 'mountEntity', () => mountEntity(AvatarComponent.getSelfAvatarEntity(), entity))
    setComponent(entity, InteractableComponent, {
      label: mountPointInteractMessages[mountPoint.type],
      callbacks: [
        {
          callbackID: 'mountEntity',
          target: null
        }
      ]
    })
  }

  /*Consider mocap inputs in the event we want to snap a real world seated person
    to a mount point, to maintain physical continuity
  */
  const mocapInputSource = getOptionalComponent(selfAvatarEntity, MotionCapturePoseComponent)
  if (mocapInputSource) {
    if (mocapInputSource.sitting?.begun) mountEntity(selfAvatarEntity, getState(InteractableState).available[0])
    if (mocapInputSource.standing?.begun) unmountEntity(selfAvatarEntity)
  }

  for (const entity of sittingIdleQuery()) {
    const controller = getComponent(entity, AvatarControllerComponent)
    if (controller.gamepadLocalInput.lengthSq() > 0.01) {
      unmountEntity(entity)
      continue
    }
    const mountTransform = getComponent(getComponent(entity, SittingComponent).mountPointEntity, TransformComponent)

    mountTransform.matrixWorld.decompose(vec3_0, quat, vec3_1)
    const rig = getComponent(entity, AvatarRigComponent)
    vec3_0.y -= rig.normalizedRig.hips.node.position.y - 0.25
    setComponent(entity, TransformComponent, { rotation: mountTransform.rotation, position: vec3_0 })

    if (!hasComponent(entity, MotionCaptureRigComponent)) continue

    //Force mocapped avatar to always face the mount point's rotation
    //const hipsQaut = new Quaternion(
    //  MotionCaptureRigComponent.rig.hips.x[entity],
    //  MotionCaptureRigComponent.rig.hips.y[entity],
    //  MotionCaptureRigComponent.rig.hips.z[entity],
    //  MotionCaptureRigComponent.rig.hips.w[entity]
    //)
    //avatarTransform.rotation.copy(mountTransform.rotation).multiply(hipsQaut.invert())
  }
}

const vec3_0 = new Vector3()
const quat = new Quaternion()
const vec3_1 = new Vector3()

const reactor = () => {
  const mountedEntities = useHookstate(getMutableState(MountPointState))
  useEffect(() => {
    //temporary logic for setting visibility of hints until interactable system is refactored
    for (const mountEntity of mountPointQuery()) {
      setVisibleComponent(
        InteractableUI.get(mountEntity)!.xrui.entity!,
        !mountedEntities[getComponent(mountEntity, UUIDComponent)].value
      )
    }
  }, [mountedEntities])

  return null
}

export const MountPointSystem = defineSystem({
  uuid: 'ee.engine.MountPointSystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor
})
