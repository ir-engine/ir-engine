// Place this component on any entity which you would like to recieve input
// Inputs are processed from various devices and converted into actions
import { Component } from "ecsy"
import { AxisBuffer } from "../classes/AxisBuffer"
import AxisBufferType from "../types/AxisBufferType"

export default class InputAxisQueue extends Component<any> {
  axes: AxisBuffer
}

InputAxisQueue.schema = {
  axes: { type: AxisBufferType, default: new AxisBuffer(10) }
}
