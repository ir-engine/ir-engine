import { Vector3, Matrix4, Quaternion } from 'three';

import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';

import { Input } from '../../input/components/Input';
import { BaseInput } from '../../input/enums/BaseInput';

import { ControllerColliderComponent } from '../components/ControllerColliderComponent';
import { CharacterComponent } from '../components/CharacterComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { isInXR } from '../../xr/functions/WebXRFunctions';
import { SIXDOFType } from '../../common/types/NumericalTypes';

/**
 * @author HydraFire <github.com/HydraFire>
 */

const upVector = new Vector3(0, 1, 0);
const quat = new Quaternion();
const mat4 = new Matrix4();
const newVelocity = new Vector3();
const onGroundVelocity = new Vector3();
const vec3 = new Vector3();

export const characterMoveBehavior = (entity: Entity, deltaTime): void => {
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  const transform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
  if (!actor.initialized || !collider.controller || !actor.movementEnabled) return;

  newVelocity.setScalar(0);
  onGroundVelocity.setScalar(0);

  if (actor.isGrounded) {
    collider.controller.velocity.y = 0;

    actor.velocityTarget.copy(actor.localMovementDirection).multiplyScalar(deltaTime);
    actor.velocitySimulator.target.copy(actor.velocityTarget);
    actor.velocitySimulator.simulate(deltaTime);

    actor.velocity.copy(actor.velocitySimulator.position);
    newVelocity.copy(actor.velocity).multiplyScalar(actor.moveSpeed * actor.speedMultiplier);

    if(isInXR(entity)) {
      // Apply direction from head look
      const input = getComponent<Input>(entity, Input as any);
      const headTransform = input.data.get(BaseInput.XR_HEAD);
      if(!headTransform?.value) return
      const sixdof = headTransform.value as SIXDOFType;
      quat.set(sixdof.qX, sixdof.qY, sixdof.qZ, sixdof.qW);
      newVelocity.applyQuaternion(quat);
    } else {
      // Apply direction from character orientation
      newVelocity.applyQuaternion(transform.rotation)
    }

    if (actor.closestHit) {
      onGroundVelocity.copy(newVelocity).setY(0);
      vec3.set(actor.closestHit.normal.x, actor.closestHit.normal.y, actor.closestHit.normal.z);
      quat.setFromUnitVectors(upVector, vec3);
      mat4.makeRotationFromQuaternion(quat);
      onGroundVelocity.applyMatrix4(mat4);
    }
    collider.controller.velocity.x = newVelocity.x;
    collider.controller.velocity.y = onGroundVelocity.y;
    collider.controller.velocity.z = newVelocity.z;


    if (actor.isJumping) {
      collider.controller.velocity.y -= 0.2;
    //  collider.controller.resize(actor.BODY_SIZE);
      actor.isJumping = false;
    }

    if (actor.localMovementDirection.y > 0 && !actor.isJumping) {
      collider.controller.velocity.y = actor.jumpHeight * deltaTime;
    //  collider.controller.resize(actor.BODY_SIZE);
      actor.isJumping = true;
      actor.isGrounded = false;
    }
    // TODO - Move on top of moving objects
    // physx has a feature for this, we should integrate both
    // if (actor.rayResult.body.mass > 0) {
    // 	const pointVelocity = new Vector3();
    // 	actor.rayResult.body.getVelocityAtWorldPoint(actor.rayResult.hitPointWorld, pointVelocity);
    // 	newVelocity.add(threeFromCannonVector(pointVelocity));
    // }
  }

  // apply gravity - TODO: improve this
  collider.controller.velocity.y -= 0.2 * deltaTime;

  // move according to controller's velocity
  collider.controller.delta.x += collider.controller.velocity.x;
  collider.controller.delta.y += collider.controller.velocity.y;
  collider.controller.delta.z += collider.controller.velocity.z;
};
