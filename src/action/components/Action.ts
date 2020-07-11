// TODO: Combine action, inputactionhandler and inputaxishandler
import { Types } from "ecsy"
import DefaultActionData from "../defaults/DefaultActionData"
import ActionData from "../interfaces/ActionData"
import DataComponent from "../../common/components/DataComponent"

export default class Action extends DataComponent<ActionData> {}

Action.schema = {
  data: { type: Types.Ref, default: DefaultActionData }
}
