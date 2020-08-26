import { Behavior } from "../../../common/interfaces/Behavior";
import { ActorComponent } from "../components/ActorComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const setArcadeVelocityTarget: Behavior = (entity, args: { velZ: number; velX: number; velY: number; }): void => {
	const actor: ActorComponent = getMutableComponent<ActorComponent>(entity, ActorComponent as any);
	actor.velocityTarget.z = args.velZ;
	actor.velocityTarget.x = args.velX;
	actor.velocityTarget.y = args.velY;
};
