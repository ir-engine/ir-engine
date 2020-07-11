import StateType from "../types/StateType"
import StateGroupType from "../types/StateGroupType"
import Binary from "../../common/enums/Binary"
export default interface StateValue {
  state: StateType
  value: number
  group: StateGroupType
}
