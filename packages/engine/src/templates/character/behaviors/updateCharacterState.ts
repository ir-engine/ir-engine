import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { getMutableComponent, getComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { setCameraRelativeOrientationTarget } from "./setCameraRelativeOrientationTarget";

export const updateCharacterState: Behavior = (entity, args: { setCameraRelativeOrientationTarget?: boolean }, deltaTime: number): void => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return;
	actor.timer += deltaTime;
	if (args.setCameraRelativeOrientationTarget)
		setCameraRelativeOrientationTarget(entity);
};
