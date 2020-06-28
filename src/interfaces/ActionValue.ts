import ActionType from "../enums/ActionType"
import ActionValues from "../enums/ActionValues"

export default interface ActionValue {
  action: ActionType
  value: ActionValues
}
