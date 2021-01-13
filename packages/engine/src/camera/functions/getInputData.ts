import { NumericalType } from "../../common/types/NumericalTypes";
import { Input } from "../../input/components/Input";
import { LifecycleValue } from "../../common/enums/LifecycleValue";


export function getInputData(inputComponent: Input, inputAxes: number): NumericalType {
    const emptyInputValue = [0, 0] as NumericalType;
      
    if (inputComponent?.data.has(inputAxes)) {
      const inputData = inputComponent.data.get(inputAxes);
      const inputValue = inputData.value;
      if (inputData.lifecycleState === LifecycleValue.ENDED || inputData.lifecycleState === LifecycleValue.UNCHANGED) {
        // skip
        return ;
      }
  
      if (inputData.lifecycleState !== LifecycleValue.CHANGED) {
        // console.log('! LifecycleValue.CHANGED', LifecycleValue[inputData.lifecycleState])
        return emptyInputValue;
      }
  
      const preInputData = inputComponent.prevData.get(inputAxes);
      if (inputValue[0] === preInputData?.value[0] && inputValue[1] === preInputData?.value[1]) {
        // debugger
        // return
      }
      return inputValue;
    }
  
    return emptyInputValue;
  }