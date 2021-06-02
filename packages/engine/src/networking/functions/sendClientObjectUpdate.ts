
import { isClient } from "../../common/functions/isClient";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Network } from "../classes/Network";
import { NetworkObject } from "../components/NetworkObject";

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