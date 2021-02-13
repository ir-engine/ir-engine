import { NumericalType } from "../../common/types/NumericalTypes";
import { Input } from "../../input/components/Input";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';

/**
 * Get Input data from the device.
 * 
 * @param inputComponent Input component which is holding input data.
 * @param inputAxes Axes of the input.
 * @param forceRefresh
 * 
 * @returns Input value from input component.
 */
const emptyInputValue = [0, 0] as NumericalType;
export function getInputData(inputComponent: Input, inputAxes: number, forceRefresh = false ): NumericalType {
   
    if (inputComponent?.data.has(inputAxes)) {
      const inputData = inputComponent.data.get(inputAxes);
      const inputValue = inputData.value;

      if (inputData.lifecycleState === LifecycleValue.ENDED || (inputData.lifecycleState === LifecycleValue.UNCHANGED && !forceRefresh))
        return ;

      return inputValue;
    }
   
    return emptyInputValue;
  }