import { ActorComponent } from "../components/ActorComponent";
import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";
import { appplyVectorMatrixXZ } from "./appplyVectorMatrixXZ";
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { Entity } from "../../../ecs/classes/Entity";
import { getLocalMovementDirection } from "./getLocalMovementDirection";
// Function



export const getCameraRelativeMovementVector = (entity: Entity): Vector3 => {
	const actor: ActorComponent = getComponent<ActorComponent>(entity, ActorComponent as any);
	const actorObject3D: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent);

	const localDirection = getLocalMovementDirection(entity);
	const flatViewVector = new Vector3(actor.viewVector.x, 0, actor.viewVector.z).normalize();

	return appplyVectorMatrixXZ(flatViewVector, localDirection);
};
