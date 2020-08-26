import { Vec3 } from "cannon-es";
import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { PhysicsManager } from "../../../physics/components/PhysicsManager";
import { CollisionGroups } from "../../../physics/enums/CollisionGroups";
import { CharacterComponent } from "../components/CharacterComponent";

export const feetRaycast: Behavior = (entity: Entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	let body = actor.actorCapsule.body;

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
	actor.rayHasHit = PhysicsManager.instance.physicsWorld.raycastClosest(start, end, rayCastOptions, actor.rayResult);
};
