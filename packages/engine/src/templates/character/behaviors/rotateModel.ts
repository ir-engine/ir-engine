import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { Entity } from "../../../ecs/classes/Entity";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { Vector3 } from "three";

const defaultForwardVector = new Vector3(0,0,1);

export const rotateModel: Behavior = (entity: Entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return;
	const actorTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
	const actorObject3D: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
	if(actorObject3D === undefined) console.warn("Object3D is undefined");
	else {
		actorTransform.rotation.setFromUnitVectors( defaultForwardVector, actor.orientation.clone().setY(0) );

		actor.tiltContainer.rotation.z = (-actor.angularVelocity * 2.3 * actor.velocity.length());
		actor.tiltContainer.position.setY((Math.cos(Math.abs(actor.angularVelocity * 2.3 * actor.velocity.length())) / 2) - 0.5);
	}
};
