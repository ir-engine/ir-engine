import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from "../components/CharacterComponent";
import { setDropState } from "./setDropState";
import { jumpStart } from "./jumpStart";
import { onAnimationEnded } from "./onAnimationEnded";
import { setCameraRelativeOrientationTarget } from "./setCameraRelativeOrientationTarget";
import { setTargetVelocityIfMoving } from "./setTargetVelocityIfMoving";

export const jumpRunning: Behavior = (entity: Entity, args: null, delta: any): void => {
	const transform = getComponent<TransformComponent>(entity, TransformComponent);
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	setCameraRelativeOrientationTarget(entity);

	// Move in air
	if (actor.alreadyJumped) {
		// const targetMovingVelocity = actor.velocityTarget.clone().setY(0.8)
		// setTargetVelocityIfMoving(entity, { ifTrue: targetMovingVelocity, ifFalse: { x: 0, y: 0, z: 0 } });
		// setTargetVelocityIfMoving(entity, { ifTrue: { x: 0.8, y: 0.8, z: 0.8 }, ifFalse: { x: 0, y: 0, z: 0 } });
	}

	// Physically jump
	if (actor.timer > 0.13 && !actor.alreadyJumped) {
		jumpStart(entity, { initJumpSpeed: 1 });
		actor.alreadyJumped = true;
		actor.rotationSimulator.damping = 0.3;
		actor.arcadeVelocityIsAdditive = true;

		// const jumpArcadeVelocity = actor.velocity.clone().setY(1).normalize()
		// actor.arcadeVelocityInfluence.set(0.0, 0.0, 0.0);

	}
	else if (actor.timer > 0.24) {
		setDropState(entity, null, delta);
	}
	/*
	else
		onAnimationEnded(entity, { transitionToState: CharacterStateTypes.FALLING }, delta);
*/
};
