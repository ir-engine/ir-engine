import { Entity } from "./Entity"
import { ObjectPool } from "./ObjectPool"
import { Engine } from "./Engine"

export class EntityPool extends ObjectPool<Entity> {
  type: any
  freeList: any
  count: any
  constructor() {
    super(Engine.options.entityClass, Engine.options.entityPoolSize)
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
