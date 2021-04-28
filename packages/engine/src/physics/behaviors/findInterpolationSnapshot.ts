import { getComponent } from "../../ecs/functions/EntityFunctions";
import { NetworkObject } from "../../networking/components/NetworkObject";


export const findInterpolationSnapshot = (entity, snapshot) => {
  const networkId = getComponent(entity, NetworkObject).networkId;
  if (snapshot != null) {
    return snapshot.state.find(v => v.networkId == networkId);
  } else {
    return networkId;
  }
}
