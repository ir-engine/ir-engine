import AxisValue from "../interfaces/AxisValue"
import Axis2D from "../interfaces/Axis2D"
import BufferComponent from "./BufferComponent"
import RingBuffer from "../classes/RingBuffer"

interface InputAxisProps {
  values: RingBuffer<AxisValue<Axis2D>>
}

export default class InputAxisHandler2D extends BufferComponent<InputAxisProps, AxisValue<Axis2D>> {}
