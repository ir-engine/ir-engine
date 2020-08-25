import { ICharacterState } from "../classes/interfaces/ICharacterState";
import { Behavior } from "../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/Character";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
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
import { getForward, setupMeshProperties } from "../classes/core/FunctionLibrary";
import { Object3DComponent } from "../../common/components/Object3DComponent";
import { Engine } from "../../ecs/classes/Engine";
import { PhysicsWorld } from "../../physics/components/PhysicsWorld";

    let character: CharacterComponent
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
        character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
			character.characterCapsule.body.previousPosition = new Vec3(args.x, args.y, args.z);
			character.characterCapsule.body.position = new Vec3(args.x, args.y, args.z);
			character.characterCapsule.body.interpolatedPosition = new Vec3(args.x, args.y, args.z);
	}

	export const resetVelocity: Behavior (entity): void =>
	{
        character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
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
        character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
		character.velocityTarget.z = args.velZ;
		character.velocityTarget.x = args.velX;
		character.velocityTarget.y = args.velY;
	}

	export const setOrientation: Behavior = (entity, args: { vector: Vector3, instantly: boolean = false }): void =>
	{
        character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

        let lookVector = new Vector3().copy(args.vector).setY(0).normalize();
        
		character.orientationTarget.copy(lookVector);
		
		if (args.instantly)
		{
			character.orientation.copy(lookVector);
		}
	}

	export const resetOrientation: Behavior = (entity): void =>
	{
        character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)
        const characterObject3D = getMutableComponent<Object3DComponent>(entity, Object3DComponent).value
		const forward = getForward(characterObject3D);
		setOrientation(entity, { forward, true });
	}
	export const setPhysicsEnabled: Behavior = (entity, args: { value: boolean }): void {
        character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		character.physicsEnabled = args.value;

		if (args.value === true)
		{
			PhysicsWorld.physicsWorld.addBody(character.characterCapsule.body);
		}
		else
		{
			PhysicsWorld.physicsWorld.remove(character.characterCapsule.body);
		}
	}

	export const readCharacterData(entity, args: { model: any }): void =>
	{
        character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

        // TODO: This will only work with glb
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

	export const takeControl: Behavior = (): void =>
	{
        // TODO: Attach local player input receiver
        console.log("Local player should get input receiver tag here")
	}

	export const update: Behavior = (entity, args: {timeStep: number}): void =>
	{
        character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any)

		character.behaviour?.update(timeStep);
		character.vehicleEntryInstance?.update(timeStep);
		// console.log(this.occupyingSeat);
		character.charState?.update(timeStep);

		// this.visuals.position.copy(this.modelOffset);
		if (character.physicsEnabled) character.springMovement(timeStep);
		if (character.physicsEnabled) character.springRotation(timeStep);
		if (character.physicsEnabled) character.rotateModel();
		if (character.mixer !== undefined) character.mixer.update(timeStep);

		// Sync physics/graphics
		if (this.physicsEnabled)
		{
			this.position.set(
				this.characterCapsule.body.interpolatedPosition.x,
				this.characterCapsule.body.interpolatedPosition.y,
				this.characterCapsule.body.interpolatedPosition.z
			);
		}
		else {
			let newPos = new Vector3();
			this.getWorldPosition(newPos);

			this.characterCapsule.body.position.copy(Utils.cannonVector(newPos));
			this.characterCapsule.body.interpolatedPosition.copy(Utils.cannonVector(newPos));
		}
	}

	export const inputReceiverInit(): void =>
	{
		if (this.controlledObject !== undefined)
		{
			this.controlledObject.inputReceiverInit();
			return;
		}

		this.world.cameraOperator.setRadius(1.6, true);
		this.world.cameraOperator.followMode = false;
		// this.world.dirLight.target = this;

		this.displayControls();
	}

	export const displayControls(): void =>
	{
		this.world.updateControls([
			{
				keys: ['W', 'A', 'S', 'D'],
				desc: 'Movement'
			},
			{
				keys: ['Shift'],
				desc: 'Sprint'
			},
			{
				keys: ['Space'],
				desc: 'Jump'
			},
			{
				keys: ['F', 'or', 'G'],
				desc: 'Enter vehicle'
			},
			{
				keys: ['Shift', '+', 'R'],
				desc: 'Respawn'
			},
			{
				keys: ['Shift', '+', 'C'],
				desc: 'Free camera'
			},
		]);
	}

	export const inputReceiverUpdate(timeStep: number): void =>
	{
		if (this.controlledObject !== undefined)
		{
			this.controlledObject.inputReceiverUpdate(timeStep);
		}
		else
		{
			// Look in camera's direction
			this.viewVector = new Vector3().subVectors(this.position, this.world.camera.position);

			this.updateMatrixWorld();
			if (this.vehicleEntryInstance !== null) (this.vehicleEntryInstance.targetSeat.vehicle as unknown as Object3D).updateMatrixWorld();
			else if (this.occupyingSeat !== null) (this.occupyingSeat.vehicle as unknown as Object3D).updateMatrixWorld();

			this.getWorldPosition(this.world.cameraOperator.target);
		}
		
	}

	export const setAnimation(clipName: string, fadeIn: number): number
	{
		if (this.mixer !== undefined)
		{
			// gltf
			let clip = AnimationClip.findByName( this.animations, clipName );

			let action = this.mixer.clipAction(clip);
			if (action === null)
			{
				console.error(`Animation ${clipName} not found!`);
				return 0;
			}

			this.mixer.stopAllAction();
			action.fadeIn(fadeIn);
			action.play();

			return action.getClip().duration;
		}
	}

	export const springMovement(timeStep: number): void =>
	{
		// Simulator
		this.velocitySimulator.target.copy(this.velocityTarget);
		this.velocitySimulator.simulate(timeStep);

		// Update values
		this.velocity.copy(this.velocitySimulator.position);
		this.acceleration.copy(this.velocitySimulator.velocity);
	}

	export const springRotation(timeStep: number): void =>
	{
		// Spring rotation
		// Figure out angle between current and target orientation
		let angle = Utils.getSignedAngleBetweenVectors(this.orientation, this.orientationTarget);

		// Simulator
		this.rotationSimulator.target = angle;
		this.rotationSimulator.simulate(timeStep);
		let rot = this.rotationSimulator.position;

		// Updating values
		this.orientation.applyAxisAngle(new Vector3(0, 1, 0), rot);
		this.angularVelocity = this.rotationSimulator.velocity;
	}

	export const getLocalMovementDirection(): Vector3
	{
		const positiveX = this.actions.right.isPressed ? -1 : 0;
		const negativeX = this.actions.left.isPressed ? 1 : 0;
		const positiveZ = this.actions.up.isPressed ? 1 : 0;
		const negativeZ = this.actions.down.isPressed ? -1 : 0;

		return new Vector3(positiveX + negativeX, 0, positiveZ + negativeZ).normalize();
	}

	export const getCameraRelativeMovementVector(): Vector3
	{
		const localDirection = this.getLocalMovementDirection();
		const flatViewVector = new Vector3(this.viewVector.x, 0, this.viewVector.z).normalize();

		return Utils.appplyVectorMatrixXZ(flatViewVector, localDirection);
	}

	export const setCameraRelativeOrientationTarget(): void =>
	{
		if (this.vehicleEntryInstance === null)
		{
			let moveVector = this.getCameraRelativeMovementVector();
	
			if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0)
			{
				this.setOrientation(this.orientation);
			}
			else
			{
				this.setOrientation(moveVector);
			}
		}
	}

	export const rotateModel(): void =>
	{
		this.lookAt(this.position.x + this.orientation.x, this.position.y + this.orientation.y, this.position.z + this.orientation.z);
		this.tiltContainer.rotation.z = (-this.angularVelocity * 2.3 * this.velocity.length());
		this.tiltContainer.position.setY((Math.cos(Math.abs(this.angularVelocity * 2.3 * this.velocity.length())) / 2) - 0.5);
	}

	export const jump(initJumpSpeed: number = -1): void =>
	{
		this.wantsToJump = true;
		this.initJumpSpeed = initJumpSpeed;
	}

	export const findVehicleToEnter(wantsToDrive: boolean): void =>
	{
		// reusable world position variable
		let worldPos = new Vector3();

		// Find best vehicle
		let vehicleFinder = new ClosestObjectFinder<Vehicle>(this.position, 10);
		this.world.vehicles.forEach((vehicle) =>
		{
			vehicleFinder.consider(vehicle, vehicle.position);
		});

		if (vehicleFinder.closestObject !== undefined)
		{
			let vehicle = vehicleFinder.closestObject;
			let vehicleEntryInstance = new VehicleEntryInstance(this);
			vehicleEntryInstance.wantsToDrive = wantsToDrive;

			// Find best seat
			let seatFinder = new ClosestObjectFinder<VehicleSeat>(this.position);
			for (const seat of vehicle.seats)
			{
				if (wantsToDrive)
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

				let entryPointFinder = new ClosestObjectFinder<Object3D>(this.position);

				for (const point of targetSeat.entryPoints) {
					point.getWorldPosition(worldPos);
					entryPointFinder.consider(point, worldPos);
				}

				if (entryPointFinder.closestObject !== undefined)
				{
					vehicleEntryInstance.entryPoint = entryPointFinder.closestObject;
					this.triggerAction('up', true);
					this.vehicleEntryInstance = vehicleEntryInstance;
				}
			}
		}
	}

	export const enterVehicle(seat: VehicleSeat, entryPoint: Object3D): void =>
	{
		this.resetControls();

		if (seat.door?.rotation < 0.5)
		{
			this.setState(new OpenVehicleDoor(this, seat, entryPoint));
		}
		else
		{
			this.setState(new EnteringVehicle(this, seat, entryPoint));
		}
	}

	export const teleportToVehicle(vehicle: Vehicle, seat: VehicleSeat): void =>
	{
		this.resetVelocity();
		this.rotateModel();
		this.setPhysicsEnabled(false);
		(vehicle as unknown as Object3D).attach(this);

		this.setPosition(seat.seatPointObject.position.x, seat.seatPointObject.position.y + 0.6, seat.seatPointObject.position.z);
		this.quaternion.copy(seat.seatPointObject.quaternion);

		this.occupySeat(seat);
		this.setState(new Driving(this, seat));

		this.startControllingVehicle(vehicle, seat);
	}

	export const startControllingVehicle(vehicle: IControllable, seat: VehicleSeat): void =>
	{
		if (this.controlledObject !== vehicle)
		{
			this.transferControls(vehicle);
			this.resetControls();
	
			this.controlledObject = vehicle;
			this.controlledObject.allowSleep(false);
			vehicle.inputReceiverInit();
	
			vehicle.controllingCharacter = this;
		}
	}

	export const transferControls(entity: IControllable): void =>
	{
		// Currently running through all actions of this character and the vehicle,
		// comparing keycodes of actions and based on that triggering vehicle's actions
		// Maybe we should ask input manager what's the current state of the keyboard
		// and read those values... TODO
		for (const action1 in this.actions) {
			if (this.actions.hasOwnProperty(action1)) {
				for (const action2 in entity.actions) {
					if (entity.actions.hasOwnProperty(action2)) {

						let a1 = this.actions[action1];
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

	export const stopControllingVehicle(): void =>
	{
		if (this.controlledObject?.controllingCharacter === this)
		{
			this.controlledObject.allowSleep(true);
			this.controlledObject.controllingCharacter = undefined;
			this.controlledObject.resetControls();
			this.controlledObject = undefined;
			this.inputReceiverInit();
		}
	}

	export const exitVehicle(): void =>
	{
		if (this.occupyingSeat !== null)
		{
			if (this.occupyingSeat.vehicle.entityType === EntityType.Airplane)
			{
				this.setState(new ExitingAirplane(this, this.occupyingSeat));
			}
			else
			{
				this.setState(new ExitingVehicle(this, this.occupyingSeat));
			}
			
			this.stopControllingVehicle();
		}
	}

	export const occupySeat(seat: VehicleSeat): void =>
	{
		this.occupyingSeat = seat;
		seat.occupiedBy = this;
	}

	export const leaveSeat(): void =>
	{
		if (this.occupyingSeat !== null)
		{
			this.occupyingSeat.occupiedBy = null;
			this.occupyingSeat = null;
		}
	}

	export const physicsPreStep(body: Body, character: Character): void =>
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

	export const feetRaycast(): void =>
	{
		// Player ray casting
		// Create ray
		let body = this.characterCapsule.body;
		const start = new Vec3(body.position.x, body.position.y, body.position.z);
		const end = new Vec3(body.position.x, body.position.y - this.rayCastLength - this.raySafeOffset, body.position.z);
		// Raycast options
		const rayCastOptions = {
			collisionFilterMask: CollisionGroups.Default,
			skipBackfaces: true      /* ignore back faces */
		};
		// Cast the ray
		this.rayHasHit = this.world.physicsWorld.raycastClosest(start, end, rayCastOptions, this.rayResult);
	}

	export const physicsPostStep(body: Body, character: Character): void =>
	{
		// Get velocities
		let simulatedVelocity = new Vector3(body.velocity.x, body.velocity.y, body.velocity.z);

		// Take local velocity
		let arcadeVelocity = new Vector3().copy(character.velocity).multiplyScalar(character.moveSpeed);
		// Turn local into global
		arcadeVelocity = Utils.appplyVectorMatrixXZ(character.orientation, arcadeVelocity);

		let newVelocity = new Vector3();

		// Additive velocity mode
		if (character.arcadeVelocityIsAdditive)
		{
			newVelocity.copy(simulatedVelocity);

			let globalVelocityTarget = Utils.appplyVectorMatrixXZ(character.orientation, character.velocityTarget);
			let add = new Vector3().copy(arcadeVelocity).multiply(character.arcadeVelocityInfluence);

			if (Math.abs(simulatedVelocity.x) < Math.abs(globalVelocityTarget.x * character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) { newVelocity.x += add.x; }
			if (Math.abs(simulatedVelocity.y) < Math.abs(globalVelocityTarget.y * character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) { newVelocity.y += add.y; }
			if (Math.abs(simulatedVelocity.z) < Math.abs(globalVelocityTarget.z * character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) { newVelocity.z += add.z; }
		}
		else
		{
			newVelocity = new Vector3(
				MathUtils.lerp(simulatedVelocity.x, arcadeVelocity.x, character.arcadeVelocityInfluence.x),
				MathUtils.lerp(simulatedVelocity.y, arcadeVelocity.y, character.arcadeVelocityInfluence.y),
				MathUtils.lerp(simulatedVelocity.z, arcadeVelocity.z, character.arcadeVelocityInfluence.z),
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
				newVelocity.add(Utils.threeVector(pointVelocity));
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
				body.velocity = Utils.cannonVector(character.orientation.clone().multiplyScalar(speed));
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

	export const addToWorld(world: World): void =>
	{
		if (_.includes(world.characters, this))
		{
			console.warn('Adding character to a world in which it already exists.');
		}
		else
		{
			// Set world
			this.world = world;

			// Register character
			world.characters.push(this);

			// Register physics
			world.physicsWorld.addBody(this.characterCapsule.body);

			// Add to graphicsWorld
			world.graphicsWorld.add(this);
			world.graphicsWorld.add(this.raycastBox);

			// Shadow cascades
			this.materials.forEach((mat) =>
			{
				world.csm.setupMaterial(mat);
			});
		}
	}

	export const removeFromWorld(world: World): void =>
	{
		if (!_.includes(world.characters, this))
		{
			console.warn('Removing character from a world in which it isn\'t present.');
		}
		else
		{
			if (world.inputManager.inputReceiver === this)
			{
				world.inputManager.inputReceiver = undefined;
			}

			this.world = undefined;

			// Remove from characters
			_.pull(world.characters, this);

			// Remove physics
			world.physicsWorld.remove(this.characterCapsule.body);

			// Remove visuals
			world.graphicsWorld.remove(this);
			world.graphicsWorld.remove(this.raycastBox);
		}
	}
}