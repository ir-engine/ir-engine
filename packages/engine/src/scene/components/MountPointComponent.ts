/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { Vector3 } from 'three'

import { UndefinedEntity, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { dispatchAction, getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { ArrowHelperComponent } from '@ir-engine/spatial/src/common/debug/ArrowHelperComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { emoteAnimations, preloadedAnimations } from '../../avatar/animation/Util'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { InteractableComponent, XRUIVisibilityOverride } from '../../interaction/components/InteractableComponent'
import { MountPointActions, MountPointState } from '../../interaction/functions/MountPointActions'
import { SittingComponent } from './SittingComponent'

export const MountPoint = {
  seat: 'seat' as const
}

export type MountPointTypes = (typeof MountPoint)[keyof typeof MountPoint]

const MountPointTypesSchema = S.LiteralUnion(Object.values(MountPoint), 'seat')

/** Mapping of mount point types to interact messages using translation keys from i18n. */
const mountPointInteractMessages = {
  [MountPoint.seat]: 'editor:properties.mountPoint.interact-message-seat'
}

const mountCallbackName = 'mountEntity'

const mountEntity = (avatarEntity: Entity, mountEntity: Entity) => {
  if (avatarEntity === UndefinedEntity) return //No avatar found, likely in edit mode for now
  const mountedEntities = getState(MountPointState)
  if (getComponent(mountEntity, UUIDComponent) in mountedEntities.mountsToMountedEntities) return //already sitting, exiting

  const avatarUUID = getComponent(avatarEntity, UUIDComponent)
  const mountPoint = getOptionalComponent(mountEntity, MountPointComponent)
  if (!mountPoint || mountPoint.type !== MountPoint.seat) return
  const mountPointUUID = getComponent(mountEntity, UUIDComponent)

  //check if we're already sitting or if the seat is occupied
  if (
    mountPointUUID in getState(MountPointState).mountsToMountedEntities ||
    hasComponent(avatarEntity, SittingComponent)
  )
    return

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

const unmountEntity = (entity: Entity) => {
  if (!hasComponent(entity, SittingComponent)) return

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
  //We use teleport avatar only when rigidbody is not enabled, otherwise translation is called on rigidbody
  const dismountPoint = new Vector3().copy(mountComponent.dismountOffset).applyMatrix4(mountTransform.matrixWorld)
  teleportAvatar(entity, dismountPoint, mountComponent.forceDismountPosition)
  removeComponent(entity, SittingComponent)
}

export const MountPointComponent = defineComponent({
  name: 'MountPointComponent',
  jsonID: 'EE_mount_point',

  schema: S.Object({
    type: MountPointTypesSchema,
    dismountOffset: T.Vec3({ x: 0, y: 0, z: 0.75 }),
    forceDismountPosition: S.Bool(false)
  }),

  mountEntity,
  unmountEntity,
  mountCallbackName,
  mountPointInteractMessages,

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const mountedEntities = useMutableState(MountPointState)

    useEffect(() => {
      setCallback(entity, mountCallbackName, () => mountEntity(AvatarComponent.getSelfAvatarEntity(), entity))
    }, [])

    useEffect(() => {
      // manually hide interactable's XRUI when mounted through visibleComponent - (as interactable uses opacity to toggle visibility)
      const interactableComponent = getComponent(entity, InteractableComponent)
      if (interactableComponent) {
        interactableComponent.uiVisibilityOverride =
          getComponent(entity, UUIDComponent) in mountedEntities.mountsToMountedEntities.value
            ? XRUIVisibilityOverride.off
            : XRUIVisibilityOverride.none
      }
    }, [mountedEntities.mountsToMountedEntities])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, ArrowHelperComponent, { name: 'mount-point-helper' })
      }
      return () => {
        removeComponent(entity, ArrowHelperComponent)
      }
    }, [debugEnabled])

    return null
  }
})
