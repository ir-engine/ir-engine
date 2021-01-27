import { NumericalType } from "../../common/types/NumericalTypes";
import { Input } from "../../input/components/Input";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { DefaultInput } from "../../templates/shared/DefaultInput";

/**
 * Get Input data from the device.
 * 
 * @param inputComponent Input component which is holding input data.
 * @param inputAxes Axes of the input.
 * @param forceRefresh
 * 
 * @returns Input value from input component.
 */
export function getInputData(inputComponent: Input, inputAxes: number, forceRefresh = false ): NumericalType {
    const emptyInputValue = [0, 0] as NumericalType;
   
    if (inputComponent?.data.has(inputAxes)) {
      const inputData = inputComponent.data.get(inputAxes);
      const inputValue = inputData.value;
      
      if (inputData.lifecycleState === LifecycleValue.ENDED || (inputData.lifecycleState === LifecycleValue.UNCHANGED && !forceRefresh)) {
        // skip
        return ;
      }
      
      // if (inputData.lifecycleState !== LifecycleValue.CHANGED) {
      //   // console.log('! LifecycleValue.CHANGED', LifecycleValue[inputData.lifecycleState])
      //   return emptyInputValue;
      // }
      
      const preInputData = inputComponent.prevData.get(inputAxes);
      if (inputValue[0] === preInputData?.value[0] && inputValue[1] === preInputData?.value[1]) {
        // debugger
        // return
      }
      return inputValue;
    }
   
    return emptyInputValue;
  }