import { ICharacterState } from "../classes/interfaces/ICharacterState";
import { Behavior } from "../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/Character";
import { getMutableComponent, getComponent } from "../../ecs/functions/EntityFunctions";
import { Vector3, Object3D, AnimationClip, MathUtils, Matrix4 } from "three";
import { ICharacterAI } from "../classes/interfaces/ICharacterAI";
import { ClosestObjectFinder } from "../classes/core/ClosestObjectFinder";
import { Vehicle } from "../classes/physics/vehicles/Vehicle";
import { VehicleEntryInstance } from "../classes/characters/VehicleEntryInstance";
import { VehicleSeat } from "../classes/physics/vehicles/VehicleSeat";
import { SeatType } from "../classes/enums/SeatType";
import { OpenVehicleDoor } from "../classes/characters/character_states/vehicles/OpenVehicleDoor";
import { EnteringVehicle } from "../classes/characters/character_states/vehicles/EnteringVehicle";
import { Driving } from "../classes/characters/character_states/vehicles/Driving";
import { IControllable } from "../classes/interfaces/IControllable";
import { EntityType } from "../classes/enums/EntityType";
import { ExitingAirplane } from "../classes/characters/character_states/vehicles/ExitingAirplane";
import { ExitingVehicle } from "../classes/characters/character_states/vehicles/ExitingVehicle";
import { Character } from "../classes/characters/Character";
import { CollisionGroups } from "../classes/enums/CollisionGroups";
import { Quaternion, World, Vec3 } from "cannon-es";
import _ from "lodash";
import { getForward, setupMeshProperties, cannonVector, getSignedAngleBetweenVectors, appplyVectorMatrixXZ, haveDifferentSigns, threeVector } from "../classes/core/FunctionLibrary";
import { Object3DComponent } from "../../common/components/Object3DComponent";
import { PhysicsWorld } from "../../physics/components/PhysicsWorld";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { Engine } from "../../ecs/classes/Engine";
import { Entity } from "../../ecs/classes/Entity";
import { lerp } from "../../common/functions/MathLerpFunctions";

	export const setArcadeVelocityInfluence: Behavior = (entity, args: { x: number, y: number = args.x, z: number = args.x }): void =>
	{
        getMutableComponent<CharacterComponent>(entity, CharacterComponent as any).arcadeVelocityInfluence.set(args.x, args.y, args.z);
	}

	export const setViewVector: Behavior = (entity, args: {vector: Vector3}): void =>
	{
		getMutableComponent<CharacterComponent>(entity, CharacterComponent as any).viewVector.copy(args.vector).normalize();
	}

	export const setPosition: Behavior = (entity, args: { x: number, y: number = args.x, z: number = args.x }): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
			character.characterCapsule.body.previousPosition = new Vec3(args.x, args.y, args.z);
			character.characterCapsule.body.position = new Vec3(args.x, args.y, args.z);
			character.characterCapsule.body.interpolatedPosition = new Vec3(args.x, args.y, args.z);
	}

	export const resetVelocity: Behavior = (entity: Entity): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
		character.velocity.x = 0;
		character.velocity.y = 0;
		character.velocity.z = 0;

		character.characterCapsule.body.velocity.x = 0;
		character.characterCapsule.body.velocity.y = 0;
		character.characterCapsule.body.velocity.z = 0;

		character.velocitySimulator.init();
	}

	export const setArcadeVelocityTarget: Behavior = (entity, args: {velZ: number, velX: number = 0, velY: number = 0}): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
		character.velocityTarget.z = args.velZ;
		character.velocityTarget.x = args.velX;
		character.velocityTarget.y = args.velY;
	}

	export const setOrientation: Behavior = (entity, args: { vector: Vector3, instantly: boolean = false }): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

        let lookVector = new Vector3().copy(args.vector).setY(0).normalize();
        
		character.orientationTarget.copy(lookVector);
		
		if (args.instantly)
		{
			character.orientation.copy(lookVector);
		}
	}

	export const resetOrientation: Behavior = (entity: Entity): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
        const characterObject3D: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent)
		const forward = getForward(characterObject3D.value);
		setOrientation(entity, { vector: forward, instantly: true });
    }
    
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
		character.charState?.update(args.timeStep);

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

	export const springMovement: Behavior = (entity, args: { timeStep: number}): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		// Simulator
		character.velocitySimulator.target.copy(character.velocityTarget);
		character.velocitySimulator.simulate(args.timeStep);

		// Update values
		character.velocity.copy(character.velocitySimulator.position);
		character.acceleration.copy(character.velocitySimulator.velocity);
	}

	export const springRotation: Behavior = (entity, args: { timeStep: number }): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		// Spring rotation
		// Figure out angle between current and target orientation
		let angle = getSignedAngleBetweenVectors(character.orientation, character.orientationTarget);

		// Simulator
		character.rotationSimulator.target = angle;
		character.rotationSimulator.simulate(args.timeStep);
		let rot = character.rotationSimulator.position;

		// Updating values
		character.orientation.applyAxisAngle(new Vector3(0, 1, 0), rot);
		character.angularVelocity = character.rotationSimulator.velocity;
	}

    // Not a behavior, it just returns a value
	export const getLocalMovementDirection = (entity: Entity): Vector3 =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

        // TODO: Incorporate into input system!
		const positiveX = character.actions.right.isPressed ? -1 : 0;
		const negativeX = character.actions.left.isPressed ? 1 : 0;
		const positiveZ = character.actions.up.isPressed ? 1 : 0;
		const negativeZ = character.actions.down.isPressed ? -1 : 0;

		return new Vector3(positiveX + negativeX, 0, positiveZ + negativeZ).normalize();
	}

    // Function
	export const getCameraRelativeMovementVector = (entity: Entity): Vector3 =>
	{
        const character: CharacterComponent =  getComponent<CharacterComponent>(entity, CharacterComponent as any)
        const characterObject3D: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent)

		const localDirection = getLocalMovementDirection(entity);
		const flatViewVector = new Vector3(character.viewVector.x, 0, character.viewVector.z).normalize();

		return appplyVectorMatrixXZ(flatViewVector, localDirection);
	}

	export const setCameraRelativeOrientationTarget: Behavior = (entity: Entity): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		if (character.vehicleEntryInstance === null)
		{
			let moveVector = getCameraRelativeMovementVector(entity);
	
			if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0)
			{
				setOrientation(entity, { vector: character.orientation });
			}
			else
			{
                setOrientation(entity, { vector: moveVector });
			}
		}
    }
    
    	/**
	 * Set state to the player. Pass state class (function) name.
	 * @param {function} State 
	 */
	export function setState(entity, args: { state: any }): void
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		character.charState = args.state;
		character.charState.onInputChange();
	}


	export const rotateModel: Behavior = (entity: Entity): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
        const characterTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any)
        const characterObject3D: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent)
        // TODO: Need these values in our transform system not setting three.js directly
		characterObject3D.value.lookAt(characterTransform.position.x + characterTransform.rotation.x, characterTransform.position.y + characterTransform.rotation.y, characterTransform.position.z + characterTransform.rotation.z);
		character.tiltContainer.rotation.z = (-character.angularVelocity * 2.3 * character.velocity.length());
		character.tiltContainer.position.setY((Math.cos(Math.abs(character.angularVelocity * 2.3 * character.velocity.length())) / 2) - 0.5);
	}

	export const jump: Behavior = (entity, args: { initJumpSpeed: number = -1 }): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		character.wantsToJump = true;
		character.initJumpSpeed = args.initJumpSpeed;
	}

	export const findVehicleToEnter: Behavior = (entity, args: { wantsToDrive: boolean }): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
        const characterTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any)
		// reusable world position variable
		let worldPos = new Vector3();

		// Find best vehicle
		let vehicleFinder = new ClosestObjectFinder<Vehicle>(characterTransform.position, 10);
		Engine.vehicles.forEach((vehicle) =>
		{
			vehicleFinder.consider(vehicle, vehicle.position);
		});

		if (vehicleFinder.closestObject !== undefined)
		{
			let vehicle = vehicleFinder.closestObject;
			let vehicleEntryInstance = new VehicleEntryInstance(character);
			vehicleEntryInstance.wantsToDrive = args.wantsToDrive;

			// Find best seat
			let seatFinder = new ClosestObjectFinder<VehicleSeat>(characterTransform.position);
			for (const seat of vehicle.seats)
			{
				if (args.wantsToDrive)
				{
					// Consider driver seats
					if (seat.type === SeatType.Driver)
					{
						seat.seatPointObject.getWorldPosition(worldPos);
						seatFinder.consider(seat, worldPos);
					}
					// Consider passenger seats connected to driver seats
					else if (seat.type === SeatType.Passenger)
					{
						for (const connSeat of seat.connectedSeats)
						{
							if (connSeat.type === SeatType.Driver)
							{
								seat.seatPointObject.getWorldPosition(worldPos);
								seatFinder.consider(seat, worldPos);
								break;
							}
						}
					}
				}
				else
				{
					// Consider passenger seats
					if (seat.type === SeatType.Passenger)
					{
						seat.seatPointObject.getWorldPosition(worldPos);
						seatFinder.consider(seat, worldPos);
					}
				}
			}

			if (seatFinder.closestObject !== undefined)
			{
				let targetSeat = seatFinder.closestObject;
				vehicleEntryInstance.targetSeat = targetSeat;

				let entryPointFinder = new ClosestObjectFinder<Object3D>(character.position);

				for (const point of targetSeat.entryPoints) {
					point.getWorldPosition(worldPos);
					entryPointFinder.consider(point, worldPos);
				}

				if (entryPointFinder.closestObject !== undefined)
				{
					vehicleEntryInstance.entryPoint = entryPointFinder.closestObject;
					// triggerAction('up', true);
					character.vehicleEntryInstance = vehicleEntryInstance;
				}
			}
		}
	}

	export const enterVehicle: Behavior = (entity, args: { seat: VehicleSeat, entryPoint: Object3D }): void =>
	{
        const character: CharacterComponent =  getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		if (args.seat.door?.rotation < 0.5)
		{
			setState(entity, { state: new OpenVehicleDoor(character, seat, entryPoint) });
		}
		else
		{
			character.setState(new EnteringVehicle(character, seat, entryPoint));
		}
	}

	export const teleportToVehicle: Behavior = (entity: Entity, args: { vehicle: Vehicle, seat: VehicleSeat }): void =>
	{
		character.resetVelocity();
		character.rotateModel();
		character.setPhysicsEnabled(false);
		(vehicle as unknown as Object3D).attach(character);

		character.setPosition(seat.seatPointObject.position.x, seat.seatPointObject.position.y + 0.6, seat.seatPointObject.position.z);
		character.quaternion.copy(seat.seatPointObject.quaternion);

		character.occupySeat(seat);
		character.setState(new Driving(character, seat));

		character.startControllingVehicle(vehicle, seat);
	}

	export const startControllingVehicle: Behavior = (entity, args: { vehicle: IControllable, seat: VehicleSeat }): void =>
	{
		if (character.controlledObject !== vehicle)
		{
			character.transferControls(vehicle);
			character.resetControls();
	
			character.controlledObject = vehicle;
			character.controlledObject.allowSleep(false);
			vehicle.inputReceiverInit();
	
			vehicle.controllingconst character: CharacterComponent =  character;
		}
	}

    // TODO: Replace  me, this icontrollable is not the same...
	export const transferControls: Behavior = (entity: IControllable): void =>
	{
		// Currently running through all actions of character character and the vehicle,
		// comparing keycodes of actions and based on that triggering vehicle's actions
		// Maybe we should ask input manager what's the current state of the keyboard
		// and read those values... TODO
		for (const action1 in character.actions) {
			if (character.actions.hasOwnProperty(action1)) {
				for (const action2 in entity.actions) {
					if (entity.actions.hasOwnProperty(action2)) {

						let a1 = character.actions[action1];
						let a2 = entity.actions[action2];

						a1.eventCodes.forEach((code1) => {
							a2.eventCodes.forEach((code2) => {
								if (code1 === code2)
								{
									entity.triggerAction(action2, a1.isPressed);
								}
							});
						});
					}
				}
			}
		}
	}

	export const stopControllingVehicle: Behavior = (entity: Entity): void =>
	{
		if (character.controlledObject?.controllingconst character: CharacterComponent = == character)
		{
			character.controlledObject.allowSleep(true);
			character.controlledObject.controllingconst character: CharacterComponent =  undefined;
			character.controlledObject.resetControls();
			character.controlledObject = undefined;
			character.inputReceiverInit();
		}
	}

	export const exitVehicle: Behavior(entity: Entity): void =>
	{
		if (character.occupyingSeat !== null)
		{
			if (character.occupyingSeat.vehicle.entityType === EntityType.Airplane)
			{
				character.setState(new ExitingAirplane(character, character.occupyingSeat));
			}
			else
			{
				character.setState(new ExitingVehicle(character, character.occupyingSeat));
			}
			
			character.stopControllingVehicle();
		}
	}

	export const occupySeat: Behavior = (entity, args: { seat: VehicleSeat} ): void =>
	{
		character.occupyingSeat = seat;
		seat.occupiedBy = character;
	}

	export const leaveSeat(): void =>
	{
		if (character.occupyingSeat !== null)
		{
			character.occupyingSeat.occupiedBy = null;
			character.occupyingSeat = null;
		}
	}

	export const physicsPreStep: Behavior = (entity, args: { body: Body, character: Character }): void =>
	{
		character.feetRaycast();

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
		// Player ray casting
		// Create ray
		let body = character.characterCapsule.body;
		const start = new Vec3(body.position.x, body.position.y, body.position.z);
		const end = new Vec3(body.position.x, body.position.y - character.rayCastLength - character.raySafeOffset, body.position.z);
		// Raycast options
		const rayCastOptions = {
			collisionFilterMask: CollisionGroups.Default,
			skipBackfaces: true      /* ignore back faces */
		};
		// Cast the ray
		character.rayHasHit = character.world.physicsWorld.raycastClosest(start, end, rayCastOptions, character.rayResult);
	}

	export const physicsPostStep: Behavior = (entity, args: { body: Body, character: Character }): void =>
	{
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
			body.position.y = character.rayResult.hitPointWorld.y + character.rayCastLength + (newVelocity.y / character.world.physicsFrameRate);
		}
		else
		{
			// If we're in air
			body.velocity.x = newVelocity.x;
			body.velocity.y = newVelocity.y;
			body.velocity.z = newVelocity.z;

			// Save last in-air information
			character.groundImpactData.velocity.x = body.velocity.x;
			character.groundImpactData.velocity.y = body.velocity.y;
			character.groundImpactData.velocity.z = body.velocity.z;
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
			// Register physics
			PhysicsWorld.instance.physicsWorld.addBody(character.characterCapsule.body);

			// Add to graphicsWorld
			Engine.scene.add(character);
			Engine.scene.add(character.raycastBox);

			// Shadow cascades
			character.materials.forEach((mat) =>
			{
				Engine.csm.setupMaterial(mat);
			});
	}

	export const removeFromWorld: Behavior = (entity: Entity): void =>
	{
			// Remove physics
			PhysicsWorld.instance.physicsWorld.remove(character.characterCapsule.body);

			// Remove visuals
			Engine.scene.remove(character);
			Engine.scene.remove(character.raycastBox);
	}
}