import { Network } from "../classes/Network";
import { NetworkStateMessageTypes } from "../enums/MessageTypes";
import { EngineEvents } from '../../ecs/classes/EngineEvents';

export async function handleNetworkStateUpdate(socket, data, isServer?: boolean): Promise<any> {
    switch(data.type) {
        case NetworkStateMessageTypes.AvatarUpdated:
            if (Network.instance.clients[data.userId]) {
                Network.instance.clients[data.userId].avatarDetail = {
                    avatarURL: data.avatarURL,
                    avatarId: data.avatarId,
                    thumbnailURL: data.thumbnailURL,
                }
            }
            if (isServer) (Network.instance.transport as any).sendNetworkStatUpdateMessage(data);
            else EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.NETWORK_USER_UPDATED, userId: data.userId });
            break;
        default:
            break;
    }
}
