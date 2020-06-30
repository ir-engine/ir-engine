import ActionType from "../enums/InputActionType"
import ActionValues from "../enums/ActionValues"

export default interface ActionValue {
  action: ActionType
  value: ActionValues
}
