import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";

export const jumpIdle: Behavior = (entity: Entity, args: null, delta: any): void => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	// Move in air
	if (actor.alreadyJumped) {
		// Disabled because we're called this on the behavior update
		// setCameraRelativeOrientationTarget(entity);
		if(getComponent(entity, CharacterComponent).localMovementDirection.length() > 0) {
			actor.velocityTarget.set(0.8, 0.8, 0.8);
		  }
		  else {
			actor.velocityTarget.set(0, 0, 0);
		  }
	}

	// Physically jump
	if (!actor.alreadyJumped) {
		actor.wantsToJump = true;
		actor.initJumpSpeed = -1;

		actor.alreadyJumped = true;

		actor.velocitySimulator.mass = 100;
		actor.rotationSimulator.damping = 0.3;

		if (actor.rayResult?.body?.velocity.length() > 0) {
			actor.arcadeVelocityInfluence.set(0, 0, 0);
		} else {
			actor.arcadeVelocityInfluence.set(0.3, 0, 0.3);
		}
	}
};
