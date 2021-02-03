import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { Entity } from "../../../ecs/classes/Entity";
import { EnteringVehicle } from "../components/EnteringVehicle";
import { setOrientation } from "./setOrientation";
import { getCameraRelativeMovementVector } from "../functions/getCameraRelativeMovementVector";

export const setCameraRelativeOrientationTarget: Behavior = (entity: Entity): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	if (!hasComponent(entity, EnteringVehicle)) {
		const moveVector = getCameraRelativeMovementVector(entity);

		if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0) {
			setOrientation(entity, { vector: actor.orientation });
		}
		else {
			setOrientation(entity, { vector: moveVector });
		}
	}
};
