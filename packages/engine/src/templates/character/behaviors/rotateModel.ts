import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { Entity } from "../../../ecs/classes/Entity";
import { TransformComponent } from "../../../transform/components/TransformComponent";

export const rotateModel: Behavior = (entity: Entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	const actorTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
	const actorObject3D: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
	// TODO: Need these values in our transform system not setting three.js directly
	actorObject3D.value.lookAt(actorTransform.position.x + actorTransform.rotation.x, actorTransform.position.y + actorTransform.rotation.y, actorTransform.position.z + actorTransform.rotation.z);
	actor.tiltContainer.rotation.z = (-actor.angularVelocity * 2.3 * actor.velocity.length());
	actor.tiltContainer.position.setY((Math.cos(Math.abs(actor.angularVelocity * 2.3 * actor.velocity.length())) / 2) - 0.5);
};
