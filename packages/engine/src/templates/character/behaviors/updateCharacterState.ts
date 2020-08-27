import { Behavior } from "../../../common/interfaces/Behavior";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { setCameraRelativeOrientationTarget } from "./setCameraRelativeOrientationTarget";

export const updateCharacterState: Behavior = (entity, args: { setCameraRelativeOrientationTarget?: boolean; }, deltaTime: number): void => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	console.log("updateCharacterState called")
	if(!actor.initialized) return;
	actor.timer += deltaTime;
	if (args.setCameraRelativeOrientationTarget)
		setCameraRelativeOrientationTarget(entity);
};
