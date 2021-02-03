import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const setArcadeVelocityTarget: Behavior = (entity, args: { z?: number; x?: number; y?: number }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.velocityTarget.z = args.z ?? 0;
	actor.velocityTarget.x = args.x ?? 0;
	actor.velocityTarget.y = args.y ?? 0;
};
