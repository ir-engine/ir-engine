import { Entity } from "../../../ecs/classes/Entity";
import { DefaultInput } from "../../shared/DefaultInput";
import { BinaryValue } from "../../../common/enums/BinaryValue";
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { Input } from "../../../input/components/Input";
import { isMovingByInputs } from "../functions/isMovingByInputs";

export const trySwitchToJump = (entity: Entity): boolean => {
  const input = getComponent(entity, Input);
  if (input.data.has(DefaultInput.JUMP) && input.data.get(DefaultInput.JUMP).value === BinaryValue.ON) {

    if (isMovingByInputs(entity)) {
      addState(entity, { state: CharacterStateTypes.JUMP_RUNNING });
    } else {
      addState(entity, { state: CharacterStateTypes.JUMP_IDLE });
    }

    return true;
  }
  return true;
};
