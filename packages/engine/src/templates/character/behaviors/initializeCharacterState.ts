import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { setArcadeVelocityInfluence } from "./setArcadeVelocityInfluence";

export const initializeCharacterState: Behavior = (entity: Entity) => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	// TODO: Replace with characterinitialized component
	if(!actor.initialized) return;
	if(actor.velocitySimulator === undefined){
		actor.velocitySimulator.init();
	}
	actor.velocitySimulator.damping = actor.defaultVelocitySimulatorDamping;
	actor.velocitySimulator.mass = actor.defaultVelocitySimulatorMass;

	actor.rotationSimulator.damping = actor.defaultRotationSimulatorDamping;
	actor.rotationSimulator.mass = actor.defaultRotationSimulatorMass;

	actor.canFindVehiclesToEnter = true;
	actor.canEnterVehicles = false;
	actor.canLeaveVehicles = true;

	actor.arcadeVelocityIsAdditive = false;
	setArcadeVelocityInfluence(entity, { x: 1, y: 0, z: 1 });
	actor.timer = 0;
};
