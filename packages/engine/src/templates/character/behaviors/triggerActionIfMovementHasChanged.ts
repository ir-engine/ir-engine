import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Input } from "../../../input/components/Input";
import { CharacterComponent } from "../components/CharacterComponent";

export const triggerActionIfMovementHasChanged: Behavior = (entity: Entity, args: { action: any }): void => {
	const input: Input = getMutableComponent<Input>(entity, Input as any);
	const character: CharacterComponent = getMutableComponent(entity, CharacterComponent);
	if (!character.initialized) return;
	const inputHash = Object.values(input.data.keys()).reduce((accumulator, key) => {
		return accumulator + (key % 2 == 0) ? key * 100 : key;
	  }, 0); 

	  if(character.currentInputHash !== inputHash){
		args.action(entity)
		character.currentInputHash === inputHash;
	  }

};
