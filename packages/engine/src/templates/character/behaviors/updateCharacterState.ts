import { Behavior } from "../../../common/interfaces/Behavior";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { ActorComponent } from "../components/ActorComponent";
import { setCameraRelativeOrientationTarget } from "./setCameraRelativeOrientationTarget";

export const updateCharacterState: Behavior = (entity, args: { setCameraRelativeOrientationTarget?: boolean; }, deltaTime: number): void => {
	const actor = getMutableComponent<ActorComponent>(entity, ActorComponent as any);
	actor.timer += deltaTime;
	if (args.setCameraRelativeOrientationTarget)
		setCameraRelativeOrientationTarget(entity);
};
