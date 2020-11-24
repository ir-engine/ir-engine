import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";
import { Entity } from "../../../ecs/classes/Entity";
import { Input } from "../../../input/components/Input";
import { DefaultInput } from "../../shared/DefaultInput";
// Not a behavior, it just returns a value

export const getLocalMovementDirection = (entity: Entity): Vector3 => {
	const input: Input = getMutableComponent<Input>(entity, Input as any);

	// TODO: Incorporate into input system!
	const positiveX = input.data.has(DefaultInput.RIGHT) ? -1 : 0;
	const negativeX = input.data.has(DefaultInput.LEFT) ? 1 : 0;
	const positiveZ = input.data.has(DefaultInput.FORWARD) ? 1 : 0;
	const negativeZ = input.data.has(DefaultInput.BACKWARD) ? -1 : 0;

	return new Vector3(positiveX + negativeX, 0, positiveZ + negativeZ).normalize();
};
