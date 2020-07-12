import Operators from "../src/enums/Operators"
import StateType from "../src/types/StateType"
import StateValue from "../src/interfaces/StateValue"
import State1D from "../src/types/State1D"
import State2D from "../src/types/State2D"
import State3D from "../src/types/State3D"
import StateGroupType from "../src/types/StateGroupType"

export interface Transition {
  from: StateType
  to: StateType
  duration: { type: number; default: 0.3 }
  timeAlive: { type: number; default: 0 }
  axisFilter?: {
    from?: [
      {
        blendStateValue: StateValue<State1D | State2D | State3D>
        operator?: {
          type: Operators
          default: Operators.AND
        }
      }
    ]
    to?: [
      {
        blendStateValue: StateValue<State1D | State2D | State3D>
        operator?: {
          type: Operators
          default: Operators.AND
        }
      }
    ]
  }
  stateGroup?: StateGroupType
}

export default Transition
