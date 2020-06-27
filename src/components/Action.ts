// Place this component on any entity which you would like to recieve input
// Inputs are processed from various devices and converted into actions
import { Component, Types } from "ecsy"
import { RingBuffer } from "../utils/RingBuffer"
import Actions from "../enums/Actions"

export default class Action extends Component {
  

  constructor(ringBufferSize?) {
    super()
    if (ringBufferSize) this.ringBufferSize = ringBufferSize
    this.reset()
  }

  reset(): void {
    this.ringBuffer = new RingBuffer<Actions>(this.ringBufferSize)
  }
}

Action.schema = {
  actions: { type: Types.Array,  }
  ringBufferSize = 5
  ringBuffer = new RingBuffer<Actions>(this.ringBufferSize)
}