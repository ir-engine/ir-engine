import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const springMovement: Behavior = (entity, args: { timeStep: number; }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	// Simulator
	actor.velocitySimulator.target.copy(actor.velocityTarget);
	actor.velocitySimulator.simulate(args.timeStep);

	// Update values
	actor.velocity.copy(actor.velocitySimulator.position);
	actor.acceleration.copy(actor.velocitySimulator.velocity);
};
