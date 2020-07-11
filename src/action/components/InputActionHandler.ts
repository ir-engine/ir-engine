import { Types } from "ecsy"
// TODO: Combine action, inputactionhandler and inputaxishandler
import ActionValue from "../interfaces/ActionValue"
import RingBuffer from "../../common/classes/RingBuffer"
import BehaviorComponent from "../../common/components/BufferComponent"
import ActionData from "../interfaces/ActionData"

interface InputActionProps {
  data: ActionData
  bufferSize: 10
  values: RingBuffer<ActionValue>
}

export default class InputActionHandler extends BehaviorComponent<InputActionProps, ActionData, ActionValue> {}
