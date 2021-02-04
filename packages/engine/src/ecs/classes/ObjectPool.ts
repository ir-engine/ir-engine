/**
* Base class for {@link ecs/classes/Entity.Entity | Entity} and {@link ecs/classes/Component.Component | Component} pools.
* @typeparam T {@link ecs/classes/Entity.Entity | Entity},
*     {@link ecs/classes/Component.Component | Component} or Subclass of any of these.
*/
export class ObjectPool<T> {
  /**
   * Objects in pool that are available for allocation.
   * @todo: make this a sparse array or ring buffer
   */
  freeList: any[] = []

  /**
   * Current size of the pool.
   */
  poolSize = 0

  /**
   * Type is set on construction.
   */
  type: new(...args: any[]) => T

  /**
   * @param baseObject Type of the pool will be the type of this object.
   * @param initialSize Initial size of the pool when created.
   * 
   * @typeparam T {@link ecs/classes/Entity.Entity | Entity},
   *     {@link ecs/classes/Component.Component | Component} or Subclass of any of these.
   * @todo Add initial size
   */
  constructor (baseObject, initialSize?: number) {
    this.type = baseObject;
    if (typeof initialSize !== 'undefined') {
      this.expand(initialSize);
    }
  }

  /**
   * Get an object from {@link freeList} of the pool.\
   * If {@link freeList} is empty then expands the pool first and them retrieves the object.
   * 
   * @typeparam T {@link ecs/classes/Entity.Entity | Entity},
   *     {@link ecs/classes/Component.Component | Component} or Subclass of any of these.
   *
   * @returns an available item.
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
   * Put on object back in the pool.
   * 
   * @param item Object to be released.
   * @typeparam T {@link ecs/classes/Entity.Entity | Entity},
   *     {@link ecs/classes/Component.Component | Component} or Subclass of any of these.
   */
  release (item: T): void {
    item && (item as any).reset();
    this.freeList.push(item);
  }

  /**
  * Make the pool bigger.
  *
  * @param count Number of entities to increase.
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
