import Actions from "../enums/Actions"
import ActionState from "../enums/ActionState"

export default interface ActionQueueItem {
  action: Actions
  state: ActionState
}
