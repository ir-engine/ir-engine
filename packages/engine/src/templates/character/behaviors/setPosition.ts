import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Vec3 } from "cannon-es";
import { TransformComponent } from "../../../transform/components/TransformComponent";

export const setPosition: Behavior = (entity, args: { x: number; y: number; z: number }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	const actorTransform: TransformComponent = getMutableComponent<TransformComponent>(entity, TransformComponent);

	if(isNaN( actor.actorCapsule.body.position.y))  actor.actorCapsule.body.position.y = 0;
	if (actor.physicsEnabled)
		{
		actor.actorCapsule.body.previousPosition = new Vec3(args.x, args.y, args.z);
		actor.actorCapsule.body.position = new Vec3(args.x, args.y, args.z);
		actor.actorCapsule.body.interpolatedPosition = new Vec3(args.x, args.y, args.z);
	}
	else
	{
		actorTransform.position.x = args.x;
		actorTransform.position.y = args.y;
		actorTransform.position.z = args.z;
	}
};
