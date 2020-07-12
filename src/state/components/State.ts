import StateMap from "../interfaces/StateMap"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import StateValue from "../interfaces/StateValue"
import StateAlias from "../types/StateAlias"
import { Binary, Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"

export default class State extends BehaviorComponent<StateAlias, StateMap, StateValue<Binary | Scalar | Vector2 | Vector3>> {}
