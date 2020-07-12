import StateType from "../types/StateType"
import StateGroupType from "../types/StateGroupType"
export default interface StateValue {
  state: StateType
  value: number
  group: StateGroupType
}
