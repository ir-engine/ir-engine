import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent, hasComponent, getComponent } from "../../../ecs/functions/EntityFunctions";
import { Entity } from "../../../ecs/classes/Entity";
import { EnteringVehicle } from "../components/EnteringVehicle";
import { setOrientation } from "./setOrientation";
import { getCameraRelativeMovementVector } from "../functions/getCameraRelativeMovementVector";
import { FollowCameraComponent } from "../../../camera/components/FollowCameraComponent";
import { CameraModes } from "../../../camera/types/CameraModes";

export const setCameraRelativeOrientationTarget: Behavior = (entity: Entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	if (!hasComponent(entity, EnteringVehicle)) {
		const moveVector = getCameraRelativeMovementVector(entity);
    const camera = getComponent<FollowCameraComponent>(entity, FollowCameraComponent);
    if(camera && (camera.mode === CameraModes.FirstPerson || camera.mode === CameraModes.ShoulderCam)) {
      setOrientation(entity, { vector: actor.orientation });
    } else if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0) {
      setOrientation(entity, { vector: actor.orientation });
    } else {
      setOrientation(entity, { vector: moveVector });
    }
  }
};
