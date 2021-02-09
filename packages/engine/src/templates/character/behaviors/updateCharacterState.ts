import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent, hasComponent, getComponent } from "../../../ecs/functions/EntityFunctions";
import { Entity } from "../../../ecs/classes/Entity";
import { EnteringVehicle } from "../components/EnteringVehicle";
import { getCameraRelativeMovementVector } from "../functions/getCameraRelativeMovementVector";
import { FollowCameraComponent } from "../../../camera/components/FollowCameraComponent";
import { CameraModes } from "../../../camera/types/CameraModes";
import { Vector3 } from "three";

const setOrientation: Behavior = (entity, args: { vector: Vector3; instantly?: boolean }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	const lookVector = new Vector3().copy(args.vector).setY(0).normalize();

	actor.orientationTarget.copy(lookVector);

	if (args.instantly) {
		actor.orientation.copy(lookVector);
	}
};


const setCameraRelativeOrientationTarget: Behavior = (entity: Entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	if (!hasComponent(entity, EnteringVehicle)) {
		const moveVector = getCameraRelativeMovementVector(entity);
        const camera = getComponent<FollowCameraComponent>(entity, FollowCameraComponent);
        if(camera && (camera.mode === CameraModes.FirstPerson || camera.mode === CameraModes.ShoulderCam)) {
            setOrientation(entity, { vector: actor.orientation });
        } else {
            if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0) {
                setOrientation(entity, { vector: actor.orientation });
            }
            else {
                setOrientation(entity, { vector: moveVector });
            }
        }
	}
};


export const updateCharacterState: Behavior = (entity, args: { setCameraRelativeOrientationTarget?: boolean }, deltaTime: number): void => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if(!actor.initialized) return;
	actor.timer += deltaTime;
	if (args.setCameraRelativeOrientationTarget)
		setCameraRelativeOrientationTarget(entity);
};
