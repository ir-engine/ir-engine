import { Component, Types } from "ecsy"
import { ActionMap } from "../maps/ActionMap"

export default class InputActionMapData extends Component<any> {
  actionMap = ActionMap
}

InputActionMapData.schema = {
  data: { type: Types.Ref, default: ActionMap }
}
