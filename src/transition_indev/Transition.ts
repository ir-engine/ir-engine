import Operators from "../src/enums/Operators"
import StateType from "../src/types/StateType"
import BlendspaceValue from "../src/interfaces/BlendspaceValue"
import Blendspace1D from "../src/types/Blendspace1D"
import Blendspace2D from "../src/types/Blendspace2D"
import Blendspace3D from "../src/types/Blendspace3D"
import StateGroupType from "../src/types/StateGroupType"

export interface Transition {
  from: StateType
  to: StateType
  duration: { type: number; default: 0.3 }
  timeAlive: { type: number; default: 0 }
  axisFilter?: {
    from?: [
      {
        blendStateValue: BlendspaceValue<Blendspace1D | Blendspace2D | Blendspace3D>
        operator?: {
          type: Operators
          default: Operators.AND
        }
      }
    ]
    to?: [
      {
        blendStateValue: BlendspaceValue<Blendspace1D | Blendspace2D | Blendspace3D>
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
