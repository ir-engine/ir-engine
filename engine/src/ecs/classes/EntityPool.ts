import { Entity } from "./Entity"
import { ObjectPool } from "./ObjectPool"
import { World } from "./World"

export class EntityPool extends ObjectPool<Entity> {
  type: any
  freeList: any
  count: any
  constructor() {
    super(World.options.entityClass, World.options.entityPoolSize)
  }

  expand(count) {
    for (let n = 0; n < count; n++) {
      const clone = new this.type()
      clone._pool = this
      this.freeList.push(clone)
    }
    this.count += count
  }
}
