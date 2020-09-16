import { Vector3 } from 'three';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { removeComponent, addComponent, getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { VehicleBody } from '../../../physics/components/VehicleBody';
import { PlayerInCar } from '../../../physics/components/PlayerInCar';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { setPosition } from '../../../templates/character/behaviors/setPosition';


export const getOutCar: Behavior = (entity: Entity): void => {
  console.log("Getting out of car")
  const vehicleBodyComponent = getMutableComponent(entity, VehicleBody)
  const entityDriver = vehicleBodyComponent.currentDriver

  const transformCar = getComponent<TransformComponent>(entity, TransformComponent);
  const transform = getMutableComponent<TransformComponent>(entityDriver, TransformComponent);

  removeComponent(entity, LocalInputReceiver)
  removeComponent(entity, FollowCameraComponent)
  vehicleBodyComponent.currentDriver = null

  addComponent(entityDriver, LocalInputReceiver)
  addComponent(entityDriver, FollowCameraComponent)
  removeComponent(entityDriver, PlayerInCar)

  // set position character when get out car
  let entrance = new Vector3(
    vehicleBodyComponent.entrancesArray[0][0],
    vehicleBodyComponent.entrancesArray[0][1],
    vehicleBodyComponent.entrancesArray[0][2]
  ).applyQuaternion(transformCar.rotation)
  entrance = entrance.add(transformCar.position)
  setPosition(entityDriver, entrance)

};
