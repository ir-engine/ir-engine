import { CharacterComponent } from "../components/CharacterComponent";
import { Behavior } from "../../../common/interfaces/Behavior";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";

export const jumpStart: Behavior = (entity, args: { initJumpSpeed: number }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.wantsToJump = true;
	actor.initJumpSpeed = args.initJumpSpeed;
};
