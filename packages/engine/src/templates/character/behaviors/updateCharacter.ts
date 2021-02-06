import { Quaternion, Vector3 } from 'three';
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

  updateIK(entity);

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

var lastRightGamePad = null;

function updateIK(entity: Entity) {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  const dateOffset = Math.floor(Math.random() * 60 * 1000);
  const realDateNow = (now => () => dateOffset + now())(Date.now);

  const positionOffset = Math.sin((realDateNow() % 10000) / 10000 * Math.PI * 2) * 2;
  const positionOffset2 = -Math.sin((realDateNow() % 5000) / 5000 * Math.PI * 2) * 1;
  const standFactor = actor.height - 0.1 * actor.height + Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * 0.2 * actor.height;
  const rotationAngle = (realDateNow() % 5000) / 5000 * Math.PI * 2;

  if(actor.inputs) {
    // actor.inputs.hmd.position.set(positionOffset, 0.6 + standFactor, 0);
    actor.inputs.hmd.position.set(positionOffset, standFactor, positionOffset2);
    actor.inputs.hmd.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), rotationAngle)
      .multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * Math.PI * 0.2))
      .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * Math.PI * 0.25));

    actor.inputs.rightGamepad.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), rotationAngle)
    // .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.sin((realDateNow()%5000)/5000*Math.PI*2)*Math.PI*0.6));
    actor.inputs.rightGamepad.position.set(positionOffset, actor.height * 0.7 + Math.sin((realDateNow() % 2000) / 2000 * Math.PI * 2) * 0.1, positionOffset2).add(
      new Vector3(-actor.shoulderWidth / 2, 0, -0.2).applyQuaternion(actor.inputs.rightGamepad.quaternion)
    )/*.add(
      new Vector3(-0.1, 0, -1).normalize().multiplyScalar(actor.rightArmLength*0.4).applyQuaternion(actor.inputs.rightGamepad.quaternion)
    ); */
    if(lastRightGamePad !== actor.inputs.rightGamepad.position) {
      // console.log(actor);
      // console.log(actor.inputs.rightGamepad.position);
    }
    lastRightGamePad = actor.inputs.rightGamepad.position;
    actor.inputs.leftGamepad.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), rotationAngle);
    actor.inputs.leftGamepad.position.set(positionOffset, actor.height * 0.7, positionOffset2).add(
      new Vector3(actor.shoulderWidth / 2, 0, -0.2).applyQuaternion(actor.inputs.leftGamepad.quaternion)
    )/*.add(
      new Vector3(0.1, 0, -1).normalize().multiplyScalar(actor.leftArmLength*0.4).applyQuaternion(actor.inputs.leftGamepad.quaternion)
    );*/

    actor.inputs.leftGamepad.pointer = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;
    actor.inputs.leftGamepad.grip = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;

    actor.inputs.rightGamepad.pointer = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;
    actor.inputs.rightGamepad.grip = (Math.sin((Date.now() % 10000) / 10000 * Math.PI * 2) + 1) / 2;

    actor.update();
  }
}