import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";
import { getSignedAngleBetweenVectors } from "@xr3ngine/engine/src/common/functions/getSignedAngleBetweenVectors";

export const springRotation: Behavior = (entity, args = null, deltaTime): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (actor.actorCapsule.body.world == null) return;
	// Spring rotation
	// Figure out angle between current and target orientation
	const angle = getSignedAngleBetweenVectors(actor.orientation, actor.orientationTarget);

	// Simulator
	actor.rotationSimulator.target = angle;
	actor.rotationSimulator.simulate(deltaTime);
	const rot = actor.rotationSimulator.position;

	// Updating values
	actor.orientation.applyAxisAngle(new Vector3(0, 1, 0), rot);
	actor.angularVelocity = actor.rotationSimulator.velocity;
};
