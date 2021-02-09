import { BinaryValue } from "@xr3ngine/engine/src/common/enums/BinaryValue";
import { Entity } from "../../../ecs/classes/Entity";
import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { Input } from "../../../input/components/Input";
import { addState } from "../../../state/behaviors/addState";
import { DefaultInput } from "../../shared/DefaultInput";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from "../components/CharacterComponent";

export const trySwitchToJump = (entity: Entity): boolean => {
  const input = getComponent(entity, Input);
  if (input.data.has(DefaultInput.JUMP) && input.data.get(DefaultInput.JUMP).value === BinaryValue.ON) {

    if (getComponent(entity, CharacterComponent).localMovementDirection.length() > 0) {
      addState(entity, { state: CharacterStateTypes.JUMP_RUNNING });
    } else {
      addState(entity, { state: CharacterStateTypes.JUMP_IDLE });
    }

    return true;
  }
  return true;
};
