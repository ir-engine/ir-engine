import { Behavior } from "../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Quaternion, Vector3, Object3D, AnimationClip, MathUtils, Matrix4 } from "three";
import { CollisionGroups } from "../classes/enums/CollisionGroups";
import { Vec3 } from "cannon-es";
import _ from "lodash";
import { setupMeshProperties, cannonVector, getSignedAngleBetweenVectors, appplyVectorMatrixXZ, haveDifferentSigns, threeVector } from "../functions/CharacterFunctions";
import { Object3DComponent } from "../../common/components/Object3DComponent";
import { PhysicsWorld } from "../../physics/components/PhysicsWorld";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { Engine } from "../../ecs/classes/Engine";
import { Entity } from "../../ecs/classes/Entity";
import { lerp } from "../../common/functions/MathLerpFunctions";
import { setOrientation, springMovement, springRotation, rotateModel } from "./CharacterMovementBehaviors";

    // Set for deletion
	export const setPhysicsEnabled: Behavior = (entity, args: { value: boolean }): void => {
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		character.physicsEnabled = args.value;

		if (args.value === true)
		{
			PhysicsWorld.instance.physicsWorld.addBody(character.characterCapsule.body);
		}
		else
		{
			PhysicsWorld.instance.physicsWorld.remove(character.characterCapsule.body);
		}
	}

    // Integrate with asset loader
	export const readCharacterData: Behavior = (entity, args: { model: any }): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

        // TODO: character will only work with glb
		args.model.scene.traverse((child) => {

			if (child.isMesh)
			{
				setupMeshProperties(child);

				if (child.material !== undefined)
				{
					character.materials.push(child.material);
				}
			}
		});
	}

	export const takeControl: Behavior = (entity: Entity): void =>
	{
        // TODO: Attach local player input receiver
        console.log("Local player should get input receiver tag here")
	}

        // Move to system
	export const update: Behavior = (entity, args: {timeStep: number}): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
        const characterTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any)
        const characterObject3D: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent)
        // TODO: Something here
		// character.vehicleEntryInstance?.update(args.timeStep);
		// console.log(character.occupyingSeat);

		// character.visuals.position.copy(character.modelOffset);
		if (character.physicsEnabled) springMovement(entity, args.timeStep);
		if (character.physicsEnabled) springRotation(entity, args.timeStep);
		if (character.physicsEnabled) rotateModel(entity);
		if (character.mixer !== undefined) character.mixer.update(args.timeStep);

		// Sync physics/graphics
		if (character.physicsEnabled)
		{
			characterTransform.position.set(
				character.characterCapsule.body.interpolatedPosition.x,
				character.characterCapsule.body.interpolatedPosition.y,
				character.characterCapsule.body.interpolatedPosition.z
			);
		}
		else {
			let newPos = new Vector3();
			characterObject3D.value.getWorldPosition(newPos);

			character.characterCapsule.body.position.copy(cannonVector(newPos));
			character.characterCapsule.body.interpolatedPosition.copy(cannonVector(newPos));
		}
	}

    // Remove me probably
	export const inputReceiverInit: Behavior = (entity: Entity): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		if (character.controlledObject !== undefined)
		{
			character.controlledObject.inputReceiverInit();
			return;
		}

		Engine.cameraOperator.setRadius(1.6, true);
		Engine.cameraOperator.followMode = false;
	}
    
    // Move to system
	export const inputReceiverUpdate: Behavior = (entity: Entity, args: { timeStep: number }): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
        const characterTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any)
        const characterObject3D: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent)

		if (character.controlledObject !== undefined)
		{
			character.controlledObject.inputReceiverUpdate(args.timeStep);
		}
		else
		{
			// Look in camera's direction
			character.viewVector = new Vector3().subVectors(characterTransform.position, Engine.camera.position);

            characterObject3D.value.updateMatrixWorld();
            
            // TODO: Replace with object3d components
			if (character.vehicleEntryInstance !== null) (character.vehicleEntryInstance.targetSeat.vehicle as Object3D).updateMatrixWorld();
			else if (character.occupyingSeat !== null) (character.occupyingSeat.vehicle as Object3D).updateMatrixWorld();

			characterObject3D.value.getWorldPosition(Engine.cameraOperator.target);
		}
		
	}

	export const setAnimation: Behavior = (entity: Entity, args: { clipName: string, fadeIn: number }): number =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		if (character.mixer !== undefined)
		{
			// gltf
			let clip = AnimationClip.findByName( character.animations, args.clipName );

			let action = character.mixer.clipAction(clip);
			if (action === null)
			{
				console.error(`Animation ${args.clipName} not found!`);
				return 0;
			}

			character.mixer.stopAllAction();
			action.fadeIn(args.fadeIn);
			action.play();

			return action.getClip().duration;
		}
	}

	export const physicsPreStep: Behavior = (entity): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
		let body = character.characterCapsule.body;

		feetRaycast(entity);

		// Raycast debug
		if (character.rayHasHit)
		{
			if (character.raycastBox.visible) {
				character.raycastBox.position.x = character.rayResult.hitPointWorld.x;
				character.raycastBox.position.y = character.rayResult.hitPointWorld.y;
				character.raycastBox.position.z = character.rayResult.hitPointWorld.z;
			}
		}
		else
		{
			if (character.raycastBox.visible) {
				character.raycastBox.position.set(body.position.x, body.position.y - character.rayCastLength - character.raySafeOffset, body.position.z);
			}
		}
	}

	export const feetRaycast: Behavior = (entity: Entity): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
		let body = character.characterCapsule.body;

		// Player ray casting
		// Create ray
		const start = new Vec3(body.position.x, body.position.y, body.position.z);
		const end = new Vec3(body.position.x, body.position.y - character.rayCastLength - character.raySafeOffset, body.position.z);
		// Raycast options
		const rayCastOptions = {
			collisionFilterMask: CollisionGroups.Default,
			skipBackfaces: true      /* ignore back faces */
		};
		// Cast the ray
		character.rayHasHit = PhysicsWorld.instance.physicsWorld.raycastClosest(start, end, rayCastOptions, character.rayResult);
	}

	export const physicsPostStep: Behavior = (entity): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
		let body = character.characterCapsule.body;

		// Get velocities
		let simulatedVelocity = new Vector3(body.velocity.x, body.velocity.y, body.velocity.z);

		// Take local velocity
		let arcadeVelocity = new Vector3().copy(character.velocity).multiplyScalar(character.moveSpeed);
		// Turn local into global
		arcadeVelocity = appplyVectorMatrixXZ(character.orientation, arcadeVelocity);

		let newVelocity = new Vector3();

		// Additive velocity mode
		if (character.arcadeVelocityIsAdditive)
		{
			newVelocity.copy(simulatedVelocity);

			let globalVelocityTarget = appplyVectorMatrixXZ(character.orientation, character.velocityTarget);
			let add = new Vector3().copy(arcadeVelocity).multiply(character.arcadeVelocityInfluence);

			if (Math.abs(simulatedVelocity.x) < Math.abs(globalVelocityTarget.x * character.moveSpeed) || haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) { newVelocity.x += add.x; }
			if (Math.abs(simulatedVelocity.y) < Math.abs(globalVelocityTarget.y * character.moveSpeed) || haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) { newVelocity.y += add.y; }
			if (Math.abs(simulatedVelocity.z) < Math.abs(globalVelocityTarget.z * character.moveSpeed) || haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) { newVelocity.z += add.z; }
		}
		else
		{
			newVelocity = new Vector3(
				lerp(simulatedVelocity.x, arcadeVelocity.x, character.arcadeVelocityInfluence.x),
				lerp(simulatedVelocity.y, arcadeVelocity.y, character.arcadeVelocityInfluence.y),
				lerp(simulatedVelocity.z, arcadeVelocity.z, character.arcadeVelocityInfluence.z),
			);
		}

		// If we're hitting the ground, stick to ground
		if (character.rayHasHit)
		{
			// Flatten velocity
			newVelocity.y = 0;

			// Move on top of moving objects
			if (character.rayResult.body.mass > 0)
			{
				let pointVelocity = new Vec3();
				character.rayResult.body.getVelocityAtWorldPoint(character.rayResult.hitPointWorld, pointVelocity);
				newVelocity.add(threeVector(pointVelocity));
			}

			// Measure the normal vector offset from direct "up" vector
			// and transform it into a matrix
			let up = new Vector3(0, 1, 0);
			let normal = new Vector3(character.rayResult.hitNormalWorld.x, character.rayResult.hitNormalWorld.y, character.rayResult.hitNormalWorld.z);
			let q = new Quaternion().setFromUnitVectors(up, normal);
			let m = new Matrix4().makeRotationFromQuaternion(q);

			// Rotate the velocity vector
			newVelocity.applyMatrix4(m);

			// Compensate for gravity
			// newVelocity.y -= body.world.physicsWorld.gravity.y / body.character.world.physicsFrameRate;

			// Apply velocity
			body.velocity.x = newVelocity.x;
			body.velocity.y = newVelocity.y;
			body.velocity.z = newVelocity.z;
			// Ground character
			body.position.y = character.rayResult.hitPointWorld.y + character.rayCastLength + (newVelocity.y / Engine.physicsFrameRate);
		}
		else
		{
			// If we're in air
			body.velocity.x = newVelocity.x;
			body.velocity.y = newVelocity.y;
			body.velocity.z = newVelocity.z;

			// Save last in-air information
			character.groundImpactVelocity.x = body.velocity.x;
			character.groundImpactVelocity.y = body.velocity.y;
			character.groundImpactVelocity.z = body.velocity.z;
		}

		// Jumping
		if (character.wantsToJump)
		{
			// If initJumpSpeed is set
			if (character.initJumpSpeed > -1)
			{
				// Flatten velocity
				body.velocity.y = 0;
				let speed = Math.max(character.velocitySimulator.position.length() * 4, character.initJumpSpeed);
				body.velocity = cannonVector(character.orientation.clone().multiplyScalar(speed));
			}
			else {
				// Moving objects compensation
				let add = new Vec3();
				character.rayResult.body.getVelocityAtWorldPoint(character.rayResult.hitPointWorld, add);
				body.velocity.vsub(add, body.velocity);
			}

			// Add positive vertical velocity 
			body.velocity.y += 4;
			// Move above ground by 2x safe offset value
			body.position.y += character.raySafeOffset * 2;
			// Reset flag
			character.wantsToJump = false;
		}
	}

	export const addToWorld: Behavior = (entity: Entity): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
        const characterObject3D: Object3DComponent =  getMutableComponent<Object3DComponent>(entity, Object3DComponent as any)

			// Register physics
			PhysicsWorld.instance.physicsWorld.addBody(character.characterCapsule.body);

			// Add to graphicsWorld
			Engine.scene.add(characterObject3D.value);
			Engine.scene.add(character.raycastBox);

			// Shadow cascades
			character.materials.forEach((mat) =>
			{
				Engine.csm.setupMaterial(mat);
			});
	}

	export const removeFromWorld: Behavior = (entity: Entity): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
        const characterObject3D: Object3DComponent =  getMutableComponent<Object3DComponent>(entity, Object3DComponent as any)

			// Remove physics
			PhysicsWorld.instance.physicsWorld.remove(character.characterCapsule.body);

			// Remove visuals
			Engine.scene.remove(characterObject3D.value);
			Engine.scene.remove(character.raycastBox);
	}
