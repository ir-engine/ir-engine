import { Behavior } from "../../../common/interfaces/Behavior";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { feetRaycast } from "./feetRaycast";
import { Body } from "cannon-es"

export const physicsPreStep: Behavior = (entity, args: { body: Body }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return;
	let body = actor.actorCapsule.body;
	console.log("Physics pre step")
	console.log(body)
	feetRaycast(entity);

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
