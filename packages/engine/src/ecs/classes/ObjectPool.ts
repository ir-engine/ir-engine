/**
* Base class for entity and component pools
*/
export class ObjectPool<T> {
  /**
   * Objects in pool that are available for allocation
   * @todo: make this a sparse array or ring buffer
   */
  freeList: any[] = []

  /**
   * Current size of the pool
   */
  poolSize = 0

  /**
   * Type is set on construction
   */
  type: new(...args: any[]) => T

  // @todo Add initial size
  constructor (baseObject, initialSize?: number) {
    this.type = baseObject;
    if (typeof initialSize !== 'undefined') {
      this.expand(initialSize);
    }
  }

  /**
 * Get an object from the pool
 * @returns an available item
 */
  acquire (): T {
    // Grow the list by 20%ish if we're out
    if (this.freeList.length <= 0) {
      this.expand(Math.round(this.poolSize * 0.2) + 1);
    }

    const item = this.freeList.pop();

    return item;
  }

  /**
 * Put on object back in the pool
 */
  release (item: T): void {
    item && (item as any).reset();
    this.freeList.push(item);
  }

  /**
* Make the pool bigger
*/
  expand (count: number): void {
    for (let n = 0; n < count; n++) {
      const clone = new this.type() as any;
      clone._pool = this;
      this.freeList.push(clone);
    }
    this.poolSize += count;
  }
}
