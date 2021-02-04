import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { getForward } from "@xr3ngine/engine/src/common/functions/getForward";
import { Object3DComponent } from "@xr3ngine/engine/src/common/components/Object3DComponent";
import { Entity } from "../../../ecs/classes/Entity";
import { setOrientation } from "./setOrientation";

export const resetOrientation: Behavior = (entity: Entity): void => {
	const actorObject3D: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent);
	const forward = getForward( actorObject3D.value );
	setOrientation(entity, { vector: forward, instantly: true });
};
