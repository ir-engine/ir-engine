import { Behavior } from '../../common/interfaces/Behavior';
import { NumericalType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { Input } from '../components/Input';
import { InputValue } from '../interfaces/InputValue';
import { InputAlias } from '../types/InputAlias';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';

/**
 * Local reference to input component
 */
let input: Input;

/**
 * Validate button input
 * 
 * @param {Entity} entity The entity
 */
export const validateButtonInput: Behavior = (entity: Entity): void => {
  // Get a component from the entity
  input = getComponent(entity, Input);
  // TODO: This for loop could be simplified probably now that we are using map
  for (let i = 0; i < input.data.size; i++) {
    for (let k = 0; k < input.data.size; k++) {
      if (i == k) continue; // don't compare to self
      // Opposing input cancel out
      if (buttonsOpposeEachOther(input.data, i, k)) {
        getMutableComponent<Input>(entity, Input).data.delete(i);
        getMutableComponent<Input>(entity, Input).data.delete(k);
      }
      // If input is blocked by another input that overrides and is active, remove this input
      else if (buttonIsBlockedByAnother(input.data, i, k)) {
        getMutableComponent<Input>(entity, Input).data.delete(i);
      }
      // Override input override
      else if (buttonOverridesAnother(input.data, i, k)) {
        getMutableComponent<Input>(entity, Input).data.delete(k);
      }
    }
  }
};

/**
 * If they oppose, cancel them
 * 
 * @param actionQueueArray 
 * @param {Number} arrayPosOne 
 * @param {Number} arrayPoseTwo 
 */
function buttonsOpposeEachOther(
  actionQueueArray: Map<InputAlias, InputValue<NumericalType>>,
  arrayPosOne: number,
  arrayPoseTwo: number
): boolean {
  const actionToTest = actionQueueArray[arrayPosOne];
  const actionToTestAgainst = actionQueueArray[arrayPoseTwo];
  input.schema[actionToTest.input]?.opposes?.forEach((input: InputAlias) => {
    if (input === actionToTestAgainst.input && actionToTest.value === actionToTestAgainst.value) {
      // If values are both active, cancel each other out
      return true;
    }
  });
  return false;
}

/**
 * Button is blocked by another
 * 
 * @param actionQueueArray 
 * @param {Number} arrayPosOne 
 * @param {Number} arrayPoseTwo 
 */
function buttonIsBlockedByAnother(
  actionQueueArray: Map<InputAlias, InputValue<NumericalType>>,
  arrayPosOne: number,
  arrayPoseTwo: number
): boolean {
  const actionToTest = actionQueueArray[arrayPosOne];
  const actionToTestAgainst = actionQueueArray[arrayPoseTwo];
  input.schema[actionToTest.type]?.blockedBy?.forEach((input: InputAlias) => {
    if (input === actionToTestAgainst.type && actionToTest.value === actionToTestAgainst.value) {
      // If values are both active, cancel each other out
      return true;
    }
  });
  return false;
}

/**
 * Button overrides another
 * 
 * @param actionQueueArray 
 * @param {Number} arrayPosOne 
 * @param {Number} arrayPoseTwo 
 */
function buttonOverridesAnother(
  actionQueueArray: Map<InputAlias, InputValue<NumericalType>>,
  arrayPosOne: number,
  arrayPoseTwo: number
): boolean {
  const actionToTest = actionQueueArray[arrayPosOne];
  const actionToTestAgainst = actionQueueArray[arrayPoseTwo];
  input.schema[actionToTest.type]?.overrides?.forEach((input: InputAlias) => {
    if (input === actionToTestAgainst.type && actionToTest.value === actionToTestAgainst.value) {
      return true;
    }
  });
  return false;
}
