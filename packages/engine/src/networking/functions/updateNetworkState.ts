import { MessageTypes } from '../enums/MessageTypes'
import { Engine } from '../../ecs/classes/Engine'

export async function handleNetworkStateUpdate(socket, data, isServer?: boolean): Promise<any> {
  switch (data.type) {
    case MessageTypes.AvatarUpdated:
      if (Engine.currentWorld.clients.has(data.userId)) {
        Engine.currentWorld.clients.get(data.userId)!.avatarDetail = {
          avatarURL: data.avatarURL,
          thumbnailURL: data.thumbnailURL
        }
      }
      break
    default:
      break
  }
}
