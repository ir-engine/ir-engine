import { getComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { isClient } from "../../common/functions/isClient";
import { Network } from "../classes/Network";
import { NetworkObject } from "../components/NetworkObject";

/** Join the world to start interacting with it. */
export function synchronizationComponents(entity, component, args) {
  if (isClient) return;

  const networkObject = getComponent<NetworkObject>(entity, NetworkObject);

  Network.instance.worldState.editObjects.push({
    networkId: networkObject.networkId,
    ownerId: networkObject.ownerId,
    component: component,
    state: args.state,
    currentId: args.networkCarId,
    value: args.currentFocusedPart,
    whoIsItFor: args.whoIsItFor
  })

}
