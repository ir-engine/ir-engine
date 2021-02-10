import { BinaryValue } from "@xr3ngine/engine/src/common/enums/BinaryValue";
import { Entity } from "../../../ecs/classes/Entity";
import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { Input } from "../../../input/components/Input";
import { setState } from "../../../state/behaviors/setState";
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from "../components/CharacterComponent";

export const trySwitchToJump = (entity: Entity): boolean => {
  const input = getComponent(entity, Input);
  if (input.data.has(BaseInput.JUMP) && input.data.get(BaseInput.JUMP).value === BinaryValue.ON) {

    setState(entity, { state: CharacterStateTypes.JUMP });


    return true;
  }
  return true;
};
