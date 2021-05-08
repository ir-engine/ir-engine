import { Entity } from "../../ecs/classes/Entity";
import { removeComponent, hasComponent, addComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { LocalInputReceiver } from "../../input/components/LocalInputReceiver";
import { Network } from "../../networking/classes/Network";
import { NetworkObjectEditInterface } from "../../networking/interfaces/WorldState";
import { PlayerInCar } from "../components/PlayerInCar";
import { VehicleState, VehicleStateUpdateSchema } from "../enums/VehicleStateEnum";

/**
 * @author HydraFire <github.com/HydraFire>
 * @param entity is the entity to handle state changes to
 * @param args is the data sent
 */

export const handleVehicleStateChange = (editObject: NetworkObjectEditInterface): void => {

  const networkDriverId = editObject.networkId;
  const [state, networkCarId, currentFocusedPart] = editObject.values as VehicleStateUpdateSchema;

  const driver: Entity = Network.instance.networkObjects[networkDriverId].component.entity;

  if (state == VehicleState.onAddedEnding) {
    if (driver === Network.instance.localClientEntity) {
      removeComponent(driver, LocalInputReceiver);
    //  removeComponent(entity, FollowCameraComponent);
    }
    if (!hasComponent(driver, PlayerInCar)) {
      addComponent(driver, PlayerInCar, {
        state,
        networkCarId,
        currentFocusedPart
      });
    }
  }

  if (state == VehicleState.onStartRemove) {
    if (hasComponent(driver, PlayerInCar)) {
      getMutableComponent(driver, PlayerInCar).state = state;
    } else {
      console.warn(Network.instance.localAvatarNetworkId, networkCarId, 'hasNot PlayerInCar component');
    }
  }
}
