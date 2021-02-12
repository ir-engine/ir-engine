import { Vec3 } from "cannon-es";
import { Matrix4, Quaternion, Vector3 } from "three";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { isClient } from "@xr3ngine/engine/src/common/functions/isClient";
import { lerp } from "@xr3ngine/engine/src/common/functions/MathLerpFunctions";
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Engine } from "../../../ecs/classes/Engine";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { appplyVectorMatrixXZ } from "../functions/appplyVectorMatrixXZ";

const up = new Vector3(0, 1, 0);

function haveDifferentSigns(n1: number, n2: number): boolean {
	return (n1 < 0) !== (n2 < 0);
}

function threeFromCannonVector(vec: CANNON.Vec3): THREE.Vector3 {
	return new THREE.Vector3(vec.x, vec.y, vec.z);
}

function threeFromCannonQuat(quat: CANNON.Quaternion): THREE.Quaternion {
	return new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
}

const arcadeVelocity = new Vector3();
const simulatedVelocity = new Vector3();
const newVelocity = new Vector3();

export const physicsPostStep: Behavior = (entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return;

	const body = actor.actorCapsule.body;
	if(body.world == null) return;
	// Get velocities
	simulatedVelocity.set(body.velocity.x, body.velocity.y, body.velocity.z);

	// Take local velocity
	arcadeVelocity.copy(actor.velocity).multiplyScalar(actor.moveSpeed);
	// Turn local into global
	arcadeVelocity.copy(appplyVectorMatrixXZ(actor.orientation, arcadeVelocity));

	// Additive velocity mode
	if (actor.arcadeVelocityIsAdditive) {
		newVelocity.copy(simulatedVelocity);

		const globalVelocityTarget = appplyVectorMatrixXZ(actor.orientation, actor.velocityTarget);
		const add = new Vector3().copy(arcadeVelocity).multiply(actor.arcadeVelocityInfluence);
/*
		if (Math.abs(simulatedVelocity.x) < Math.abs(globalVelocityTarget.x * actor.moveSpeed) || haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) { newVelocity.x += add.x; }
		if (Math.abs(simulatedVelocity.y) < Math.abs(globalVelocityTarget.y * actor.moveSpeed) || haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) { newVelocity.y += add.y; }
		if (Math.abs(simulatedVelocity.z) < Math.abs(globalVelocityTarget.z * actor.moveSpeed) || haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) { newVelocity.z += add.z; }
*/
		//console.warn(actor.moveSpeed);
		if ( haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) { newVelocity.x += add.x; }
		if ( haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) { newVelocity.y += add.y; }
		if ( haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) { newVelocity.z += add.z; }
	}
	else {

		newVelocity.set(
			lerp(simulatedVelocity.x, arcadeVelocity.x, actor.arcadeVelocityInfluence.x),
			lerp(simulatedVelocity.y, arcadeVelocity.y, actor.arcadeVelocityInfluence.y),
			lerp(simulatedVelocity.z, arcadeVelocity.z, actor.arcadeVelocityInfluence.z)
		);
	}

	// If we're hitting the ground, stick to ground
	if (actor.rayHasHit) {
		// console.log("We are hitting the ground")
		// Flatten velocity
		newVelocity.y = 0;

		// Move on top of moving objects
		if (actor.rayResult.body.mass > 0) {
			const pointVelocity = new Vec3();
			actor.rayResult.body.getVelocityAtWorldPoint(actor.rayResult.hitPointWorld, pointVelocity);
			newVelocity.add(threeFromCannonVector(pointVelocity));
		}

		// Measure the normal vector offset from direct "up" vector
		// and transform it into a matrix
		const normal = new Vector3(actor.rayResult.hitNormalWorld.x, actor.rayResult.hitNormalWorld.y, actor.rayResult.hitNormalWorld.z);
		const q = new Quaternion().setFromUnitVectors(up, normal);
		const m = new Matrix4().makeRotationFromQuaternion(q);

		// Rotate the velocity vector
		newVelocity.applyMatrix4(m);

		// Compensate for gravity
		// newVelocity.y -= body.world.physicsWorld.gravity.y / body.actor.world.physicsFrameRate;
		// Apply velocity
	//	if (!isClient) {
			//console.error(body.velocity.x);

			body.velocity.x = newVelocity.x;
			body.velocity.y = newVelocity.y;
			body.velocity.z = newVelocity.z;
	//	}
		// Ground actor
		body.position.y = actor.rayResult.hitPointWorld.y + actor.rayCastLength + (newVelocity.y / Engine.physicsFrameRate);
	}
	else {
		// If we're in air
		body.velocity.x = newVelocity.x;
		body.velocity.y = newVelocity.y;
		body.velocity.z = newVelocity.z;

		// Save last in-air information
		actor.groundImpactVelocity.x = body.velocity.x;
		actor.groundImpactVelocity.y = body.velocity.y;
		actor.groundImpactVelocity.z = body.velocity.z;
	}

	// Jumping
	if (actor.wantsToJump) {
		// If initJumpSpeed is set
		if (actor.initJumpSpeed > -1) {


			// Flatten velocity
		//	body.velocity.y = 0;
		//	const speed = 0.1
	//		body.velocity = cannonFromThreeVector(actor.orientation.clone().multiplyScalar(speed));
	//		console.warn(body.velocity);
		}
		else if (actor.rayHasHit) {
			// Moving objects compensation
			const add = new Vec3();
			actor.rayResult.body.getVelocityAtWorldPoint(actor.rayResult.hitPointWorld, add);
			body.velocity.vsub(add, body.velocity);
		}

		// Add positive vertical velocity
		body.velocity.y += 4;
		// Move above ground by 2x safe offset value
		body.position.y += actor.raySafeOffset * 2;
		// Reset flag
		actor.wantsToJump = false;
	}


	// const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
	// transform.position.set(body.position.x, body.position.y, body.position.z);
};
