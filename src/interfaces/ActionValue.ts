import ActionType from "../types/ActionType"
import Switch from "../enums/Switch"

export default interface ActionValue {
  action: ActionType
  value: Switch
}
