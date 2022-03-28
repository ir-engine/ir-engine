import { Entity } from './Entity'

export class OriginTable {
  registry: Map<Entity, Map<any, any>>
  constructor() {
    this.registry = new Map()
  }

  tryReg(entity: Entity): Map<any, any> {
    const register = this.registry
    if (register) {
      if (!register.has(entity)) {
        register.set(entity, new Map())
      }
      const result = register.get(entity)
      if (result) return result
      else return new Map()
    }
    return new Map()
  }

  register(entity: Entity, source: any, subject: any): void {
    const entry = this.tryReg(entity)
    if (entry.has(subject)) {
      throw Error('origin table already has subject registered')
    }
    entry.set(subject, source)
  }

  check(entity: Entity, subject: any): boolean {
    return this.tryReg(entity).has(subject)
  }

  remove(entity: Entity, subject: any): void {
    this.tryReg(entity).delete(subject)
  }
}
