
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { Input } from '../../input/components/Input';
import { DefaultInput } from '../../input/defaults/DefaultInput';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { BinaryValue } from '../../common/enums/BinaryValue';
import { addState } from '../../state/behaviors/StateBehaviors';
import { DefaultStateTypes } from '../../state/defaults/DefaultStateTypes';

let input: Input;
let moving: boolean;
const movementInputs = [
  DefaultInput.FORWARD,
  DefaultInput.BACKWARD,
  // DefaultInput.UP,
  // DefaultInput.DOWN,
  DefaultInput.LEFT,
  DefaultInput.RIGHT
];
export const updateMovementState: Behavior = (entity: Entity): void => {
  input = getComponent(entity, Input);
  moving = false;
  movementInputs.forEach(direction => {
    if (input.data.get(direction)?.value == BinaryValue.ON) moving = true;
  });
  addState(entity, { state: moving ? DefaultStateTypes.MOVING : DefaultStateTypes.IDLE });
};
