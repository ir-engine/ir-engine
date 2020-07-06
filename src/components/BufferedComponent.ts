import { Component } from "ecsy"
import { createType, copyCopyable, cloneClonable } from "ecsy"
import RingBuffer from "../classes/RingBuffer"

export default class BufferedComponent<Props, BufferedType> extends Component<Props> {
  bufferSize = 10
  values: RingBuffer<BufferedType> = new RingBuffer<BufferedType>(this.bufferSize)
  setBufferSize(newSize: number, resetBuffer = true): void {
    this.bufferSize = newSize
    if (resetBuffer) this.values = new RingBuffer<BufferedType>(this.bufferSize)
  }
  schema = {
    values: {
      type: createType<RingBuffer<BufferedType>>({
        name: "ActionBuffer",
        default: new RingBuffer<BufferedType>(this.bufferSize),
        copy: copyCopyable,
        clone: cloneClonable
      })
    }
  }
}
