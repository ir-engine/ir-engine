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

import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { UserID } from '@ir-engine/hyperflux'
import { NetworkObjectComponent } from '@ir-engine/network'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'

type NearbyUser = { id: UserID; distance: number }

const compareDistance = (a: NearbyUser, b: NearbyUser) => a.distance - b.distance

const remoteAvatars = defineQuery([NetworkObjectComponent, AvatarComponent, TransformComponent])

export function getNearbyUsers(userId: UserID, nonChannelUserIds: UserID[]): Array<UserID> {
  const userAvatarEntity = AvatarComponent.getUserAvatarEntity(userId)
  if (!userAvatarEntity) return []
  const userPosition = getComponent(userAvatarEntity, TransformComponent).position
  if (!userPosition) return []
  const userDistances = [] as Array<{ id: UserID; distance: number }>
  for (const avatarEntity of remoteAvatars()) {
    if (userAvatarEntity === avatarEntity) continue
    const position = getComponent(avatarEntity, TransformComponent).position
    const ownerId = getComponent(avatarEntity, NetworkObjectComponent).ownerId
    userDistances.push({
      id: ownerId,
      distance: position.distanceTo(userPosition)
    })
  }
  return userDistances
    .filter((u) => nonChannelUserIds.indexOf(u.id) > -1)
    .sort(compareDistance)
    .map((u) => u.id)
}
