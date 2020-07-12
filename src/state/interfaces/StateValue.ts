import StateAlias from "../types/StateAlias"
import StateGroupType from "../types/StateGroupType"
import { StateType } from "../enums/StateType"
import { Binary, Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
export default interface StateValue<T extends Binary | Scalar | Vector2 | Vector3> {
  state: StateAlias
  type: StateType
  value: T
  group: StateGroupType
}
