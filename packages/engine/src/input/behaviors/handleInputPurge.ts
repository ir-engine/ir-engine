import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { NumericalType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { Input } from '../components/Input';
import { InputType } from '../enums/InputType';
import { InputValue } from '../interfaces/InputValue';
import { InputAlias } from '../types/InputAlias';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';

/**
 * Call all behaviors associated with current input in ENDED lifecycle phase
 * call behaviors associated with that input.ended and clear all
 * 
 * @param {Entity} entity The entity
 * @param args
 * @param {Number} delta Time since last frame
 */
export const handleInputPurge: Behavior = (entity: Entity, args: {}, delta: number): void => {
  // Get component even if it's already deleted
  const input = hasComponent(entity, Input)? getMutableComponent(entity, Input) : getComponent(entity, Input, true);
  
  // For each input currently on the input object:
  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    // If the input is a button
    if (value.type === InputType.BUTTON) {
      // If the input exists on the input map (otherwise ignore it)
      if (input.schema.inputButtonBehaviors[key]) {
        if (value.lifecycleState !== LifecycleValue.ENDED) {
          input.schema.inputButtonBehaviors[key].ended?.forEach(element =>
            element.behavior(entity, element.args, delta)
          );
        }
        input.data.delete(key);
      }
    }
  });
};
