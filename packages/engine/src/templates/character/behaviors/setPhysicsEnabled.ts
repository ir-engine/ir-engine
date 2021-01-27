import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { PhysicsManager } from "../../../physics/components/PhysicsManager";
// Set for deletion

export const setPhysicsEnabled: Behavior = (entity, args: { value: boolean }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

	actor.physicsEnabled = args.value;

	if (args.value === true) {
		PhysicsManager.instance.physicsWorld.addBody(actor.actorCapsule.body);
	}
	else {
		PhysicsManager.instance.physicsWorld.removeBody(actor.actorCapsule.body);
	}
};
