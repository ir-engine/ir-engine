import { Component } from "ecsy"
import RingBuffer from "../classes/RingBuffer"

export default class BufferComponent<Props, T> extends Component<Props> {
  bufferSize = 10
  buffer: RingBuffer<T> = new RingBuffer<T>(this.bufferSize)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(props: Props) {
    super(false)
    this.buffer = new RingBuffer<T>(this.bufferSize)
  }
  setBufferSize(newSize: number, resetBuffer = true): void {
    this.bufferSize = newSize
    if (resetBuffer) this.buffer = new RingBuffer<T>(this.bufferSize)
  }
  copy(src: this): this {
    this.bufferSize = src.bufferSize
    this.buffer = new RingBuffer<T>(src.bufferSize)
    return this
  }
  reset(): void {
    this.buffer.clear()
  }
}
