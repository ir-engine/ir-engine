import { Vector3 } from 'three';
import { Object3DComponent } from '@xr3ngine/engine/src/common/components/Object3DComponent';
import { cannonFromThreeVector } from "@xr3ngine/engine/src/common/functions/cannonFromThreeVector";
import { isClient } from '@xr3ngine/engine/src/common/functions/isClient';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Engine } from '../../../ecs/classes/Engine';
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../../ecs/functions/EntityFunctions';
import { LocalInputReceiver } from '../../../input/components/LocalInputReceiver';
import { Network } from '../../../networking/classes/Network';
import { NetworkObject } from '../../../networking/components/NetworkObject';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { CharacterComponent } from '../components/CharacterComponent';
import { rotateModel } from "./rotateModel";
import { springMovement } from "./springMovement";
import { springRotation } from "./springRotation";

export const updateCharacter: Behavior = (entity: Entity, args = null, deltaTime) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  const actorTransform = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
  // actor.behaviour?.update(timeStep);
  // actor.vehicleEntryInstance?.update(timeStep);
  // console.log(this.occupyingSeat);
  // this.charState?.update(timeStep);
  if (actor.mixer) {
    actor.mixer.update(deltaTime);
  }

  if (isClient && Engine.camera && hasComponent(entity, LocalInputReceiver)) {
    actor.viewVector = new Vector3(0, 0,-1).applyQuaternion(Engine.camera.quaternion);
  }

  if (actor.physicsEnabled) {

    // transfer localMovementDirection into velocityTarget
    actor.velocityTarget.copy(actor.localMovementDirection);






  springRotation(entity, null, deltaTime);
  springMovement(entity, null, deltaTime);
  rotateModel(entity);

    if (!isClient) {
      actorTransform.position.set(
        actor.actorCapsule.body.position.x,
        actor.actorCapsule.body.position.y,
        actor.actorCapsule.body.position.z
      );
    }

if (isClient) {
  const networkComponent = getComponent<NetworkObject>(entity, NetworkObject)
  if (networkComponent) {
    if (networkComponent.ownerId === Network.instance.userId) {
      actorTransform.position.set(
        actor.actorCapsule.body.position.x,
        actor.actorCapsule.body.position.y,
        actor.actorCapsule.body.position.z
      );
    }
  }
}


    // actorTransform.position.set(
    //   actor.actorCapsule.body.interpolatedPosition.x,
    //   actor.actorCapsule.body.interpolatedPosition.y,
    //   actor.actorCapsule.body.interpolatedPosition.z
    // );




  }
  else {

    const newPos = new Vector3();
    getMutableComponent(entity, Object3DComponent).value.getWorldPosition(newPos);
    actor.actorCapsule.body.position.copy(cannonFromThreeVector(newPos));
    actor.actorCapsule.body.interpolatedPosition.copy(cannonFromThreeVector(newPos));

  }
};
