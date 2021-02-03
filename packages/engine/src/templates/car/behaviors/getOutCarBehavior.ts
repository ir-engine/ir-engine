import { Vector3, Matrix4 } from 'three';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { removeComponent, addComponent, getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { VehicleBody } from '../../../physics/components/VehicleBody';
import { PlayerInCar } from '../../../physics/components/PlayerInCar';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { setPosition } from '../../../templates/character/behaviors/setPosition';
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";


export const getOutCar: Behavior = (entity: Entity): void => {
  console.warn("Getting out of car");
  const vehicleComponent = getMutableComponent(entity, VehicleBody);
  const entityDriver = vehicleComponent.currentDriver;

  addState(entityDriver, {state: CharacterStateTypes.EXIT_VEHICLE});

  const event = new CustomEvent('player-in-car', { detail:{inCar:false} });
  document.dispatchEvent(event);

};
