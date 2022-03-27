export class OriginTable {
  registry: Map<any, any>
  constructor() {
    this.registry = new Map()
  }

  register(source: any, subject: any): void {
    if (this.registry.has(subject)) {
      throw Error('origin table already has subject registered')
    }
    this.registry.set(subject, source)
  }

  check(subject: any): boolean {
    return this.registry.has(subject)
  }

  remove(subject: any): void {
    this.registry.delete(subject)
  }
}
