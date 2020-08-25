import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../../character/components/CharacterComponent";
import { setArcadeVelocityInfluence, setCameraRelativeOrientationTarget } from "../../../character/behaviors/CharacterMovementBehaviors";

export const initializeCharacterState: Behavior = (entity: Entity) => {
	const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	character.velocitySimulator.damping = character.defaultVelocitySimulatorDamping;
	character.velocitySimulator.mass = character.defaultVelocitySimulatorMass;

	character.rotationSimulator.damping = character.defaultRotationSimulatorDamping;
	character.rotationSimulator.mass = character.defaultRotationSimulatorMass;

	character.canFindVehiclesToEnter = true;
	character.canEnterVehicles = false;
	character.canLeaveVehicles = true;

	character.arcadeVelocityIsAdditive = false;
	setArcadeVelocityInfluence(entity, { x: 1, y: 0, z: 1 });
	character.timer = 0
};

export const updateCharacterState: Behavior = (entity, args: { setCameraRelativeOrientationTarget?: boolean }, deltaTime: number): void => {
	const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	character.timer += deltaTime;
	if(args.setCameraRelativeOrientationTarget) setCameraRelativeOrientationTarget(entity)
};
