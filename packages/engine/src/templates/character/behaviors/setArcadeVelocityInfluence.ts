import { Behavior } from "../../../common/interfaces/Behavior";
import { ActorComponent } from "../components/ActorComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const setArcadeVelocityInfluence: Behavior = (entity, args: { x: number; y: number; z: number; }): void => {
	getMutableComponent<ActorComponent>(entity, ActorComponent as any).arcadeVelocityInfluence.set(args.x, args.y, args.z);
};
