import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const setArcadeVelocityTarget: Behavior = (entity, args: { z: number; x: number; y: number; }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.velocityTarget.z = args.z;
	actor.velocityTarget.x = args.x;
	actor.velocityTarget.y = args.y;
};
