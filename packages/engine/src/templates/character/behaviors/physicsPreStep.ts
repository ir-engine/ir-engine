import { Behavior } from "../../../common/interfaces/Behavior";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { raycastDown } from "./raycastDown";

export const physicsPreStep: Behavior = (entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return;
	const body = actor.actorCapsule.body;
	raycastDown(entity);

	// Raycast debug
	if (actor.rayHasHit) {
		if (actor.raycastBox.visible) {
			actor.raycastBox.position.x = actor.rayResult.hitPointWorld.x;
			actor.raycastBox.position.y = actor.rayResult.hitPointWorld.y;
			actor.raycastBox.position.z = actor.rayResult.hitPointWorld.z;
		}
	}
	else {
		if (actor.raycastBox.visible) {
			actor.raycastBox.position.set(body.position.x, body.position.y - actor.rayCastLength - actor.raySafeOffset, body.position.z);
		}
	}
};
