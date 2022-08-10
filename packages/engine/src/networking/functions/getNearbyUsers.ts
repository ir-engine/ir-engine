import { Not } from 'bitecs'

import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

type NearbyUser = { id: UserId; distance: number }

const compareDistance = (a: NearbyUser, b: NearbyUser) => a.distance - b.distance

const remoteAvatars = defineQuery([
  NetworkObjectComponent,
  AvatarComponent,
  TransformComponent,
  Not(LocalInputTagComponent)
])

export function getNearbyUsers(userId: UserId, nonPartyUserIds: UserId[]): Array<UserId> {
  const userAvatarEntity = Engine.instance.currentWorld.getUserAvatarEntity(userId)
  if (!userAvatarEntity) return []
  const userPosition = getComponent(userAvatarEntity, TransformComponent).position
  if (!userPosition) return []
  const userDistances = [] as Array<{ id: UserId; distance: number }>
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
    .filter((u) => nonPartyUserIds.indexOf(u.id) > -1)
    .sort(compareDistance)
    .map((u) => u.id)
}
