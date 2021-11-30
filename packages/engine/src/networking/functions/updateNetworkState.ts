import { MessageTypes } from '../enums/MessageTypes'
import { useEngine } from '../../ecs/classes/Engine'

export async function handleNetworkStateUpdate(socket, data, isServer?: boolean): Promise<any> {
  switch (data.type) {
    case MessageTypes.AvatarUpdated:
      if (useEngine().defaultWorld.clients.has(data.userId)) {
        useEngine().defaultWorld.clients.get(data.userId)!.avatarDetail = {
          avatarURL: data.avatarURL,
          thumbnailURL: data.thumbnailURL
        }
      }
      break
    default:
      break
  }
}
