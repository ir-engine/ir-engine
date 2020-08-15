export class ObjectPool<T> {
  freeList: any[]
  count: number
  isObjectPool: boolean
  type: { new (...args: any[]): T }
  // @todo Add initial size
  constructor(baseObject: any, initialSize?: number) {
    this.type = baseObject
    this.freeList = []
    this.count = 0
    this.isObjectPool = true

    if (typeof initialSize !== "undefined") {
      this.expand(initialSize)
    }
  }

  acquire(): T {
    // Grow the list by 20%ish if we're out
    if (this.freeList.length <= 0) {
      this.expand(Math.round(this.count * 0.2) + 1)
    }

    const item = this.freeList.pop()

    return item
  }

  release(item: T): void {
    item && (item as any).reset()
    this.freeList.push(item)
  }

  expand(count: number): void {
    for (let n = 0; n < count; n++) {
      const clone = new this.type()
      ;(clone as any)._pool = this
      this.freeList.push(clone)
    }
    this.count += count
  }

  totalSize(): number {
    return this.count
  }

  totalFree(): number {
    return this.freeList.length
  }

  totalUsed(): number {
    return this.count - this.freeList.length
  }
}
