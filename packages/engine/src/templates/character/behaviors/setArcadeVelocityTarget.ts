import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const setArcadeVelocityTarget: Behavior = (entity, args: { velZ: number; velX: number; velY: number; }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.velocityTarget.z = args.velZ;
	actor.velocityTarget.x = args.velX;
	actor.velocityTarget.y = args.velY;
};
