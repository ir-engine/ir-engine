import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { setDropState } from "./setDropState";

export const jumpRunning: Behavior = (entity: Entity, args: null, delta: any): void => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	// Physically jump
	if (actor.timer > 0.13 && !actor.alreadyJumped) {
		const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
		actor.wantsToJump = true;
		actor.initJumpSpeed = 1;

		actor.alreadyJumped = true;
		actor.rotationSimulator.damping = 0.3;
		actor.arcadeVelocityIsAdditive = true;
	}
	else if (actor.timer > 0.24) {
		setDropState(entity, null, delta);
	}
};
