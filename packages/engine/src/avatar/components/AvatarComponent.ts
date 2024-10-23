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

import { Engine, EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { defineComponent, getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { UserID } from '@ir-engine/hyperflux'
import { NetworkObjectComponent } from '@ir-engine/network'

export const AvatarComponent = defineComponent({
  name: 'AvatarComponent',
  schema: S.Object({
    /** The total height of the avatar in a t-pose, must always be non zero and positive for the capsule collider */
    avatarHeight: S.Number(1.8),
    /** The length of the torso in a t-pose, from the hip joint to the head joint */
    torsoLength: S.Number(0),
    /** The length of the upper leg in a t-pose, from the hip joint to the knee joint */
    upperLegLength: S.Number(0),
    /** The length of the lower leg in a t-pose, from the knee joint to the ankle joint */
    lowerLegLength: S.Number(0),
    /** The height of the foot in a t-pose, from the ankle joint to the bottom of the avatar's model */
    footHeight: S.Number(0),
    /** The height of the hips in a t-pose */
    hipsHeight: S.Number(0),
    /** The length of the arm in a t-pose, from the shoulder joint to the elbow joint */
    armLength: S.Number(0),
    /** The distance between the left and right foot in a t-pose */
    footGap: S.Number(0),
    /** The angle of the foot in a t-pose */
    footAngle: S.Number(0),
    /** The height of the eyes in a t-pose */
    eyeHeight: S.Number(0)
  }),

  /**
   * Get the user avatar entity (the network object w/ an Avatar component)
   * @param userId
   * @returns
   */
  getUserAvatarEntity(userId: UserID) {
    return avatarNetworkObjectQuery().find((eid) => getComponent(eid, NetworkObjectComponent).ownerId === userId)!
  },

  getSelfAvatarEntity() {
    return UUIDComponent.getEntityByUUID((Engine.instance.userID + '_avatar') as EntityUUID)
  },

  useSelfAvatarEntity() {
    return UUIDComponent.useEntityByUUID((Engine.instance.userID + '_avatar') as EntityUUID)
  }
})

const avatarNetworkObjectQuery = defineQuery([NetworkObjectComponent, AvatarComponent])
