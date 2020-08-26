import { Behavior } from "../../../common/interfaces/Behavior";
import { ActorComponent } from "../components/ActorComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";

export const setOrientation: Behavior = (entity, args: { vector: Vector3; instantly?: boolean; }): void => {
	const actor: ActorComponent = getMutableComponent<ActorComponent>(entity, ActorComponent as any);

	let lookVector = new Vector3().copy(args.vector).setY(0).normalize();

	actor.orientationTarget.copy(lookVector);

	if (args.instantly) {
		actor.orientation.copy(lookVector);
	}
};
