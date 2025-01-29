import { ResizableArray } from '../bitecsLegacy'
import { Entity } from '../Entity'

export const proxySoAStore = (storeGet: () => ResizableArray) => (entity: Entity, property: string, obj: object) => {
  const store = storeGet() // Get the store when the proxy is created as the store only exists after the component is defined
  return Object.defineProperty(obj, property, {
    get() {
      return store[entity]
    },
    set(n) {
      return (store[entity] = n)
    },
    enumerable: true,
    configurable: true
  })[property]
}
