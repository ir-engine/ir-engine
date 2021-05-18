
import { isClient } from "../../common/functions/isClient";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Network } from "../classes/Network";
import { NetworkObject } from "../components/NetworkObject";

/** Join the world to start interacting with it. */
export function sendClientObjectUpdate(entity, type, values) {
  if (isClient) return;

  const networkObject = getComponent<NetworkObject>(entity, NetworkObject, true);

  Network.instance.worldState.editObjects.push({
    networkId: networkObject.networkId,
    ownerId: networkObject.ownerId,
    type,
    values
  })
}