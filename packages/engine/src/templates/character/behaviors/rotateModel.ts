import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { Entity } from "../../../ecs/classes/Entity";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { Vector3 } from "three";

export const rotateModel: Behavior = (entity: Entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return
	const actorTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
	const actorObject3D: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
	if(actorObject3D === undefined) console.warn("Object3D is undefined")
	else {
		// TODO: Need these values in our transform system not setting three.js directly
		//	debugger
		//actorObject3D.value.lookAt(actorTransform.position.x + actorTransform.rotation.x, actorTransform.position.y + actorTransform.rotation.y, actorTransform.position.z + actorTransform.rotation.z);

		// const lookPoint = actorTransform.position.clone().add( actor.orientation );
		// const a = Math.atan2(actor.orientation.x, actor.orientation.z)

		actorTransform.rotation.setFromUnitVectors( new Vector3(0,0,1), actor.orientation )

		// console.log('lookPoint', lookPoint)
		//actorObject3D.value.lookAt( lookPoint );
		if (actor.orientation.length() !== 0) {
			//debugger
		}
		// actor.tiltContainer.rotation.z = (-actor.angularVelocity * 2.3 * actor.velocity.length());
		actor.tiltContainer.position.setY((Math.cos(Math.abs(actor.angularVelocity * 2.3 * actor.velocity.length())) / 2) - 0.5);
	}
};
