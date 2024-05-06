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

import { useEffect } from 'react'
import { ArrowHelper, Box3, Vector3 } from 'three'

import { dispatchAction, getMutableState, getState, matches, none, useHookstate } from '@etherealengine/hyperflux'

import { UUIDComponent } from '@etherealengine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { TransformComponent } from '@etherealengine/spatial'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { matchesVector3 } from '@etherealengine/spatial/src/common/functions/MatchesUtils'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { BoundingBoxComponent } from '@etherealengine/spatial/src/transform/components/BoundingBoxComponents'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { emoteAnimations, preloadedAnimations } from '../../avatar/animation/Util'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { InteractableComponent, XRUIVisibilityOverride } from '../../interaction/components/InteractableComponent'
import { MountPointActions, MountPointState } from '../../interaction/functions/MountPointActions'
import { SittingComponent } from './SittingComponent'
import { SpawnPointComponent } from './SpawnPointComponent'

export const MountPoint = {
  seat: 'seat' as const
}

export type MountPointTypes = (typeof MountPoint)[keyof typeof MountPoint]

/**
 * @todo refactor this into i18n and configurable
 */
const mountPointInteractMessages = {
  [MountPoint.seat]: 'Press E to Sit'
}

const mountCallbackName = 'mountEntity'

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
  //we use teleport avatar only when rigidbody is not enabled, otherwise translation is called on rigidbody
  const dismountPoint = new Vector3().copy(mountComponent.dismountOffset).applyMatrix4(mountTransform.matrixWorld)
  teleportAvatar(entity, dismountPoint)
  removeComponent(entity, SittingComponent)
}

export const MountPointComponent = defineComponent({
  name: 'MountPointComponent',
  jsonID: 'EE_mount_point',

  onInit: (entity) => {
    return {
      type: MountPoint.seat as MountPointTypes,
      helperEntity: null as Entity | null,
      dismountOffset: new Vector3(0, 0, 0.75)
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.string.test(json.type)) component.type.set(json.type)
    if (matchesVector3.test(json.dismountOffset)) component.dismountOffset.set(json.dismountOffset)
  },

  toJSON: (entity, component) => {
    return {
      type: component.type.value,
      dismountOffset: component.dismountOffset.value
    }
  },
  mountEntity,
  unmountEntity,
  mountCallbackName,
  mountPointInteractMessages,

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const mountPoint = useComponent(entity, MountPointComponent)
    const mountedEntities = useHookstate(getMutableState(MountPointState))

    useEffect(() => {
      setCallback(entity, mountCallbackName, () => mountEntity(AvatarComponent.getSelfAvatarEntity(), entity))
      setComponent(entity, BoundingBoxComponent, {
        box: new Box3().setFromCenterAndSize(
          getComponent(entity, TransformComponent).position,
          new Vector3(0.1, 0.1, 0.1)
        )
      })
    }, [])

    useEffect(() => {
      // manually hide interactable's XRUI when mounted through visibleComponent - (as interactable uses opacity to toggle visibility)
      const interactableComponent = getComponent(entity, InteractableComponent)
      if (interactableComponent) {
        interactableComponent.uiVisibilityOverride = mountedEntities[getComponent(entity, UUIDComponent)].value
          ? XRUIVisibilityOverride.off
          : XRUIVisibilityOverride.none
      }
    }, [mountedEntities])

    useEffect(() => {
      if (!debugEnabled.value) return

      const helper = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 0.5, 0xffffff)
      helper.name = `mount-point-helper-${entity}`

      const helperEntity = createEntity()
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      setVisibleComponent(helperEntity, true)
      setObjectLayers(helper, ObjectLayers.NodeHelper)
      mountPoint.helperEntity.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        if (!hasComponent(entity, SpawnPointComponent)) return
        mountPoint.helperEntity.set(none)
      }
    }, [debugEnabled])

    return null
  }
})
