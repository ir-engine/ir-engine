/**
* Base class for {@link ecs/classes/Entity.Entity | Entity} and {@link ecs/classes/Component.Component | Component} pools.
* @typeparam T {@link ecs/classes/Entity.Entity | Entity},
*     {@link ecs/classes/Component.Component | Component} or Subclass of any of these.
*/
export declare class ObjectPool<T> {
    /**
     * Objects in pool that are available for allocation.
     * @todo: make this a sparse array or ring buffer
     */
    freeList: any[];
    /**
     * Current size of the pool.
     */
    poolSize: number;
    /**
     * Type is set on construction.
     */
    type: new (...args: any[]) => T;
    /**
     * @param baseObject Type of the pool will be the type of this object.
     * @param initialSize Initial size of the pool when created.
     *
     * @typeparam T {@link ecs/classes/Entity.Entity | Entity},
     *     {@link ecs/classes/Component.Component | Component} or Subclass of any of these.
     * @todo Add initial size
     */
    constructor(baseObject: any, initialSize?: number);
    /**
     * Get an object from {@link freeList} of the pool.\
     * If {@link freeList} is empty then expands the pool first and them retrieves the object.
     *
     * @typeparam T {@link ecs/classes/Entity.Entity | Entity},
     *     {@link ecs/classes/Component.Component | Component} or Subclass of any of these.
     *
     * @returns an available item.
     */
    acquire(): T;
    /**
     * Put on object back in the pool.
     *
     * @param item Object to be released.
     * @typeparam T {@link ecs/classes/Entity.Entity | Entity},
     *     {@link ecs/classes/Component.Component | Component} or Subclass of any of these.
     */
    release(item: T): void;
    /**
    * Make the pool bigger.
    *
    * @param count Number of entities to increase.
    */
    expand(count: number): void;
}
