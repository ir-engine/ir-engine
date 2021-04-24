import { Vector3, Quaternion, Matrix4 } from 'three';
// import CANNON, { Vec3 } from 'cannon-es';

import { applyVectorMatrixXZ } from '../../common/functions/applyVectorMatrixXZ';
import { getSignedAngleBetweenVectors } from '../../common/functions/getSignedAngleBetweenVectors';
import { lerp } from '../../common/functions/MathLerpFunctions';

import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { hasComponent, getComponent, getMutableComponent, removeComponent } from '../../ecs/functions/EntityFunctions';

import { Input } from '../../input/components/Input';
import { BinaryValue } from "../../common/enums/BinaryValue";
import { BaseInput } from '../../input/enums/BaseInput';

import { ControllerColliderComponent } from '../components/ControllerColliderComponent';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { isServer } from '../../common/functions/isServer';
import { LocalInputReceiver } from "../../input/components/LocalInputReceiver";
import { InterpolationComponent } from '../components/InterpolationComponent';
import TeleportToSpawnPoint from '../../scene/components/TeleportToSpawnPoint';
import { XRUserSettings } from '../../templates/character/XRUserSettings';
import { PhysXInstance } from "@xr3ngine/three-physx";
import { getBit } from '../../common/functions/bitFunctions';
import { CHARACTER_STATES } from '../../templates/character/state/CharacterStates';

/**
 * @author HydraFire <github.com/HydraFire>
 */

const forwardVector = new Vector3(0, 0, 1);
const upVector = new Vector3(0, 1, 0);

function haveDifferentSigns(n1: number, n2: number): boolean {
  return (n1 < 0) !== (n2 < 0);
}

export const physicsMove = (entity: Entity, deltaTime): void => {

  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (!actor.initialized) return;
  const transform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
  if (!collider.controller) return;

  // update view vector on server - TODO: put this somewhere better
  if (isServer) {
    const flatViewVector = new Vector3(actor.viewVector.x, 0, actor.viewVector.z).normalize();
    actor.orientation.copy(applyVectorMatrixXZ(flatViewVector, forwardVector))
    transform.rotation.setFromUnitVectors(forwardVector, actor.orientation.clone().setY(0));
  }

  // slow movement when walking
  if (getComponent(entity, Input).data.get(BaseInput.WALK)?.value === BinaryValue.ON) {
    actor.localMovementDirection.multiplyScalar(0.8);
  }

  if (getBit(actor.state, CHARACTER_STATES.VR)) { // Engine.xrSession != null
    const inputs = getComponent(entity, Input);
    let rotationVector = null;
    switch (XRUserSettings.moving) {
      case 'followController':
        rotationVector = XRUserSettings.invertRotationAndMoveSticks ? inputs.data.get(BaseInput.XR_RIGHT_HAND).value : inputs.data.get(BaseInput.XR_LEFT_HAND).value;
        rotationVector = new Quaternion().set(rotationVector.qX, rotationVector.qY, rotationVector.qZ, rotationVector.qW)//.invert();

        const flatViewVector = new Vector3(actor.viewVector.x, 0, actor.viewVector.z).normalize();
        const orientationVector = applyVectorMatrixXZ(flatViewVector, forwardVector);
        const viewVectorFlatQuaternion = new Quaternion().setFromUnitVectors(forwardVector, orientationVector.setY(0));
        rotationVector.multiply(viewVectorFlatQuaternion);

        break;
      case 'followHead':
        rotationVector = inputs.data.get(BaseInput.XR_HEAD).value;
        rotationVector = new Quaternion().set(rotationVector.qX, rotationVector.qY, rotationVector.qZ, rotationVector.qW);
        break;
    }
  }

  const newVelocity = new Vector3();

  actor.velocityTarget.copy(actor.localMovementDirection).multiplyScalar(0.1);
  actor.velocitySimulator.target.copy(actor.velocityTarget);
  actor.velocitySimulator.simulate(deltaTime);

  actor.velocity.copy(actor.velocitySimulator.position);
  newVelocity.copy(actor.velocity).multiplyScalar(actor.moveSpeed);
  newVelocity.applyQuaternion(transform.rotation)

  collider.controller.velocity.x = newVelocity.x;
  collider.controller.velocity.z = newVelocity.z;

  actor.isGrounded = collider.controller.collisions.down;

  if (actor.isGrounded) {

    if (actor.isJumping) {
      actor.isJumping = false;
    }

    if (actor.localMovementDirection.y > 0 && !actor.isJumping) {
      collider.controller.velocity.y += 2.5 * deltaTime;
      actor.isJumping = true;
      actor.isGrounded = false;
    }
    // TODO - Move on top of moving objects
    // if (actor.rayResult.body.mass > 0) {
    // 	const pointVelocity = new Vec3();
    // 	actor.rayResult.body.getVelocityAtWorldPoint(actor.rayResult.hitPointWorld, pointVelocity);
    // 	newVelocity.add(threeFromCannonVector(pointVelocity));
    // }

    // TODO - uneven ground
    // Measure the normal vector offset from direct "up" vector and transform it into a matrix
    // const normal = new Vector3(actor.raycastQuery.hits[0].normal.x, actor.raycastQuery.hits[0].normal.y, actor.raycastQuery.hits[0].normal.z);
    // const q = new Quaternion().setFromUnitVectors(upVector, normal);
    // const m = new Matrix4().makeRotationFromQuaternion(q);
    // newVelocity.applyMatrix4(m);

    // add movement friction if on ground  
    collider.controller.velocity.x *= 0.8;
    collider.controller.velocity.z *= 0.8;
  } else {
    collider.controller.velocity.y -= 0.2 * deltaTime;
  }

  // move according to controller's velocity
  collider.controller.delta.x += collider.controller.velocity.x;
  collider.controller.delta.y += collider.controller.velocity.y;
  collider.controller.delta.z += collider.controller.velocity.z;
};
