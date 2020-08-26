import { ActorComponent } from "../components/ActorComponent";
import { Behavior } from "../../../common/interfaces/Behavior";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const jumpStart: Behavior = (entity, args: { initJumpSpeed: number; }): void => {
	const actor: ActorComponent = getMutableComponent<ActorComponent>(entity, ActorComponent as any);
	actor.wantsToJump = true;
	actor.initJumpSpeed = args.initJumpSpeed;
};
