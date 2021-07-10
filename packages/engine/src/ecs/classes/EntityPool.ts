import { Entity } from './Entity'
import { ObjectPool } from './ObjectPool'
import { Engine } from './Engine'

/**
 * Pool of entities that grows as needed.\
 * Entities are pulled from the pool on {@link ecs/functions/EntityFunctions.createEntity | createEntity()},
 * and added to the pool on {@link ecs/functions/EntityFunctions.removeEntity | removeEntity()}.
 *
 * @author Fernando Serrano, Robert Long
 */
export class EntityPool extends ObjectPool<Entity> {
  /**
   * List of free entities in the pool.
   * @todo: maybe convert to a sparse map
   *
   * @author Fernando Serrano, Robert Long
   */
  freeList: any = []

  /**
   * Constructs Entity pool with given type.
   *
   * @author Fernando Serrano, Robert Long
   * @param type Type of the pool.
   */
  constructor(type) {
    super(type, Engine.options.entityPoolSize)
  }

  /**
   * Expand the size of the pool with more entities.
   *
   * @author Fernando Serrano, Robert Long
   * @param count Number of entities to increase.
   */
  public expand(count: number): void {
    for (let n = 0; n < count; n++) {
      const clone = new this.type()
      ;(clone as any)._pool = this
      this.freeList.push(clone)
    }
    this.poolSize += count
  }
}
