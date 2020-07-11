import { Types } from "ecsy"
import DataComponent from "../../common/components/DataComponent"
import StateData from "../interfaces/StateData"
import DefaultStateGroupData from "../defaults/DefaultStateData"

export default class State extends DataComponent<StateData> {}

State.schema = {
  data: { type: Types.Ref, default: DefaultStateGroupData }
}
