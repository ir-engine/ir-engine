import { 
  addComponent as _addComponent,
  removeComponent as _removeComponent,
  hasComponent as _hasComponent,
  defineComponent,
  IComponent,
  Type
} from 'bitecs'

import { Entity } from '../classes/Entity'
import { World } from '../classes/World'

// TODO: benchmark map vs array for componentMap
// === createMappedComponent.ts === /
export const createMappedComponent = <T>(args: { [x: string]: Type } = {}) => {
  
  const componentMap = new Map<number, T>()
  // const componentMap = []
  const component = defineComponent(args) as IComponent & { 
    get: typeof componentMap.get, 
    set: typeof componentMap.set,
    delete: typeof componentMap.delete, 
  }

  Object.defineProperty(component, 'get', {
    value: function (eid: number) {
      // return componentMap[eid]
      return componentMap.get(eid)
    },
  })
  
  Object.defineProperty(component, 'set', {
    value: function(eid: number, value: any) {
      // componentMap[eid] = value
      return componentMap.set(eid, value)
    },
  })
  
  Object.defineProperty(component, 'delete', {
    value: function(eid: number, value: any) {
      // componentMap[eid] = undefined
      return componentMap.delete(eid)
    },
  })

  return component
}

type MappedComponent<T> = IComponent & { 
  get: (entity: number) => T,
  set: (entity: number, value: T) => Map<number, T>,
  delete: (entity: number) => void,
}

export const getComponent = <T extends any>(entity: Entity, component: MappedComponent<T>, getRemoved = false, world = World.defaultWorld.ecsWorld) => {
  if(getRemoved) return world.removedComponents.get(entity) ?? component.get(entity)
  return component.get(entity)
}

export const addComponent = <T extends any>(entity: Entity, component: MappedComponent<T>, args: any, world = World.defaultWorld.ecsWorld) => {
  _addComponent(world, component, entity)
  component.set(entity, args)
  return component.get(entity)
}

export const hasComponent = <T extends any>(entity: Entity, component: MappedComponent<T>, world = World.defaultWorld.ecsWorld) => {
  return _hasComponent(world, component, entity)
}

export const removeComponent = <T extends any>(entity: Entity, component: MappedComponent<T>, world = World.defaultWorld.ecsWorld) => {
  const componentRef = component.get(entity)
  world.removedComponents.set(entity, componentRef)
  _removeComponent(world, component, entity)
  return componentRef
}
