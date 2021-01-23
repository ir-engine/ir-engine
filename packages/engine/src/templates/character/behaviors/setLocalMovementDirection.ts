import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const setLocalMovementDirection: Behavior = (entity, args: { z?: number; x?: number; y?: number }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.localMovementDirection.z = args.z ?? actor.localMovementDirection.z;
	actor.localMovementDirection.x = args.x ?? actor.localMovementDirection.x;
	actor.localMovementDirection.y = args.y ?? actor.localMovementDirection.y;
	actor.localMovementDirection.normalize();
};
