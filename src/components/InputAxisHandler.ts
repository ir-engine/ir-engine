import { Component } from "ecsy"
import { createType, copyCopyable, cloneClonable } from "ecsy"
import RingBuffer from "../classes/RingBuffer"
import AxisValue from "../interfaces/AxisValue"

interface InputAxisProps {
  queue: RingBuffer<AxisValue>
}

export default class InputAxisHandler extends Component<InputAxisProps> {
  queue: RingBuffer<AxisValue> = new RingBuffer<AxisValue>(10)
  schema = {
    queue: { type: AxisBufferType }
  }
}
export const AxisBufferType = createType<RingBuffer<AxisValue>>({
  name: "ActionBuffer",
  default: new RingBuffer<AxisValue>(10),
  copy: copyCopyable,
  clone: cloneClonable
})
