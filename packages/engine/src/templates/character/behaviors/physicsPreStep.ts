import { Vec3 } from "cannon-es";
import { Object3DComponent } from "@xr3ngine/engine/src/common/components/Object3DComponent";
import { cannonFromThreeVector } from "@xr3ngine/engine/src/common/functions/cannonFromThreeVector";
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { PhysicsSystem } from "../../../physics/systems/PhysicsSystem";
import { CollisionGroups } from "../../../physics/enums/CollisionGroups";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { CharacterComponent } from "../components/CharacterComponent";

export const physicsPreStep: Behavior = (entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return;
	const body = actor.actorCapsule.body;
	if(body.world == null) return;
	const transform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent);
	const object3d: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);

	// BUG: Setting position but this should be handled properly
	if(isNaN( actor.actorCapsule.body.position.x) || isNaN( actor.actorCapsule.body.position.y)) {
		console.log("body pose is nan");
		actor.actorCapsule.body.position = cannonFromThreeVector(transform.position);
	}
	// Player ray casting
	// Create ray
	const start = new Vec3(body.position.x, body.position.y, body.position.z);
	const end = new Vec3(body.position.x, body.position.y - actor.rayCastLength - actor.raySafeOffset, body.position.z);
	// Raycast options
	const rayCastOptions = {
		collisionFilterMask: CollisionGroups.Default,
		skipBackfaces: true /* ignore back faces */
	};
	// Cast the ray
	actor.rayHasHit = PhysicsSystem.physicsWorld.raycastClosest(start, end, rayCastOptions, actor.rayResult);

	// Raycast debug
	// if (actor.rayHasHit) {
	// 	if (actor.raycastBox.visible) {
	// 		actor.raycastBox.position.x = actor.rayResult.hitPointWorld.x;
	// 		actor.raycastBox.position.y = actor.rayResult.hitPointWorld.y;
	// 		actor.raycastBox.position.z = actor.rayResult.hitPointWorld.z;
	// 	}
	// }
	// else {
	// 	if (actor.raycastBox.visible) {
	// 		actor.raycastBox.position.set(body.position.x, body.position.y - actor.rayCastLength - actor.raySafeOffset, body.position.z);
	// 	}
	// }
};
