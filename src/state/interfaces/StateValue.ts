import StateAlias from "../types/StateAlias"
import StateGroupType from "../types/StateGroupAlias"
import { StateType } from "../enums/StateType"
import { NumericalType } from "../../common/types/NumericalTypes"
export default interface StateValue<T extends NumericalType> {
  state: StateAlias
  type: StateType
  value: T
  group: StateGroupType
}
