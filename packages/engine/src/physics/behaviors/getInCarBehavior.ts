import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { Vector2 } from 'three';
import { removeComponent, addComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { WheelBody } from '../../physics/components/WheelBody';

export const getInCar: Behavior = (entity: Entity, args: { value: Vector2 }): void => {

  let entityCar = WheelBody.instance.vehicle

  removeComponent(entity, LocalInputReceiver)
  removeComponent(entity, FollowCameraComponent)
  addComponent(entityCar, LocalInputReceiver)
  addComponent(entityCar, FollowCameraComponent)
};
