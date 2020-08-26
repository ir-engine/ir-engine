import { Behavior } from "../../../common/interfaces/Behavior";
import { ActorComponent } from "../components/ActorComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { PhysicsManager } from "../../../physics/components/PhysicsManager";
// Set for deletion

export const setPhysicsEnabled: Behavior = (entity, args: { value: boolean; }): void => {
	const actor: ActorComponent = getMutableComponent<ActorComponent>(entity, ActorComponent as any);

	actor.physicsEnabled = args.value;

	if (args.value === true) {
		PhysicsManager.instance.physicsWorld.addBody(actor.actorCapsule.body);
	}
	else {
		PhysicsManager.instance.physicsWorld.remove(actor.actorCapsule.body);
	}
};
