import Actions from "../enums/Actions"
import { createType, copyCopyable, cloneClonable } from "ecsy"

export class ActionBuffer {
  public static fromArray(data: Actions[], size = 0): ActionBuffer {
    const actionBuffer = new ActionBuffer(size)
    actionBuffer.fromArray(data, size === 0)
    return actionBuffer
  }

  private buffer: Actions[] = []
  private size: number
  private pos = 0

  public copy(): ActionBuffer {
    const newActionBuffer = new ActionBuffer(this.getBufferLength())
    newActionBuffer.buffer = this.buffer
    return newActionBuffer
  }

  public clone(): ActionBuffer {
    const newActionBuffer = new ActionBuffer(this.getBufferLength())
    newActionBuffer.buffer = this.buffer
    return newActionBuffer
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

  public add(...items: Actions[]): void {
    items.forEach(item => {
      this.buffer[this.pos] = item
      this.pos = (this.pos + 1) % this.size
    })
  }

  public get(index: number): Actions | undefined {
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

  public getFirst(): Actions | undefined {
    return this.get(0)
  }

  public getLast(): Actions | undefined {
    return this.get(-1)
  }

  public remove(index: number, count = 1): Actions[] {
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

  public pop(): Actions {
    return this.remove(0)[0]
  }

  public popLast(): Actions {
    return this.remove(-1)[0]
  }

  public toArray(): Actions[] {
    return this.buffer.slice(this.pos).concat(this.buffer.slice(0, this.pos))
  }

  public fromArray(data: Actions[], resize = false): void {
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

export const ActionBufferType = createType({
  name: "ActionBuffer",
  default: new ActionBuffer(5),
  copy: copyCopyable,
  clone: cloneClonable
})
