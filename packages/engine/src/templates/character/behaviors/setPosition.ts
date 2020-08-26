import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Vec3 } from "cannon-es";

export const setPosition: Behavior = (entity, args: { x: number; y: number; z: number; }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.actorCapsule.body.previousPosition = new Vec3(args.x, args.y, args.z);
	actor.actorCapsule.body.position = new Vec3(args.x, args.y, args.z);
	actor.actorCapsule.body.interpolatedPosition = new Vec3(args.x, args.y, args.z);
};
