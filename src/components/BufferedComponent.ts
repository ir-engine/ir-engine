import { Component } from "ecsy"
import RingBuffer from "../classes/RingBuffer"

export default class BufferedComponent<Props, T> extends Component<Props> {
  bufferSize = 10
  values: RingBuffer<T> = new RingBuffer<T>(this.bufferSize)
  constructor(props) {
    super(false)
    this.values = new RingBuffer<T>(this.bufferSize)
  }
  setBufferSize(newSize: number, resetBuffer = true): void {
    this.bufferSize = newSize
    if (resetBuffer) this.values = new RingBuffer<T>(this.bufferSize)
  }
  copy(src) {
    this.bufferSize = src.bufferSize
    this.values = new RingBuffer<T>(src.bufferSize)
    return this
  }
  reset(): void {
    this.values.clear()
  }
}
