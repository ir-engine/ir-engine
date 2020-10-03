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
import { addState } from '../../../state/behaviors/StateBehaviors';

export const jumpIdle: Behavior = (entity: Entity, args: null, delta: any): void => {
	const transform = getComponent<TransformComponent>(entity, TransformComponent);
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	// Move in air
	if (actor.alreadyJumped) {
		setCameraRelativeOrientationTarget(entity);
		setTargetVelocityIfMoving(entity, { ifTrue: { x: 0.8, y: 0.8, z: 0.8 }, ifFalse: { x: 0, y: 0, z: 0 } });
	}

	// Physically jump
	if (actor.timer > 0.6 && !actor.alreadyJumped) {
		jumpStart(entity, { initJumpSpeed: -1 });
		actor.alreadyJumped = true;

		actor.velocitySimulator.mass = 100;
		actor.rotationSimulator.damping = 0.3;

		if (actor.rayResult.body.velocity.length() > 0) {
			actor.arcadeVelocityInfluence.set(0, 0, 0);
		} else {
			actor.arcadeVelocityInfluence.set(0.3, 0, 0.3);
		}

	}

	else if (actor.timer > 0.3) {
			//setDropState(entity, null, delta);
	}
	if (actor.timer > 0.7) {
		addState(entity, { state: CharacterStateTypes.FALLING });
	}
//		onAnimationEnded(entity, { transitionToState: CharacterStateTypes.FALLING }, delta);

};
