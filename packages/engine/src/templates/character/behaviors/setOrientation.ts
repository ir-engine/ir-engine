import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";

export const setOrientation: Behavior = (entity, args: { vector: Vector3; instantly?: boolean; }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	const lookVector = new Vector3().copy(args.vector).setY(0).normalize();

	actor.orientationTarget.copy(lookVector);

	if (args.instantly) {
		actor.orientation.copy(lookVector);
	}
};
