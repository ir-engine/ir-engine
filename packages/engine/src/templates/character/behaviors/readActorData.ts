import { Behavior } from "../../../common/interfaces/Behavior";
import { ActorComponent } from "../components/ActorComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { setupMeshProperties } from "../functions/setupMeshProperties";
// Integrate with asset loader

export const readActorData: Behavior = (entity, args: { model: any; }): void => {
	const actor: ActorComponent = getMutableComponent<ActorComponent>(entity, ActorComponent as any);
	console.log(args.model);
	// TODO: actor will only work with glb
	args.model.traverse((child) => {

		if (child.isMesh) {
			setupMeshProperties(child);

			if (child.material !== undefined) {
				actor.materials.push(child.material);
			}
		}
	});
};
