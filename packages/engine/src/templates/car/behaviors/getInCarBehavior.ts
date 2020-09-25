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
import { addState } from '../../../state/behaviors/StateBehaviors';
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";

export const getInCar: Behavior = (entity: Entity, args: { value: Vector2 }, delta, entityCar): void => {

  removeComponent(entity, LocalInputReceiver)
  removeComponent(entity, FollowCameraComponent)
  addState(entity, {state: CharacterStateTypes.ENTER_VEHICLE})
  addComponent(entity, PlayerInCar, { entityCar: entityCar })

  const event = new CustomEvent('player-in-car', { detail:{inCar:true} });
  document.dispatchEvent(event);

};
