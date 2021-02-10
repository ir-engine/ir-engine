
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Vector3 } from "three";
import { FollowCameraComponent } from "../../../camera/components/FollowCameraComponent";
import { CameraModes } from "../../../camera/types/CameraModes";
import { appplyVectorMatrixXZ } from "../../../common/functions/appplyVectorMatrixXZ";
import { getComponent, getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { EnteringVehicle } from "../components/EnteringVehicle";

const localDirection = new Vector3(0, 0, 1);
const emptyVector = new Vector3();

export const updateCharacterState: Behavior = (entity, args: { }, deltaTime: number): void => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (!actor.initialized) return console.warn("Actor no initialized");
	actor.timer += deltaTime;
	if (hasComponent(entity, EnteringVehicle)) return;

	const localMovementDirection = actor.localMovementDirection; //getLocalMovementDirection(entity);
	const flatViewVector = new Vector3(actor.viewVector.x, 0, actor.viewVector.z).normalize();

	const moveVector = localMovementDirection.length() ? appplyVectorMatrixXZ(flatViewVector, localDirection) : emptyVector.setScalar(0);
	const camera = getComponent(entity, FollowCameraComponent);

	if (camera && (camera.mode === CameraModes.FirstPerson || camera.mode === CameraModes.ShoulderCam))
		actor.orientationTarget.copy(new Vector3().copy(actor.orientation).setY(0).normalize());
	else if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0)
		actor.orientationTarget.copy(new Vector3().copy(actor.orientation).setY(0).normalize());
	else
		actor.orientationTarget.copy(new Vector3().copy(moveVector).setY(0).normalize());
};
