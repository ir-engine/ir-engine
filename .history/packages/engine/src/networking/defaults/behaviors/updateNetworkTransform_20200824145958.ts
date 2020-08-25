// TODO
import { BinaryValue } from '../../../common/enums/BinaryValue';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { Input } from '../../../input/components/Input';
import { DefaultInput } from '../../../templates/shared/DefaultInput';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { DefaultStateTypes } from '../../../state/defaults/DefaultStateTypes';
import { getComponent } from '../../../ecs/functions/EntityFunctions';

export const updateNetworkTransform: Behavior = (entity: Entity): void => {
  const input = getComponent<Input>(entity, Input);
  let moving = false;
  const movementInputs = [
    DefaultInput.FORWARD,
    DefaultInput.BACKWARD,
    // DefaultInput.UP,
    // DefaultInput.DOWN,
    DefaultInput.LEFT,
    DefaultInput.RIGHT
  ];
  movementInputs.forEach(direction => {
    if (input.data.get(direction)?.value == BinaryValue.ON) moving = true;
  });
  const movementState = moving ? DefaultStateTypes.MOVING : DefaultStateTypes.IDLE;
  addState(entity, { state: movementState });
};
