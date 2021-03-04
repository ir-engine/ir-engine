
import { Vector3 } from "three";
import { FollowCameraComponent } from "../../../camera/components/FollowCameraComponent";
import { CameraModes } from "../../../camera/types/CameraModes";
import { Behavior } from "../../../common/interfaces/Behavior";
import { appplyVectorMatrixXZ } from "../../../common/functions/appplyVectorMatrixXZ";
import { isMobileOrTablet } from "../../../common/functions/isMobile";
import { getComponent, getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { EnteringVehicle } from "../components/EnteringVehicle";

const localDirection = new Vector3(0, 0, 1);
const emptyVector = new Vector3();
const damping = 0.2; // To reduce the change in direction.
const isMobile = isMobileOrTablet();

export const updateCharacterState: Behavior = (entity, args: { }, deltaTime: number): void => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (!actor.initialized) return console.warn("Actor no initialized");
	actor.timer += deltaTime;
	if (hasComponent(entity, EnteringVehicle)) return;

	const localMovementDirection = actor.localMovementDirection; //getLocalMovementDirection(entity);

	// For Thumbstick
	if (isMobile) {
		// Calculate the current view vector angle.
		const viewVectorAngle = Math.atan2(actor.viewVector.z, actor.viewVector.x);
	  	actor.viewVector.x = Math.cos(viewVectorAngle - (actor.changedViewAngle * damping));
	  	actor.viewVector.z = Math.sin(viewVectorAngle - (actor.changedViewAngle * damping));
	}

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
