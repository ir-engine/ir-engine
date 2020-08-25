import { Behavior } from "../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent, getComponent } from "../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";
import { Vec3 } from "cannon-es";
import { getForward, getSignedAngleBetweenVectors, appplyVectorMatrixXZ } from "../classes/core/CharacterFunctions";
import { Object3DComponent } from "../../common/components/Object3DComponent";
import { Entity } from "../../ecs/classes/Entity";
import { TransformComponent } from "../../transform/components/TransformComponent";

export const setArcadeVelocityInfluence: Behavior = (entity, args: { x: number; y: number; z: number; }): void => {
    getMutableComponent<CharacterComponent>(entity, CharacterComponent as any).arcadeVelocityInfluence.set(args.x, args.y, args.z);
};

export const setViewVector: Behavior = (entity, args: { vector: Vector3; }): void => {
    getMutableComponent<CharacterComponent>(entity, CharacterComponent as any).viewVector.copy(args.vector).normalize();
};

export const setPosition: Behavior = (entity, args: { x: number; y: number; z: number; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    character.characterCapsule.body.previousPosition = new Vec3(args.x, args.y, args.z);
    character.characterCapsule.body.position = new Vec3(args.x, args.y, args.z);
    character.characterCapsule.body.interpolatedPosition = new Vec3(args.x, args.y, args.z);
};

export const resetVelocity: Behavior = (entity: Entity): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    character.velocity.x = 0;
    character.velocity.y = 0;
    character.velocity.z = 0;

    character.characterCapsule.body.velocity.x = 0;
    character.characterCapsule.body.velocity.y = 0;
    character.characterCapsule.body.velocity.z = 0;

    character.velocitySimulator.init();
};

export const setArcadeVelocityTarget: Behavior = (entity, args: { velZ: number; velX: number; velY: number; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    character.velocityTarget.z = args.velZ;
    character.velocityTarget.x = args.velX;
    character.velocityTarget.y = args.velY;
};

export const setOrientation: Behavior = (entity, args: { vector: Vector3; instantly?: boolean; }): void => {
    const character: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

    let lookVector = new Vector3().copy(args.vector).setY(0).normalize();

    character.orientationTarget.copy(lookVector);

    if (args.instantly) {
        character.orientation.copy(lookVector);
    }
};

export const resetOrientation: Behavior = (entity: Entity): void => {
    const characterObject3D: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent);
    const forward = getForward(characterObject3D.value);
    setOrientation(entity, { vector: forward, instantly: true });
};

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