import { Euler } from 'three';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { addComponent, getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { PlayerInCar } from '@xr3ngine/engine/src/physics/components/PlayerInCar';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { PhysicsSystem } from '@xr3ngine/engine/src/physics/systems/PhysicsSystem';
import { setState } from "@xr3ngine/engine/src/state/behaviors/setState";
//import { deactivateCapsuleCollision } from "@xr3ngine/engine/src/templates/character/behaviors/deactivateCapsuleCollision";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { CharacterComponent } from "@xr3ngine/engine/src/templates/character/components/CharacterComponent";
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { Matrix4, Vector3 } from 'three';
import { isServer } from "../../../common/functions/isServer";
import { CameraModes } from '../../../camera/types/CameraModes';
import { EnteringVehicle } from "@xr3ngine/engine/src/templates/character/components/EnteringVehicle";


function positionEnter(entity, entityCar, seat) {
  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const vehicle = getComponent<VehicleBody>(entityCar, VehicleBody);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);

  const position = new Vector3( ...vehicle.entrancesArray[seat] )
  .applyQuaternion(transformCar.rotation)
  .add(transformCar.position)
  .setY(transform.position.y)

  transform.position.set(
    position.x,
    position.y,
    position.z
  )

  transform.rotation.setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(transformCar.rotation),
      new Matrix4().makeRotationY(- Math.PI / 2)
    )
  )
//  console.warn(new Euler().setFromQuaternion(transformCar.rotation).y);
  return (new Euler().setFromQuaternion(transformCar.rotation)).y;
}


export const onAddedInCar = (entity: Entity, entityCar: Entity, seat: number, delta: number): void => {
  //console.warn('onAddedInCar '+seat);
  const networkDriverId = getComponent<NetworkObject>(entity, NetworkObject).networkId;
  const vehicle = getMutableComponent<VehicleBody>(entityCar, VehicleBody);
  vehicle[vehicle.seatPlane[seat]] = networkDriverId;

  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  PhysicsSystem.physicsWorld.removeBody(actor.actorCapsule.body);

  const orientation = positionEnter(entity, entityCar, seat);
  getMutableComponent(entity, PlayerInCar).state = 'onAddEnding';

  if (isServer) return;
  // CLIENT
  addComponent(entity, EnteringVehicle);
  setState(entity, { state: CharacterStateTypes.ENTERING_VEHICLE });
  // LocalPlayerOnly
  if (Network.instance.userNetworkId != networkDriverId) return;
  addComponent(entityCar, LocalInputReceiver);
  addComponent(entityCar, FollowCameraComponent, {
    distance: 7,
    locked: false,
    mode: CameraModes.ThirdPerson,
    theta: Math.round( ( (270/Math.PI) * (orientation/3*2) ) + 180),
    phi: 20
   });
};
