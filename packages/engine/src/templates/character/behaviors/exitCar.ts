import { CharacterComponent } from "../components/CharacterComponent";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getMutableComponent, getComponent } from "../../../ecs/functions/EntityFunctions";
import { setCameraRelativeOrientationTarget } from "./setCameraRelativeOrientationTarget";
import { setTargetVelocityIfMoving } from "./setTargetVelocityIfMoving";
import { setDropState } from "./setDropState";
import { onAnimationEnded } from "./onAnimationEnded";
import { FallingState } from "../states/FallingState";
import { jumpStart } from "./jumpStart";
import { CharacterStateTypes } from "../CharacterStateTypes";

export const exitCar: Behavior = (entity: Entity, args: null, delta: any): void => {
//	const transform = getComponent<TransformComponent>(entity, TransformComponent);
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	if (actor.timer > 2.1 ) {
		setDropState(entity, null, delta);
	}
};
