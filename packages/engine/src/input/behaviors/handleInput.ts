import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { NumericalType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { Input } from '../components/Input';
import { InputType } from '../enums/InputType';
import { InputValue } from '../interfaces/InputValue';
import { InputAlias } from '../types/InputAlias';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { BinaryValue } from '../../common/enums/BinaryValue';

/**
 * Call all behaviors associated with current input in it's current lifecycle phase
 * i.e. if the player has pressed some buttons that have added the value to the input queue,
 * call behaviors (move, jump, drive, etc) associated with that input.
 * There are two cycles:
 * - call behaviors according to value.lifecycleState
 * - clean processed LifecycleValue.ENDED inputs
 * 
 * @param {Entity} entity The entity
 * @param args
 * @param {Number} delta Time since last frame
 */
export const handleInput: Behavior = (entity: Entity, args: {}, delta: number): void => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
  const input = getMutableComponent(entity, Input);

  // check CHANGED/UNCHANGED axis inputs
  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    if (
      value.type !== InputType.ONEDIM &&
      value.type !== InputType.TWODIM &&
      value.type !== InputType.THREEDIM
    ) {
      // skip all other inputs
      return
    }

    if (value.lifecycleState === LifecycleValue.ENDED) {
      // ENDED here is a special case, like mouse position on mouse down
      return
    }

    if (input.prevData.has(key)) {
      if (JSON.stringify(value.value) === JSON.stringify(input.prevData.get(key).value)) {
        value.lifecycleState = LifecycleValue.UNCHANGED
      } else {
        value.lifecycleState = LifecycleValue.CHANGED
      }
      input.data.set(key, value)
    }
  })

  // For each input currently on the input object:
  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    // If the input is a button
    if (value.type === InputType.BUTTON) {
      // If the input exists on the input map (otherwise ignore it)
      if (input.schema.inputButtonBehaviors[key]) {
        // If the button is pressed
        if(value.value === BinaryValue.ON) {
          // If the lifecycle hasn't been set or just started (so we don't keep spamming repeatedly)
          if (value.lifecycleState === undefined) value.lifecycleState = LifecycleValue.STARTED

          if(value.lifecycleState === LifecycleValue.STARTED) {
            // Set the value of the input to continued to debounce
            input.schema.inputButtonBehaviors[key]?.started?.forEach(element =>
              element.behavior(entity, element.args, delta)
            );
          } else if (value.lifecycleState === LifecycleValue.CONTINUED) {
            // If the lifecycle equal continued
            input.schema.inputButtonBehaviors[key]?.continued?.forEach(element =>
              element.behavior(entity, element.args, delta)
            );
          } else {
            console.error('Unexpected lifecycleState', value.lifecycleState, LifecycleValue[value.lifecycleState]);
          }
        } else {
          input.schema.inputButtonBehaviors[key].ended?.forEach(element =>
            element.behavior(entity, element.args, delta)
          );
        }
      }
    }
    else if (
      value.type === InputType.ONEDIM ||
      value.type === InputType.TWODIM ||
      value.type === InputType.THREEDIM
    ) {
      if (input.schema.inputAxisBehaviors[key]) {
        // If lifecycle hasn't been set, init it
        if (value.lifecycleState === undefined) value.lifecycleState = LifecycleValue.STARTED
        switch (value.lifecycleState) {
          case LifecycleValue.STARTED:
            // Set the value to continued to debounce
            input.schema.inputAxisBehaviors[key].started?.forEach(element =>
              element.behavior(entity, element.args, delta)
            );
            break;
          case LifecycleValue.CHANGED:
            // If the value is different from last frame, update it
            input.schema.inputAxisBehaviors[key].changed?.forEach(element => {
              element.behavior(entity, element.args, delta)
            });
            break;
          case LifecycleValue.UNCHANGED:
            input.schema.inputAxisBehaviors[key].unchanged?.forEach(element =>
              element.behavior(entity, element.args, delta)
            );
            break;
          default:
            console.error('Unexpected lifecycleState', value.lifecycleState, LifecycleValue[value.lifecycleState]);
        }
      }
    } else {
      console.error('handleInput called with an invalid input type');
    }
  });

  // store prevData
  input.prevData.clear();
  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    input.prevData.set(key, value);
  })

  // // clean processed LifecycleValue.ENDED inputs
  // input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
  //   if (value.type === InputType.BUTTON) {
  //     if (value.lifecycleState === LifecycleValue.ENDED) {
  //       input.data.delete(key)
  //     }
  //   }
  //   // else if (
  //   //   value.type === InputType.ONEDIM ||
  //   //   value.type === InputType.TWODIM ||
  //   //   value.type === InputType.THREEDIM
  //   // ) {
  //   //   // if (value.lifecycleState === LifecycleValue.UNCHANGED) {
  //   //   //   input.data.delete(key)
  //   //   // }
  //   // }
  // })
};
