import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { addComponent, hasComponent, getComponent, getMutableComponent, removeComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { setState } from "@xr3ngine/engine/src/state/behaviors/setState";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { isServer } from "../../../common/functions/isServer";
import { CameraModes } from '../../../camera/types/CameraModes';
import { EnteringVehicle } from "@xr3ngine/engine/src/templates/character/components/EnteringVehicle";

export const onRemovedFromCar = (entity: Entity, entityCar: Entity, seat: number, delta: number): void => {
  // Server and others
  const vehicle = getMutableComponent<VehicleBody>(entityCar, VehicleBody);

  let networkDriverId = null
  if(hasComponent(entity, NetworkObject)) {
    networkDriverId = getComponent<NetworkObject>(entity, NetworkObject).networkId;
  } else {
    for (let i = 0; i < vehicle.seatPlane.length; i++) {
      if (vehicle[vehicle.seatPlane[i]] != null && !Network.instance.networkObjects[vehicle[vehicle.seatPlane[i]]]) {
        networkDriverId = vehicle[vehicle.seatPlane[i]];
        seat = i;
      }
    }
  }

  vehicle[vehicle.seatPlane[seat]] = null;
  vehicle.wantsExit = [null, null];

  if (isServer) return;
  // LocalPlayer and others
  removeComponent(entity, EnteringVehicle);
  setState(entity, { state: CharacterStateTypes.DEFAULT });
  // Player only
  if (Network.instance.localAvatarNetworkId != networkDriverId) return;
  removeComponent(entityCar, LocalInputReceiver);
  removeComponent(entityCar, FollowCameraComponent);

  addComponent(entity, LocalInputReceiver);
  addComponent(entity, FollowCameraComponent, { distance: 3, mode: CameraModes.ThirdPerson });
};
