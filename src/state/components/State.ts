import { Types } from "ecsy"
import StateData from "../interfaces/StateData"
import DefaultStateGroupData from "../defaults/DefaultStateData"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import RingBuffer from "../../common/classes/RingBuffer"
import StateValue from "../interfaces/StateValue"

interface StateProps {
  data: StateData
  bufferSize: 10
  values: RingBuffer<StateValue>
}

export default class State extends BehaviorComponent<StateProps, StateData, StateValue> {
  data: StateData
  bufferSize: 10
  values: RingBuffer<StateValue>
}

State.schema = {
  data: { type: Types.Ref, default: DefaultStateGroupData },
  bufferSize: { type: Types.Number, default: 10 }
}
