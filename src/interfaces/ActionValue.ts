import ActionType from "../types/ActionType"
import LifecycleValue from "../enums/LifecycleValue"

export default interface ActionValue {
  action: ActionType
  value: LifecycleValue
}
