import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useEngine } from '../../ecs/classes/Engine'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

export type NearbyUser = { id: UserId; distance: number }

const compareDistance = (a: NearbyUser, b: NearbyUser) => a.distance - b.distance

export function getNearbyUsers(userId: UserId, maxMediaUsers = 8): Array<NearbyUser> {
  const userAvatar = useEngine().defaultWorld.getUserAvatarEntity(userId)
  const otherUsers = [] as UserId[]
  for (const [otherUserId] of useEngine().defaultWorld.clients) {
    if (userId === otherUserId) continue
    otherUsers.push(otherUserId)
  }
  if (typeof userAvatar === 'number') {
    const userPosition = getComponent(userAvatar, TransformComponent).position
    if (userPosition) {
      const userDistances = [] as Array<{ id: UserId; distance: number }>
      for (const id of otherUsers) {
        const avatar = useEngine().defaultWorld.getUserAvatarEntity(id)
        if (typeof avatar === 'number') {
          const position = getComponent(avatar, TransformComponent).position
          if (position) {
            userDistances.push({
              id,
              distance: position.distanceTo(userPosition)
            })
          }
        }
      }
      return userDistances.sort(compareDistance).slice(0, maxMediaUsers)
    } else return []
  } else return []
}
