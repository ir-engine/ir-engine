/**
 * Ring buffer holds data in circular form.\
 * Data will be inserted in linear fashion and when the buffer reaches its maximum size then
 * newly entered data will be overwrite first element(s).
 *
 * ```
 * // Below will create ring buffer with 4 elements and sets size of the buffer to 4.
 * const buffer = RingBuffer.fromArray([1, 2, 3, 4]);
 *
 * // Adding new elements will overweight element(s) in FIFO manner.
 * buffer.add(5, 6); // now buffer contains [5, 6, 3, 4]
 * ```
 *
 * @typeparam T Type of the data.
 */
export class RingBuffer<T> {
  /**
   * Create ring buffer from array.
   * @param data Array of element(s).
   * @param size Size of ring array.
   */
  public static fromArray<T>(data: T[], size = 0): RingBuffer<T> {
    const actionBuffer = new RingBuffer<T>(size)
    actionBuffer.fromArray(data, size === 0)
    return actionBuffer
  }

  /** Buffer to hold element(s). */
  private buffer: T[] = []
  /** Maximum number of elements this buffer can contain. */
  private size: number
  /** Current position on the ring buffer. */
  private pos = 0

  /**
   * Create new ring buffer and copy elements from this ring buffer.
   *
   * @returns Newly created ring buffer.
   */
  public copy(): RingBuffer<T> {
    const newAxisBuffer = new RingBuffer<T>(this.getBufferLength())
    newAxisBuffer.buffer = this.buffer
    return newAxisBuffer
  }

  /**
   * Create new ring buffer and copy elements from this ring buffer.
   *
   * @returns Newly created ring buffer.
   */
  public clone(): RingBuffer<T> {
    const newAxisBuffer = new RingBuffer<T>(this.getBufferLength())
    newAxisBuffer.buffer = this.buffer
    return newAxisBuffer
  }

  /** Constructs ring buffer of given size */
  constructor(size: number) {
    if (size < 0) {
      throw new RangeError('The size does not allow negative values.')
    }
    this.size = size
  }

  /** @returns size of the ring buffer. */
  public getSize(): number {
    return this.size
  }

  /** @returns current position on the ring buffer. */
  public getPos(): number {
    return this.pos
  }

  /** @returns count of elements in the ring buffer. */
  public getBufferLength(): number {
    return this.buffer.length
  }

  /**
   * Add element(s) into the ring buffer.\
   * If overflow happens then element(s) will be overwritten by FIFO manner.
   * @param items list of element(s) to be inserted.
   */
  public add(...items: T[]): void {
    items.forEach((item) => {
      this.buffer[this.pos] = item
      this.pos = (this.pos + 1) % this.size
    })
  }

  /**
   * Get element at given index from ring buffer.
   * @param index Index of the element which will be retrieved.
   * @returns Element in the given index or undefined if not found.
   */
  public get(index: number): T | undefined {
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

  /**
   * Get first element from the ring buffer.
   * @returns First element of ring buffer.
   */
  public getFirst(): T | undefined {
    return this.get(0)
  }

  /**
   * Get last element from the ring buffer.
   * @returns Last element of ring buffer.
   */
  public getLast(): T | undefined {
    return this.get(-1)
  }

  /**
   * Remove element(s) from the ring buffer.
   * @param index Index From which element(s) will be removed.
   * @param count Number of element(s) to be removed.
   * @returns Array of removed element(s).
   */
  public remove(index: number, count = 1): T[] {
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

  /** Remove and return element from current position.
   *
   * @returns Removed element from current position.
   */
  public pop(): T {
    return this.remove(0)[0]
  }

  /** Remove and return last element from ring buffer.
   *
   * @returns last element from ring buffer.
   */
  public popLast(): T {
    return this.remove(-1)[0]
  }

  /**
   * Generates array from ring buffer.
   *
   * @returns generated array containing ring buffer elements.
   */
  public toArray(): T[] {
    return this.buffer.slice(this.pos).concat(this.buffer.slice(0, this.pos))
  }

  /**
   * Fill up the ring buffer with array elements.\
   * If array contains more element than size of ring buffer then excess elements will not be included in array.
   * To include every elements set **```resize```** to **```true```**.
   * @param data Array containing elements.
   * @param resize Whether resize current ring buffer.
   */
  public fromArray(data: T[], resize = false): void {
    if (!Array.isArray(data)) {
      throw new TypeError('Input value is not an array.')
    }

    if (resize) this.resize(data.length)

    if (this.size === 0) return

    this.buffer = data.slice(-this.size)
    this.pos = this.buffer.length % this.size
  }

  /** Clear the ring buffer. */
  public clear(): void {
    this.buffer = []
    this.pos = 0
  }

  /**
   * Resize ring buffer with given size.
   * @param newSize new size of the buffer.
   */
  public resize(newSize: number): void {
    if (newSize < 0) {
      throw new RangeError('The size does not allow negative values.')
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

  /** @returns Whether the buffer is full or not. */
  public full(): boolean {
    return this.buffer.length === this.size
  }

  /** @returns Whether the buffer is empty or not. */
  public empty(): boolean {
    return this.buffer.length === 0
  }
}
