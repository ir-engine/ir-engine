import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const springMovement: Behavior = (entity, args= null, deltaTime): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	// Simulator
	actor.velocitySimulator.target.copy(actor.velocityTarget);
	actor.velocitySimulator.simulate(deltaTime);

	// Update values
	actor.velocity.copy(actor.velocitySimulator.position);
	actor.acceleration.copy(actor.velocitySimulator.velocity);
};
