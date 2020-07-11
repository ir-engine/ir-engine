// TODO: Combine action, inputactionhandler and inputaxishandler
import AxisValue from "../interfaces/AxisValue"
import { Vector2 } from "../../common/types/NumericalTypes"
import BehaviorComponent from "../../common/components/BufferComponent"
import RingBuffer from "../../common/classes/RingBuffer"
import ActionData from "../interfaces/ActionData"

interface InputAxisProps {
  data: ActionData // TODO: Redundant
  bufferSize: 10
  values: RingBuffer<AxisValue<Vector2>>
}

export default class InputAxisHandler2D extends BehaviorComponent<InputAxisProps, ActionData, AxisValue<Vector2>> {}
