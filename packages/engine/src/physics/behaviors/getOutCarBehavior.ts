import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { Vector2 } from 'three';
import { removeComponent, addComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { WheelBody } from '../../physics/components/WheelBody';
import { VehicleBody } from '../../physics/components/VehicleBody';

export const getOutCar: Behavior = (entity: Entity, args: { value: Vector2 }): void => {

  let vehicleBodyComponent = getMutableComponent(entity, VehicleBody)

  let entityDriver = vehicleBodyComponent.currentDriver

  removeComponent(entity, LocalInputReceiver)
  removeComponent(entity, FollowCameraComponent)

  addComponent(entityDriver, LocalInputReceiver)
  addComponent(entityDriver, FollowCameraComponent)


};
