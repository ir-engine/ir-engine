import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { Entity } from "../../../ecs/classes/Entity";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { Vector3 } from "three";
import { FollowCameraComponent } from "../../../camera/components/FollowCameraComponent";

const defaultForwardVector = new Vector3(0, 0, 1);
const defaultActorVector = new Vector3(0, 0, 1.08);//when we use a standard vector3 where Z:1 - then a bug appears in which the character spins around itself

export const rotateModel: Behavior = (entity: Entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	const follower = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent); // Camera
	if (!actor.initialized) return;
	const actorTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
	const actorObject3D: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
	if (actorObject3D === undefined) console.warn("Object3D is undefined");
	else {
		if (follower.mode == 'thirdPersonLocked') {
			actorTransform.rotation.setFromUnitVectors(defaultActorVector, actor.viewVector.clone().setY(0));
		} else {
			actorTransform.rotation.setFromUnitVectors(defaultForwardVector, actor.orientation.clone().setY(0));
		}

		actor.tiltContainer.rotation.z = (-actor.angularVelocity * 2.3 * actor.velocity.length());
		actor.tiltContainer.position.setY((Math.cos(Math.abs(actor.angularVelocity * 2.3 * actor.velocity.length())) / 2) - 0.5);
	}
};
