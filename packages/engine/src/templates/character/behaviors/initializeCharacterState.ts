import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getMutableComponent, getComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { setArcadeVelocityInfluence } from "./setArcadeVelocityInfluence";
import { State } from "../../../state/components/State";
import { sendMessage } from "../../../networking/functions/sendMessage";
import { MessageChannel } from "../../../networking/enums/MessageChannel";
import { MessageTypes } from "../../../networking/enums/MessageTypes";

export const initializeCharacterState: Behavior = (entity: Entity) => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return console.log("Returning on init but might want to handle")
	console.log("Entering state: ", getComponent(entity, State).data.keys())

	// Pack message
	
	// Send it

	// sendMessage(MessageChannel.Unreliable, 0)
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
