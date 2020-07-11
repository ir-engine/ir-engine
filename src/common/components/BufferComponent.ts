import { Component } from "ecsy"
import RingBuffer from "../classes/RingBuffer"

interface PropTypes<TInputMap, TValues> {
  data: TInputMap
  bufferSize?: number
  values: RingBuffer<TValues>
}

export default class BehaviorComponent<Props, TInputMap, TValues> extends Component<Props> {
  inputMap: TInputMap
  bufferSize = 10
  values: RingBuffer<TValues> = new RingBuffer<TValues>(this.bufferSize)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(props: Props) {
    super(false)
    this.values = new RingBuffer<TValues>(this.bufferSize)
  }
  setBufferSize(newSize: number, resetBuffer = true): void {
    this.bufferSize = newSize
    if (resetBuffer) this.values = new RingBuffer<TValues>(this.bufferSize)
  }
  copy(src: this): this {
    this.bufferSize = src.bufferSize
    this.values = new RingBuffer<TValues>(src.bufferSize)
    return this
  }
  reset(): void {
    this.values.clear()
  }
}
