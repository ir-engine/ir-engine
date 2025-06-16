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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { EngineState, EntityID, NetworkObjectComponent, SourceID, UndefinedEntity, UUIDComponent } from '@ir-engine/ecs'
import { defineComponent, getComponent, useComponent, useHasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getState, useMutableState, UserID } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useEffect } from 'react'
import { setAvatarColliderTransform } from '../functions/spawnAvatarReceptor'

export const AvatarComponent = defineComponent({
  name: 'AvatarComponent',
  schema: S.Object({
    /** The total height of the avatar in a t-pose, must always be non zero and positive for the capsule collider */
    avatarHeight: S.Number(),
    /** The length of the torso in a t-pose, from the hip joint to the head joint */
    torsoLength: S.Number(),
    /** The length of the upper leg in a t-pose, from the hip joint to the knee joint */
    upperLegLength: S.Number(),
    /** The length of the lower leg in a t-pose, from the knee joint to the ankle joint */
    lowerLegLength: S.Number(),
    /** The height of the foot in a t-pose, from the ankle joint to the bottom of the avatar's model */
    footHeight: S.Number(),
    /** The height of the hips in a t-pose */
    hipsHeight: S.Number(),
    /** The length of the arm in a t-pose, from the shoulder joint to the elbow joint */
    armLength: S.Number(),
    /** The distance between the left and right foot in a t-pose */
    footGap: S.Number(),
    /** The angle of the foot in a t-pose */
    footAngle: S.Number(),
    /** The height of the eyes in a t-pose */
    eyeHeight: S.Number()
  }),

  /**
   * A unique entityID for avatars
   */
  entityID: 'avatar' as EntityID,

  /**
   * Get the sourceID for the user's avatar
   */
  getSelfSourceID() {
    return getState(EngineState).userID as any as SourceID
  },

  /**
   * Get the UUID for the user's avatar
   */
  getSelfAvatarUUID() {
    return UUIDComponent.join({
      entitySourceID: AvatarComponent.getSelfSourceID(),
      entityID: AvatarComponent.entityID
    })
  },

  /**
   * Get the avatar entity for a given user
   * @param userId
   * @returns
   */
  getUserAvatarEntity(userId: UserID) {
    return avatarNetworkObjectQuery().find((eid) => getComponent(eid, NetworkObjectComponent).ownerId === userId)!
  },

  /*
   * Get the active user's avatar entity
   */
  getSelfAvatarEntity() {
    return UUIDComponent.getEntityByUUID(AvatarComponent.getSelfAvatarUUID())
  },

  /**
   * Reactively get the active user's avatar entity
   */
  useSelfAvatarEntity() {
    return UUIDComponent.useEntityByUUID(AvatarComponent.getSelfAvatarUUID())
  },

  reactor: ({ entity }) => {
    const camera = useComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
    const avatarComponent = useComponent(entity, AvatarComponent)
    const cameraSettingsState = useMutableState(CameraSettingsState)
    const selfAvatarEntity = AvatarComponent.useSelfAvatarEntity()
    const hasVisibleComponent = useHasComponent(selfAvatarEntity, VisibleComponent)

    useEffect(() => {
      setAvatarColliderTransform(entity)
    }, [avatarComponent?.avatarHeight, camera.near])

    useEffect(() => {
      if (selfAvatarEntity === UndefinedEntity) return
      if (hasVisibleComponent === cameraSettingsState.isAvatarVisible.value) return
      setVisibleComponent(selfAvatarEntity, cameraSettingsState.isAvatarVisible.value)
    }, [hasVisibleComponent, selfAvatarEntity, cameraSettingsState.isAvatarVisible])

    return null
  }
})

const avatarNetworkObjectQuery = defineQuery([NetworkObjectComponent, AvatarComponent])
