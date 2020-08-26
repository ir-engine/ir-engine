import { Behavior } from "../../../common/interfaces/Behavior";
import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { getForward } from "../functions/getForward";
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { Entity } from "../../../ecs/classes/Entity";
import { setOrientation } from "./setOrientation";

export const resetOrientation: Behavior = (entity: Entity): void => {
	const actorObject3D: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent);
	const forward = getForward({ obj: actorObject3D.value });
	setOrientation(entity, { vector: forward, instantly: true });
};
