import AxisValue from "../interfaces/AxisValue"

export class AxisBuffer {
  public static fromArray(data: AxisValue[], size = 0): AxisBuffer {
    const actionBuffer = new AxisBuffer(size)
    actionBuffer.fromArray(data, size === 0)
    return actionBuffer
  }

  private buffer: AxisValue[] = []
  private size: number
  private pos = 0

  public copy(): AxisBuffer {
    const newAxisBuffer = new AxisBuffer(this.getBufferLength())
    newAxisBuffer.buffer = this.buffer
    return newAxisBuffer
  }

  public clone(): AxisBuffer {
    const newAxisBuffer = new AxisBuffer(this.getBufferLength())
    newAxisBuffer.buffer = this.buffer
    return newAxisBuffer
  }

  constructor(size: number) {
    if (size < 0) {
      throw new RangeError("The size does not allow negative values.")
    }
    this.size = size
  }

  public getSize(): number {
    return this.size
  }

  public getPos(): number {
    return this.pos
  }

  public getBufferLength(): number {
    return this.buffer.length
  }

  public add(...items: AxisValue[]): void {
    items.forEach(item => {
      this.buffer[this.pos] = item
      this.pos = (this.pos + 1) % this.size
    })
  }

  public get(index: number): AxisValue | undefined {
    if (index < 0) {
      index += this.buffer.length
    }

    if (index < 0 || index > this.buffer.length) {
      return undefined
    }

    if (this.buffer.length < this.size) {
      return this.buffer[index]
    }

    return this.buffer[(this.pos + index) % this.size]
  }

  public getFirst(): AxisValue | undefined {
    return this.get(0)
  }

  public getLast(): AxisValue | undefined {
    return this.get(-1)
  }

  public remove(index: number, count = 1): AxisValue[] {
    if (index < 0) {
      index += this.buffer.length
    }

    if (index < 0 || index > this.buffer.length) {
      return []
    }

    const arr = this.toArray()
    const removedItems = arr.splice(index, count)
    this.fromArray(arr)
    return removedItems
  }

  public pop(): AxisValue {
    return this.remove(0)[0]
  }

  public popLast(): AxisValue {
    return this.remove(-1)[0]
  }

  public toArray(): AxisValue[] {
    return this.buffer.slice(this.pos).concat(this.buffer.slice(0, this.pos))
  }

  public fromArray(data: AxisValue[], resize = false): void {
    if (!Array.isArray(data)) {
      throw new TypeError("Input value is not an array.")
    }

    if (resize) this.resize(data.length)

    if (this.size === 0) return

    this.buffer = data.slice(-this.size)
    this.pos = this.buffer.length % this.size
  }

  public clear(): void {
    this.buffer = []
    this.pos = 0
  }

  public resize(newSize: number): void {
    if (newSize < 0) {
      throw new RangeError("The size does not allow negative values.")
    }

    if (newSize === 0) {
      this.clear()
    } else if (newSize !== this.size) {
      const currentBuffer = this.toArray()
      this.fromArray(currentBuffer.slice(-newSize))
      this.pos = this.buffer.length % newSize
    }

    this.size = newSize
  }

  public full(): boolean {
    return this.buffer.length === this.size
  }

  public empty(): boolean {
    return this.buffer.length === 0
  }
}
