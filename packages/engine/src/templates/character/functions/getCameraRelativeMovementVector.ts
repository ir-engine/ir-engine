import { CharacterComponent } from "../components/CharacterComponent";
import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";
import { appplyVectorMatrixXZ } from "../../../common/functions/appplyVectorMatrixXZ";
import { Entity } from "../../../ecs/classes/Entity";
import { getLocalMovementDirection } from "./getLocalMovementDirection";
// Function

const localDirection = new Vector3(0,0,1);
const emptyVector = new Vector3();

export const getCameraRelativeMovementVector = (entity: Entity): Vector3 => {
	const actor: CharacterComponent = getComponent<CharacterComponent>(entity, CharacterComponent as any);

	const localMovementDirection = actor.localMovementDirection; //getLocalMovementDirection(entity);
	const flatViewVector = new Vector3(actor.viewVector.x, 0, actor.viewVector.z).normalize();

	return localMovementDirection.length()? appplyVectorMatrixXZ(flatViewVector, localDirection) : emptyVector.setScalar(0);
};
