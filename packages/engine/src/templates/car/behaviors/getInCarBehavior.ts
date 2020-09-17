import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { Vector2 } from 'three';
import {
  removeComponent,
  addComponent,
  getComponent,
  getMutableComponent
} from '../../../ecs/functions/EntityFunctions';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { VehicleBody } from '../../../physics/components/VehicleBody';
import { PlayerInCar } from '../../../physics/components/PlayerInCar';

export const getInCar: Behavior = (entity: Entity, args: { value: Vector2 }, delta, entityCar): void => {

  removeComponent(entity, LocalInputReceiver)
  removeComponent(entity, FollowCameraComponent)
  addComponent(entity, PlayerInCar, { entityCar: entityCar })

  addComponent(entityCar, LocalInputReceiver)
  addComponent(entityCar, FollowCameraComponent, { distance: 5, mode: "thirdPerson" })

  const vehicle = getMutableComponent(entityCar, VehicleBody)
  vehicle.currentDriver = entity
};
