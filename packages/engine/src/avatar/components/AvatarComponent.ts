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

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { Engine, EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { defineComponent, getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { matches } from '@etherealengine/hyperflux'
import { NetworkObjectComponent } from '@etherealengine/network'

export const AvatarComponent = defineComponent({
  name: 'AvatarComponent',

  onInit: (entity) => {
    return {
      /** The total height of the avatar in a t-pose, must always be non zero and positive for the capsule collider */
      avatarHeight: 1.8,
      /** The length of the torso in a t-pose, from the hip joint to the head joint */
      torsoLength: 0,
      /** The length of the upper leg in a t-pose, from the hip joint to the knee joint */
      upperLegLength: 0,
      /** The length of the lower leg in a t-pose, from the knee joint to the ankle joint */
      lowerLegLength: 0,
      /** The height of the foot in a t-pose, from the ankle joint to the bottom of the avatar's model */
      footHeight: 0,
      /** The height of the hips in a t-pose */
      hipsHeight: 0,
      /** The length of the arm in a t-pose, from the shoulder joint to the elbow joint */
      armLength: 0,
      /** The distance between the left and right foot in a t-pose */
      footGap: 0,
      /** The angle of the foot in a t-pose */
      footAngle: 0,
      /** The height of the eyes in a t-pose */
      eyeHeight: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.avatarHeight)) component.avatarHeight.set(json.avatarHeight)
    if (matches.number.test(json.torsoLength)) component.torsoLength.set(json.torsoLength)
    if (matches.number.test(json.upperLegLength)) component.upperLegLength.set(json.upperLegLength)
    if (matches.number.test(json.lowerLegLength)) component.lowerLegLength.set(json.lowerLegLength)
    if (matches.number.test(json.footHeight)) component.footHeight.set(json.footHeight)
    if (matches.number.test(json.hipsHeight)) component.hipsHeight.set(json.hipsHeight)
    if (matches.number.test(json.footGap)) component.footGap.set(json.footGap)
    if (matches.number.test(json.eyeHeight)) component.eyeHeight.set(json.eyeHeight)
  },

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
