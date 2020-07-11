import RingBuffer from "../../common/classes/RingBuffer"
import BehaviorComponent from "../../common/components/BufferComponent"
import StateValue from "../behavior/interfaces/StateValue"

interface PropTypes {
  values: RingBuffer<StateValue>
}

export default class StateHandler extends BehaviorComponent<PropTypes, StateValue> {}
