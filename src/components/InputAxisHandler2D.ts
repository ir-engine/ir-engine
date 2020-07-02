import { Component } from "ecsy"
import { createType, copyCopyable, cloneClonable } from "ecsy"
import RingBuffer from "../classes/RingBuffer"
import AxisValue from "../interfaces/AxisValue"
import Axis3D from "../interfaces/Axis3D"
import Axis2D from "../interfaces/Axis2D"

interface InputAxisProps {
  queue: RingBuffer<AxisValue<Axis2D>>
}

export default class InputAxisHandler2D extends Component<InputAxisProps> {
  queue: RingBuffer<AxisValue<Axis2D>> = new RingBuffer<AxisValue<Axis2D>>(10)
  schema = {
    queue: { type: AxisBufferType }
  }
}

const AxisBufferType = createType<RingBuffer<AxisValue<Axis2D>>>({
  name: "ActionBuffer",
  default: new RingBuffer<AxisValue<Axis3D>>(10),
  copy: copyCopyable,
  clone: cloneClonable
})
