import { Component, Types } from "ecsy"
import { ActionMap } from "../maps/ActionMap"

export default class ActionMapData extends Component<any> {
  actionMap = ActionMap
}

ActionMapData.schema = {
  data: { type: Types.Ref, default: ActionMap }
}
