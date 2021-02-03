import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { PhysicsSystem } from "../../../physics/systems/PhysicsSystem";
// Set for deletion

export const setPhysicsEnabled: Behavior = (entity, args: { value: boolean }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	actor.physicsEnabled = args.value;

	if (args.value === true) {
		PhysicsSystem.physicsWorld.addBody(actor.actorCapsule.body);
	}
	else {
		PhysicsSystem.physicsWorld.removeBody(actor.actorCapsule.body);
	}
};
