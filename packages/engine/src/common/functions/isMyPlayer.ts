/** @returns Whether is MyPlayer or not. */
import { getComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import {Network} from '@xr3ngine/engine/src/networking/classes/Network';
import {NetworkObject} from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { isClient } from "./isClient";

export const isMyPlayer = function(entity) {
  return isClient && getComponent(entity, NetworkObject).networkId == Network.instance.userNetworkId;
};
