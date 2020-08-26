import { Behavior } from "../../../common/interfaces/Behavior";
import { ActorComponent } from "../components/ActorComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const springMovement: Behavior = (entity, args: { timeStep: number; }): void => {
	const actor: ActorComponent = getMutableComponent<ActorComponent>(entity, ActorComponent as any);

	// Simulator
	actor.velocitySimulator.target.copy(actor.velocityTarget);
	actor.velocitySimulator.simulate(args.timeStep);

	// Update values
	actor.velocity.copy(actor.velocitySimulator.position);
	actor.acceleration.copy(actor.velocitySimulator.velocity);
};
