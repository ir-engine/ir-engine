import { Vector3, Quaternion } from 'three';
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

export const physicsMove: Behavior = (entity: Entity, args: any, deltaTime): void => {
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (!actor.initialized) return;
  const transform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
  if(!collider.controller) return;
  // if we rotation character here, lets server will do his rotation here too
  if (isServer) {
    const flatViewVector = new Vector3(actor.viewVector.x, 0, actor.viewVector.z).normalize();
    actor.orientation.copy(applyVectorMatrixXZ(flatViewVector, forwardVector))
    transform.rotation.setFromUnitVectors(forwardVector, actor.orientation.clone().setY(0));
  }
  // if we rotation character here, lets server will do his rotation here too
  if (hasComponent(entity, InterpolationComponent) && !hasComponent(entity, TeleportToSpawnPoint) && !hasComponent(entity, LocalInputReceiver)) return;
  // down speed when walk
  if (getComponent(entity, Input).data.get(BaseInput.WALK)?.value === BinaryValue.ON) {
    actor.localMovementDirection.x = actor.localMovementDirection.x * 0.8
    //  actor.localMovementDirection.y = actor.localMovementDirection.y * 0.7
    actor.localMovementDirection.z = actor.localMovementDirection.z * 0.8
    //actor.localMovementDirection.multiplyScalar(0.5)
  }

  const newVelocity = new Vector3();
  const arcadeVelocity = new Vector3();
  const simulatedVelocity = new Vector3();

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
    // Get velocities
    simulatedVelocity.set(collider.controller.transform.linearVelocity.x, collider.controller.transform.linearVelocity.y, collider.controller.transform.linearVelocity.z);
    actor.velocity.copy(actor.localMovementDirection);
    arcadeVelocity.copy(actor.velocity).multiplyScalar(actor.moveSpeed);
    //  console.warn(rotationVector);
    arcadeVelocity.applyQuaternion(rotationVector)

  } else {
    // Figure out angle between current and target orientation
    const angle = getSignedAngleBetweenVectors(actor.orientation, actor.orientationTarget);
    // Simulator
    actor.rotationSimulator.target = angle;
    actor.rotationSimulator.simulate(deltaTime);
    const rot = actor.rotationSimulator.position;
    // Updating values
    actor.orientation.applyAxisAngle(upVector, rot);
    actor.angularVelocity = actor.rotationSimulator.velocity;
    // Handle JUMP
    if (actor.localMovementDirection.y > 0 && actor.rayHasHit) {
      actor.wantsToJump = true
    }
    // velocitySimulator
    actor.velocityTarget.copy(actor.localMovementDirection);
    actor.velocitySimulator.target.copy(actor.velocityTarget);
    actor.velocitySimulator.simulate(deltaTime);
    actor.velocity.copy(actor.velocitySimulator.position);
    actor.acceleration.copy(actor.velocitySimulator.velocity);
    // add new velocity

    // Get velocities
    simulatedVelocity.set(collider.controller.velocity.x, collider.controller.velocity.y, collider.controller.velocity.z);
    // Take local velocity
    arcadeVelocity.copy(actor.velocity).multiplyScalar(actor.moveSpeed);
    // Turn local into global
    arcadeVelocity.copy(applyVectorMatrixXZ(actor.orientation, arcadeVelocity));
  }

  // Additive velocity mode
  if (actor.arcadeVelocityIsAdditive) {
    newVelocity.copy(simulatedVelocity);
    const globalVelocityTarget = applyVectorMatrixXZ(actor.orientation, actor.velocityTarget);
    const add = new Vector3().copy(arcadeVelocity).multiply(actor.arcadeVelocityInfluence);
    /*
      if (Math.abs(simulatedVelocity.x) < Math.abs(globalVelocityTarget.x * actor.moveSpeed) || haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) { newVelocity.x += add.x; }
      if (Math.abs(simulatedVelocity.y) < Math.abs(globalVelocityTarget.y * actor.moveSpeed) || haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) { newVelocity.y += add.y; }
      if (Math.abs(simulatedVelocity.z) < Math.abs(globalVelocityTarget.z * actor.moveSpeed) || haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) { newVelocity.z += add.z; }
    */
    if (haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) { newVelocity.x += add.x; }
    if (haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) { newVelocity.y += add.y; }
    if (haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) { newVelocity.z += add.z; }
  } else {
    newVelocity.set(
      lerp(simulatedVelocity.x, arcadeVelocity.x, actor.arcadeVelocityInfluence.x),
      lerp(simulatedVelocity.y, arcadeVelocity.y, actor.arcadeVelocityInfluence.y),
      lerp(simulatedVelocity.z, arcadeVelocity.z, actor.arcadeVelocityInfluence.z)
    );
  }
  // Jumping
  if (actor.wantsToJump && !actor.alreadyJumped) {
    newVelocity.y += 5;
    collider.controller.velocity.y = newVelocity.y;

    // Move above ground by 2x safe offset value
    // collider.controller.delta.y = actor.raySafeOffset * 2;
    // Reset flag
    actor.wantsToJump = false;
    actor.alreadyJumped = true;
    // actor.arcadeVelocityIsAdditive = true;
  }
  // If we're hitting the ground, stick to ground
  // if (actor.rayHasHit) {
  // 	// console.log("We are hitting the ground")
  // 	// Flatten velocity
  // 	newVelocity.y = 0;
  // 	// Move on top of moving objects
  // 	if (actor.rayGroundHit && actor.rayResult.body.mass > 0) {
  // 		const pointVelocity = new Vec3();
  // 		actor.rayResult.body.getVelocityAtWorldPoint(actor.rayResult.hitPointWorld, pointVelocity);
  // 		newVelocity.add(threeFromCannonVector(pointVelocity));
  // 	}
  // 	// Measure the normal vector offset from direct "up" vector
  // 	// and transform it into a matrix
  //   if (actor.rayGroundHit) {
  //   	const normal = new Vector3(actor.rayResult.hitNormalWorld.x, actor.rayResult.hitNormalWorld.y, actor.rayResult.hitNormalWorld.z);
  //   	const q = new Quaternion().setFromUnitVectors(upVector, normal);
  //   	const m = new Matrix4().makeRotationFromQuaternion(q);
  //   	// Rotate the velocity vector
  //   	newVelocity.applyMatrix4(m);
  //   }
  // 	// Compensate for gravity
  // 	// newVelocity.y -= body.world.physicsWorld.gravity.y / body.actor.world.physicsFrameRate;
  // 	// Apply velocity
  // 	// Ground actor
  // 	body.position.y = actor.rayGroundY + actor.rayCastLength //+ newVelocity.y// / Engine.physicsFrameRate);
  //   actor.arcadeVelocityIsAdditive = false;
  //   actor.alreadyJumped = false;
  // }
  // Update Velocity
  //updateIK(entity);

  // Flatten velocity
  //	body.velocity.y = 0;
  //	const speed = 0.1
  //		body.velocity = cannonFromThreeVector(actor.orientation.clone().multiplyScalar(speed));
  //		console.warn(body.velocity);


    /*
    if (!actor.physicsEnabled) {
      const newPos = new Vector3();
      getMutableComponent(entity, Object3DComponent).value.getWorldPosition(newPos);
      actor.actorCapsule.body.position.copy(cannonFromThreeVector(newPos));
      actor.actorCapsule.body.interpolatedPosition.copy(cannonFromThreeVector(newPos));
    }
    */
    console.log(actor.raycastQuery.hits, collider.controller.collisions, collider.controller.velocity)
   collider.controller.velocity.x = newVelocity.x;
   collider.controller.velocity.y = newVelocity.y;
   collider.controller.velocity.z = newVelocity.z;
   if (collider.controller.collisions.down) {
    if (collider.controller.velocity.y < 0)
    collider.controller.velocity.y = 0;
  } else {
    collider.controller.velocity.y -= (0.2 / deltaTime);
  }
  // collider.controller.delta.y += collider.controller.velocity.y;
};
