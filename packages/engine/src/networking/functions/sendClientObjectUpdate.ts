
import { isClient } from "../../common/functions/isClient";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { NetworkObjectUpdateType } from '../../templates/networking/NetworkObjectUpdateSchema';
import { Network } from "../classes/Network";
import { NetworkObject } from "../components/NetworkObject";

/** Join the world to start interacting with it. */
export function sendClientObjectUpdate(entity, values) {
  if (isClient) return;

  const networkObject = getComponent<NetworkObject>(entity, NetworkObject);

  Network.instance.worldState.editObjects.push({
    networkId: networkObject.networkId,
    ownerId: networkObject.ownerId,
    type: NetworkObjectUpdateType.VehicleStateChange,
    values
  })
}