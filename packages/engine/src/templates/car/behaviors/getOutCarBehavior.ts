import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { removeComponent, addComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { VehicleBody } from '../../../physics/components/VehicleBody';

export const getOutCar: Behavior = (entity: Entity): void => {
  console.log("Getting out of car")
  const vehicleBodyComponent = getMutableComponent(entity, VehicleBody)
  const entityDriver = vehicleBodyComponent.currentDriver

  removeComponent(entity, LocalInputReceiver)
  removeComponent(entity, FollowCameraComponent)

  addComponent(entityDriver, LocalInputReceiver)
  addComponent(entityDriver, FollowCameraComponent)

  vehicleBodyComponent.currentDriver = null
};
