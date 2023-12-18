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

import { Box3, Vector3 } from 'three'

import { dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { useEffect } from 'react'
import { defaultAnimationPath, optionalAnimationPath, optionalAnimations } from '../../avatar/animation/Util'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineQuery } from '../../ecs/functions/QueryFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { MountPoint, MountPointComponent } from '../../scene/components/MountPointComponent'
import { SittingComponent } from '../../scene/components/SittingComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { setVisibleComponent } from '../../scene/components/VisibleComponent'

import { AvatarRigComponent } from '../../avatar/components/AvatarAnimationComponent'
import { InputSystemGroup } from '../../ecs/functions/SystemGroups'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '../../input/state/ButtonState'
import { MotionCapturePoseComponent } from '../../mocap/MotionCapturePoseComponent'
import { MotionCaptureRigComponent } from '../../mocap/MotionCaptureRigComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponents'
import { MountPointActions, MountPointState } from '../functions/MountPointActions'
import { createInteractUI } from '../functions/interactUI'
import { InteractState, InteractiveUI, addInteractableUI } from './InteractiveSystem'

/**
 * @todo refactor this into i18n and configurable
 */
const mountPointInteractMessages = {
  [MountPoint.seat]: 'Press E to Sit'
}

const mountPointQuery = defineQuery([MountPointComponent])
const sittingIdleQuery = defineQuery([SittingComponent])
const _vec = new Vector3()
const execute = () => {
  if (getState(EngineState).isEditor) return

  const unmountEntity = (entity: Entity) => {
    if (!hasComponent(entity, SittingComponent)) return
    const rigidBody = getComponent(entity, RigidBodyComponent)

    dispatchAction(
      AvatarNetworkAction.setAnimationState({
        filePath: defaultAnimationPath + optionalAnimations.seated + '.fbx',
        clipName: optionalAnimations.seated,
        needsSkip: true,
        entityUUID: getComponent(entity, UUIDComponent)
      })
    )

    const sittingComponent = getComponent(entity, SittingComponent)

    AvatarControllerComponent.releaseMovement(Engine.instance.localClientEntity, sittingComponent.mountPointEntity)
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
    const dismountPoint = new Vector3().copy(mountComponent.dismountOffset).applyMatrix4(mountTransform.matrix)
    teleportAvatar(entity, dismountPoint)
    rigidBody.body.setEnabled(true)
    removeComponent(entity, SittingComponent)
  }

  const mountEntity = (avatarEntity: Entity, mountEntity: Entity) => {
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
        filePath: optionalAnimationPath + optionalAnimations.seated + '.fbx',
        clipName: optionalAnimations.seated,
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

  for (const entity of mountPointQuery.enter()) {
    const mountPoint = getComponent(entity, MountPointComponent)
    setComponent(entity, BoundingBoxComponent, {
      box: new Box3().setFromCenterAndSize(
        getComponent(entity, TransformComponent).position,
        new Vector3(0.1, 0.1, 0.1)
      )
    })
    if (isClient) {
      addInteractableUI(entity, createInteractUI(entity, mountPointInteractMessages[mountPoint.type]))
    }
  }

  const nonCapturedInputSource = InputSourceComponent.nonCapturedInputSourceQuery()[0]
  const inputSource = getOptionalComponent(nonCapturedInputSource, InputSourceComponent)
  if (inputSource && (inputSource.buttons.KeyE?.down || inputSource.buttons[XRStandardGamepadButton.Trigger]?.down))
    mountEntity(Engine.instance.localClientEntity, getState(InteractState).available[0])

  /*Consider mocap inputs in the event we want to snap a real world seated person
    to a mount point, to maintain physical continuity
  */
  const mocapInputSource = getOptionalComponent(Engine.instance.localClientEntity, MotionCapturePoseComponent)
  if (mocapInputSource) {
    if (mocapInputSource.sitting?.begun)
      mountEntity(Engine.instance.localClientEntity, getState(InteractState).available[0])
    if (mocapInputSource.standing?.begun) unmountEntity(Engine.instance.localClientEntity)
  }

  for (const entity of sittingIdleQuery()) {
    const controller = getComponent(entity, AvatarControllerComponent)
    if (controller.gamepadLocalInput.lengthSq() > 0.01) unmountEntity(entity)
    const mountTransform = getComponent(getComponent(entity, SittingComponent).mountPointEntity, TransformComponent)
    const rig = getComponent(entity, AvatarRigComponent)
    _vec.copy(mountTransform.position).y -= rig.normalizedRig.hips.node.position.y - 0.25
    setComponent(entity, TransformComponent, { rotation: mountTransform.rotation, position: _vec })

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

const reactor = () => {
  const mountedEntities = useHookstate(getMutableState(MountPointState))
  useEffect(() => {
    //temporary logic for setting visibility of hints until interactive system is refactored
    for (const mountEntity of mountPointQuery()) {
      setVisibleComponent(
        InteractiveUI.get(mountEntity)!.xrui.entity!,
        !mountedEntities[getComponent(mountEntity, UUIDComponent)].value
      )
    }
  }, [mountedEntities])

  return null
}

export const MountPointSystem = defineSystem({
  uuid: 'ee.engine.MountPointSystem',
  insert: { before: InputSystemGroup },
  execute,
  reactor
})
