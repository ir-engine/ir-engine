import { Entity } from './Entity';
import { ObjectPool } from './ObjectPool';
import { Engine } from './Engine';

/**
   * Pool of entities that grows as needed
   * Entities are pulled from the pool on createEntity,
   * and added to the pool on removeEntity
   */
export class EntityPool extends ObjectPool<Entity> {
  /**
   * Type of pool
   * @todo we can probably remove this
   */
  type: any

  /**
   * List of free entities in the pool
   * @todo: maybe convert to a sparse map
   */
  freeList: any = []

  /**
   * Current total size of the entity pool
   */
  poolSize: number

  constructor (type) {
    super(type, Engine.options.entityPoolSize);
  }

  /**
   * Expand the size of the pool with more entities
   */
  public expand (count) {
    for (let n = 0; n < count; n++) {
      const clone = new this.type();
      clone._pool = this;
      this.freeList.push(clone);
    }
    this.poolSize += count;
  }
}
