import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from "../../../ecs/functions/EntityFunctions";
import { LocalInputReceiver } from "../../../input/components/LocalInputReceiver";
import { Network } from "../../../networking/classes/Network";
import { PlayerInCar } from "../../../physics/components/PlayerInCar";
import { VehicleState, VehicleStateUpdateSchema } from "../enums/VehicleStateEnum";

export const handleVehicleStateChange: Behavior = (entity: Entity, { values }: { values: VehicleStateUpdateSchema }): void => {

  const [state, networkCarId, currentFocusedPart] = values
  if (state == VehicleState.onAddedEnding) {
    if (Network.instance.localAvatarNetworkId == networkCarId) {
      removeComponent(entity, LocalInputReceiver);
    //  removeComponent(entity, FollowCameraComponent);
    }
    if (!hasComponent(entity, PlayerInCar)) {
      addComponent(entity, PlayerInCar, {
          state,
          networkCarId,
          currentFocusedPart
      });
    }
  }
  
  if (state == VehicleState.onStartRemove) {
    console.warn(getComponent(entity, PlayerInCar).state);

    if (hasComponent(entity, PlayerInCar)) {
      getMutableComponent(entity, PlayerInCar).state = state;
    } else {
      console.warn(Network.instance.localAvatarNetworkId, networkCarId, 'hasNot PlayerInCar component');
    }
  }
}