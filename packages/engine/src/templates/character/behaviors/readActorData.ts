import { Behavior } from "../../../common/interfaces/Behavior";
import { CharacterComponent } from "../components/CharacterComponent";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { setupMeshProperties } from "../functions/setupMeshProperties";
// Integrate with asset loader

export const readCharacterData: Behavior = (entity, args: { model: any }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
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
