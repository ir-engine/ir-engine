import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../components/CharacterComponent';

export const initializeCharacterState: Behavior = (entity, args: { x?: number, y?: number, z?: number }) => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (!actor.initialized) return;
	if (actor.velocitySimulator === undefined) {
		actor.velocitySimulator.init();
	}
		
		console.log(actor.mixer);
		console.log("Actor mixer is")
	actor.velocitySimulator.damping = actor.defaultVelocitySimulatorDamping;
	actor.velocitySimulator.mass = actor.defaultVelocitySimulatorMass;

	actor.rotationSimulator.damping = actor.defaultRotationSimulatorDamping;
	actor.rotationSimulator.mass = actor.defaultRotationSimulatorMass;

	actor.canFindVehiclesToEnter = true;
	actor.canEnterVehicles = false;
	actor.canLeaveVehicles = true;

	actor.arcadeVelocityIsAdditive = false;
	actor.arcadeVelocityInfluence.set(1, 0, 1);

	actor.timer = 0;
	actor.velocityTarget.z = args?.z ?? 0;
	actor.velocityTarget.x = args?.x ?? 0;
	actor.velocityTarget.y = args?.y ?? 0;
};