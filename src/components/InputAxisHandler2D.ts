import AxisValue from "../interfaces/AxisValue"
import Axis2D from "../interfaces/Axis2D"
import BufferedComponent from "./BufferedComponent"
import { RingBuffer } from "./BufferedComponent"

interface InputAxisProps {
  values: RingBuffer<AxisValue<Axis2D>>
}

export default class InputAxisHandler2D extends BufferedComponent<InputAxisProps, AxisValue<Axis2D>> {}
