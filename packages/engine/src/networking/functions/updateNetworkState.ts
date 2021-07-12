import { Network } from '../classes/Network'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { MessageTypes } from '../enums/MessageTypes'

export async function handleNetworkStateUpdate(socket, data, isServer?: boolean): Promise<any> {
  switch (data.type) {
    case MessageTypes.AvatarUpdated:
      if (Network.instance.clients[data.userId]) {
        Network.instance.clients[data.userId].avatarDetail = {
          avatarURL: data.avatarURL,
          avatarId: data.avatarId,
          thumbnailURL: data.thumbnailURL
        }
      }
      break
    default:
      break
  }
}
