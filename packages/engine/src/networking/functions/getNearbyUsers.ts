import { Network } from '../classes/Network'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { NetworkObjectList } from '../interfaces/NetworkObjectList'

export type NearbyUser = { id: string; distance: number }

const compareDistance = (a: NearbyUser, b: NearbyUser) => a.distance - b.distance

export function getNearbyUsers(userId: string, maxMediaUsers = 8): Array<NearbyUser> {
  const otherAvatars = [] as Array<NetworkObjectList[any]>
  const { clients, networkObjects } = Network.instance!
  let userAvatar: NetworkObjectList[any]
  for (const id in networkObjects) {
    const object = networkObjects[id]
    if (!object) continue
    if (object.uniqueId === userId) userAvatar = object
    else if (object.uniqueId in clients) otherAvatars.push(object)
  }
  if (userAvatar != null) {
    const userComponent = getComponent(userAvatar.entity, Object3DComponent)
    const userPosition = userComponent?.value?.position
    if (userPosition != null) {
      const userDistances = [] as Array<{ id: string; distance: number }>
      for (const avatar of otherAvatars) {
        if (typeof avatar !== 'undefined') {
          const component = getComponent(avatar.entity, Object3DComponent)
          const position = component?.value?.position
          if (position != null)
            userDistances.push({
              id: avatar.uniqueId,
              distance: position.distanceTo(userPosition)
            })
        }
      }
      return userDistances.sort(compareDistance).slice(0, maxMediaUsers)
    } else return []
  } else return []
}
