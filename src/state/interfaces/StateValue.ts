import StateAlias from "../types/StateAlias"
import StateGroupType from "../types/StateGroupType"
import { StateType } from "../enums/StateType"
export default interface StateValue {
  state: StateAlias
  type: StateType
  value: number
  group: StateGroupType
}
