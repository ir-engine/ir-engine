import { Behavior } from "../../../common/interfaces/Behavior";
import { getComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../components/CharacterComponent";
import { initializeCharacter } from "./initializeCharacter";

export const checkIfCharacterIsInitialized: Behavior = (entity): void => {
	if (!hasComponent(entity, CharacterComponent as any) || getComponent(entity, CharacterComponent).initialized)
		initializeCharacter(entity);
};
