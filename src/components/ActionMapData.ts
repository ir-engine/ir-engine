import { Component, Types } from "ecsy"
import { ActionMap } from "../maps/ActionMap"

export default class ActionMapData extends Component<any> {
  actionMapData = ActionMap
}

ActionMapData.schema = {
  keys: { type: Types.Ref, default: ActionMap }
}
