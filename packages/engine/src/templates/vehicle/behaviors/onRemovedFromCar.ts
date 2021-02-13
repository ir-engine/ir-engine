import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { addComponent, getComponent, getMutableComponent, removeComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { setState } from "@xr3ngine/engine/src/state/behaviors/setState";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { isServer } from "../../../common/functions/isServer";

export const onRemovedFromCar = (entity: Entity, entityCar: Entity, seat: number, delta: number): void => {

  const networkDriverId = getComponent<NetworkObject>(entity, NetworkObject).networkId;
  const vehicle = getMutableComponent<VehicleBody>(entityCar, VehicleBody);
  vehicle[vehicle.seatPlane[seat]] = null;
  vehicle.wantsExit = [null, null];

  if (isServer) return;
  // CLIENT
  setState(entity, {state: CharacterStateTypes.IDLE});
  // LocalPlayerOnly
  if (Network.instance.userNetworkId != networkDriverId) return;
  removeComponent(entityCar, LocalInputReceiver);
  removeComponent(entityCar, FollowCameraComponent);

  addComponent(entity, LocalInputReceiver);
  addComponent(entity, FollowCameraComponent, { distance: 3, mode: "thirdPerson", raycastBoxOn: true });
};
