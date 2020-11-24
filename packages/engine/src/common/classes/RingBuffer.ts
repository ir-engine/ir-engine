export class RingBuffer<T> {
  public static fromArray<T>(data: T[], size = 0): RingBuffer<T> {
    const actionBuffer = new RingBuffer<T>(size);
    actionBuffer.fromArray(data, size === 0);
    return actionBuffer;
  }

  private buffer: T[] = []
  private size: number
  private pos = 0

  public copy (): RingBuffer<T> {
    const newAxisBuffer = new RingBuffer<T>(this.getBufferLength());
    newAxisBuffer.buffer = this.buffer;
    return newAxisBuffer;
  }

  public clone (): RingBuffer<T> {
    const newAxisBuffer = new RingBuffer<T>(this.getBufferLength());
    newAxisBuffer.buffer = this.buffer;
    return newAxisBuffer;
  }

  constructor (size: number) {
    if (size < 0) {
      throw new RangeError('The size does not allow negative values.');
    }
    this.size = size;
  }

  public getSize (): number {
    return this.size;
  }

  public getPos (): number {
    return this.pos;
  }

  public getBufferLength (): number {
    return this.buffer.length;
  }

  public add (...items: T[]): void {
    items.forEach(item => {
      this.buffer[this.pos] = item;
      this.pos = (this.pos + 1) % this.size;
    });
  }

  public get (index: number): T | undefined {
    if (index < 0) {
      index += this.buffer.length;
    }

    if (index < 0 || index > this.buffer.length) {
      return undefined;
    }

    if (this.buffer.length < this.size) {
      return this.buffer[index];
    }

    return this.buffer[(this.pos + index) % this.size];
  }

  public getFirst (): T | undefined {
    return this.get(0);
  }

  public getLast (): T | undefined {
    return this.get(-1);
  }

  public remove (index: number, count = 1): T[] {
    if (index < 0) {
      index += this.buffer.length;
    }

    if (index < 0 || index > this.buffer.length) {
      return [];
    }

    const arr = this.toArray();
    const removedItems = arr.splice(index, count);
    this.fromArray(arr);
    return removedItems;
  }

  public pop (): T {
    return this.remove(0)[0];
  }

  public popLast (): T {
    return this.remove(-1)[0];
  }

  public toArray (): T[] {
    return this.buffer.slice(this.pos).concat(this.buffer.slice(0, this.pos));
  }

  public fromArray (data: T[], resize = false): void {
    if (!Array.isArray(data)) {
      throw new TypeError('Input value is not an array.');
    }

    if (resize) this.resize(data.length);

    if (this.size === 0) return;

    this.buffer = data.slice(-this.size);
    this.pos = this.buffer.length % this.size;
  }

  public clear (): void {
    this.buffer = [];
    this.pos = 0;
  }

  public resize (newSize: number): void {
    if (newSize < 0) {
      throw new RangeError('The size does not allow negative values.');
    }

    if (newSize === 0) {
      this.clear();
    } else if (newSize !== this.size) {
      const currentBuffer = this.toArray();
      this.fromArray(currentBuffer.slice(-newSize));
      this.pos = this.buffer.length % newSize;
    }

    this.size = newSize;
  }

  public full (): boolean {
    return this.buffer.length === this.size;
  }

  public empty (): boolean {
    return this.buffer.length === 0;
  }
}
