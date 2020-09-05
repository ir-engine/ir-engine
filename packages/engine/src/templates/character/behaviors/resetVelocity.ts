import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Entity } from "../../../ecs/classes/Entity";

export const resetVelocity: Behavior = (entity: Entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.velocity.x = 0;
	actor.velocity.y = 0;
	actor.velocity.z = 0;

	actor.actorCapsule.body.velocity.x = 0;
	actor.actorCapsule.body.velocity.y = 0;
	actor.actorCapsule.body.velocity.z = 0;

	actor.velocitySimulator.init();
};
