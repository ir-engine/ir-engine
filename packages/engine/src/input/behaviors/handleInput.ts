import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { BinaryType, NumericalType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { Input } from '../components/Input';
import { InputType } from '../enums/InputType';
import { InputValue } from '../interfaces/InputValue';
import { InputAlias } from '../types/InputAlias';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { BinaryValue } from '../../common/enums/BinaryValue';
let input: Input;
export const handleInput: Behavior = (entity: Entity, delta: number): void => {
  input = getMutableComponent(entity, Input);
  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    // If the input is a button
    if (value.type === InputType.BUTTON) {
      // If the input exists on the input map (otherwise ignore it)
      if (input.schema.inputButtonBehaviors[key] && input.schema.inputButtonBehaviors[key][value.value as number]) {
        // If the button is pressed
        if(value.value === BinaryValue.ON) {
        // If the lifecycle hasn't been set or just started (so we don't keep spamming repeatedly)
        if (value.lifecycleState === undefined) value.lifecycleState = LifecycleValue.STARTED
        if(value.lifecycleState === LifecycleValue.STARTED) {
          // Set the value of the input to continued to debounce
          input.data.set(key, {
            type: value.type,
            value: value.value as BinaryType,
            lifecycleState: LifecycleValue.CONTINUED
          });
          input.schema.inputButtonBehaviors[key][value.value as number].started?.forEach(element =>
            element.behavior(entity, element.args, delta)
          );
        } else if (value.lifecycleState === LifecycleValue.CONTINUED) {
          input.schema.inputButtonBehaviors[key][value.value as number].continued?.forEach(element =>
            element.behavior(entity, element.args, delta)
          );
        }
      } else {
        input.schema.inputButtonBehaviors[key][value.value as number].continued?.forEach(element =>
          element.behavior(entity, element.args, delta)
        );
        input.data.delete(key)
      }
    } 
    } else if (
      value.type === InputType.ONED ||
      value.type === InputType.TWOD ||
      value.type === InputType.THREED ||
      value.type === InputType.FOURD
    ) {
      if (input.schema.inputAxisBehaviors[key]) {
        if (value.lifecycleState === undefined || value.lifecycleState === LifecycleValue.STARTED) {
          // Set the value to continued to debounce
          input.data.set(key, {
            type: value.type,
            value: value.value as BinaryType,
            lifecycleState: LifecycleValue.CONTINUED
          });
          input.schema.inputAxisBehaviors[key].started?.forEach(element =>
            element.behavior(entity, element.args, delta)
          );
        } else if (value.lifecycleState === LifecycleValue.CONTINUED) {
          input.schema.inputAxisBehaviors[key].continued?.forEach(element =>
            element.behavior(entity, element.args, delta)
          );
        }
      }
    } else {
      console.error('handleInput called with an invalid input type');
    }
  });
};
