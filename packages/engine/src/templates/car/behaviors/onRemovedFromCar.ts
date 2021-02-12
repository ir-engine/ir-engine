import { Matrix4, Vector3 } from 'three';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { Interactable } from "@xr3ngine/engine/src/interaction/components/Interactable";
import { Interactor } from "@xr3ngine/engine/src/interaction/components/Interactor";
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { PlayerInCar } from '@xr3ngine/engine/src/physics/components/PlayerInCar';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { CapsuleCollider } from '@xr3ngine/engine/src/physics/components/CapsuleCollider';
import { addState } from "@xr3ngine/engine/src/state/behaviors/addState";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { setDropState } from "@xr3ngine/engine/src/templates/character/behaviors/setDropState";
import { setPosition } from "@xr3ngine/engine/src/templates/character/behaviors/setPosition";
import { setOrientation } from "@xr3ngine/engine/src/templates/character/behaviors/setOrientation";
//import { deactivateCapsuleCollision } from "@xr3ngine/engine/src/templates/character/behaviors/deactivateCapsuleCollision";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { CharacterComponent } from "@xr3ngine/engine/src/templates/character/components/CharacterComponent";
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { isServer } from "../../../common/functions/isServer";
import { PhysicsSystem } from '@xr3ngine/engine/src/physics/systems/PhysicsSystem';

import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';



export const onRemovedFromCar = (entity: Entity, entityCar: Entity, seat: number, delta: number): void => {

  const networkDriverId = getComponent<NetworkObject>(entity, NetworkObject).networkId;
  const vehicle = getMutableComponent<VehicleBody>(entityCar, VehicleBody);
  vehicle[vehicle.seatPlane[seat]] = null;
  vehicle.wantsExit = [null, null];

  if (isServer) return;
  // CLIENT
  addState(entity, {state: CharacterStateTypes.IDLE});
  // LocalPlayerOnly
  if (Network.instance.userNetworkId != networkDriverId) return;
  removeComponent(entityCar, LocalInputReceiver);
  removeComponent(entityCar, FollowCameraComponent);

  addComponent(entity, LocalInputReceiver);
  addComponent(entity, FollowCameraComponent, { distance: 3, mode: "thirdPerson", raycastBoxOn: true });
};
