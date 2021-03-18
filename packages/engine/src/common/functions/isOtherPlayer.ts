/** @returns Whether is Other Player or not. */
import { getComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import {Network} from '@xr3ngine/engine/src/networking/classes/Network';
import {NetworkObject} from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { isClient } from "./isClient";

export const isOtherPlayer = function(entity) {
  return isClient && getComponent(entity, NetworkObject).networkId != Network.instance.localAvatarNetworkId;
};
