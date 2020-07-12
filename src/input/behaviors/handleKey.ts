import { Entity } from "ecsy";
import Binary from "../../common/enums/Binary";
import InputActionHandler from "../../axis/components/InputActionHandler";
import UserInput from "../components/Input";
let userInput: UserInput;
export function handleKey(entity: Entity, key: string, value: Binary): any {
  userInput = entity.getComponent(UserInput);
  if (userInput.inputMap.keyboard.axes[key] === undefined)
    return;
  // Add to axis queue
  entity.getMutableComponent(InputActionHandler).values.add({
    axis: this._userInput.inputMap.keyboard.axes[key],
    value: value
  });
}
