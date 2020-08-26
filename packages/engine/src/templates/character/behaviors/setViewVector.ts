import { Behavior } from "../../../common/interfaces/Behavior";
import { ActorComponent } from "../components/ActorComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";

export const setViewVector: Behavior = (entity, args: { vector: Vector3; }): void => {
	getMutableComponent<ActorComponent>(entity, ActorComponent as any).viewVector.copy(args.vector).normalize();
};
