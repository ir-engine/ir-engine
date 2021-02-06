import { Entity } from './Entity';
import { ObjectPool } from './ObjectPool';
/**
   * Pool of entities that grows as needed.\
   * Entities are pulled from the pool on {@link ecs/functions/EntityFunctions.createEntity | createEntity()},
   * and added to the pool on {@link ecs/functions/EntityFunctions.removeEntity | removeEntity()}.
   */
export declare class EntityPool extends ObjectPool<Entity> {
    /**
     * Type of the pool.
     * @todo we can probably remove this
     */
    type: any;
    /**
     * List of free entities in the pool.
     * @todo: maybe convert to a sparse map
     */
    freeList: any;
    /**
     * Current total size of the entity pool.
     */
    poolSize: number;
    /**
     * Constructs Entity pool with given type.
     * @param type Type of the pool.
     */
    constructor(type: any);
    /**
     * Expand the size of the pool with more entities.
     *
     * @param count Number of entities to increase.
     */
    expand(count: number): void;
}
