import { Behavior } from "../../../common/interfaces/Behavior";
import { hasComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { initializeCharacter } from "./initializeCharacter";

export const checkIfCharacterIsInitialized: Behavior = (entity): void => {
	if (!hasComponent(entity, CharacterComponent as any))
		initializeCharacter(entity);
};
