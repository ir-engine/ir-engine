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
let input: Input

/**
 * Handle Input
 * 
 * @param {Entity} entity The entity
 * @param args
 * @param {Number} delta Time since last frame
 */
export const handleInput: Behavior = (entity: Entity, args: {}, delta: number): void => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
  input = getMutableComponent(entity, Input);
  console.log("Handling input data: ")
  console.log(input.data)
  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    // If the input is a button
    if (value.type === InputType.BUTTON) {
      // If the input exists on the input map (otherwise ignore it)
      if (input.schema.inputButtonBehaviors[key] && input.schema.inputButtonBehaviors[key][value.value] !== undefined) {
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
          // If the lifecycle equal continued
          input.schema.inputButtonBehaviors[key][value.value as number].continued?.forEach(element =>
            element.behavior(entity, element.args, delta)
          );
        }
      } else {
        input.schema.inputButtonBehaviors[key][value.value as number].forEach(element =>
          element.behavior(entity, element.args, delta)
        );
      }
      } else {
        if (value.lifecycleState === LifecycleValue.CONTINUED) {
          // delete button state if it's not used in schema and continues
          input.data.delete(key)
        } else {
          // mark button state as happened once
          input.data.set(key, {
            type: value.type,
            value: value.value as BinaryType,
            lifecycleState: LifecycleValue.CONTINUED
          });
        }
      }
    } else if (
      value.type === InputType.ONEDIM ||
      value.type === InputType.TWODIM ||
      value.type === InputType.THREEDIM
    ) {
      if (input.schema.inputAxisBehaviors[key]) {
        // If lifecycle hasn't been set, init it
        if (value.lifecycleState === undefined) {
          // Set the value to continued to debounce
          input.data.set(key, {
            type: value.type,
            value: value.value as BinaryType,
            lifecycleState: LifecycleValue.CHANGED
          });
          input.schema.inputAxisBehaviors[key].forEach(element =>
            element.behavior(entity, element.args, delta)
          );
        }
        // Evaluate if the number is the same as last time, send the delta 
        else {
            
        }
      }
    } else {
      console.error('handleInput called with an invalid input type');
    }
  });
};
