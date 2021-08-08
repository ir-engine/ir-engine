import { 
  addComponent as _addComponent,
  removeComponent as _removeComponent,
  hasComponent as _hasComponent,
  defineComponent,
  ComponentType,
  IComponent,
  ISchema,
  Type
} from 'bitecs'

import { Entity } from '../classes/Entity'
import { World } from '../classes/World'

// TODO: benchmark map vs array for componentMap
export const createMappedComponent = <T>(args: { [x: string]: Type }) => {
  
  const componentMap = new Map<number, T & { [K in keyof typeof args]: typeof component[K] }>()
  // const componentMap = []
  const component = defineComponent(args)

  Object.defineProperty(component, 'get', {
    value: function (eid: number) {
      // return componentMap[eid]
      return componentMap.get(eid)
    },
  })
  
  Object.defineProperty(component, 'set', {
    value: function(eid: number, value: any) {
      if(args) {
        Object.defineProperties(value, Object.keys(args).reduce((a,k) => {
          a[k] = {
            get() {
              return component[k][eid]
            },
            set(val) {
              component[k][eid] = val
            }
          }
          return a
        }, {}))
      }
      // componentMap[eid] = value
      return componentMap.set(eid, value)
    },
  })
  
  Object.defineProperty(component, 'delete', {
    value: function(eid: number) {
      // componentMap[eid] = undefined
      return componentMap.delete(eid)
    },
  })

  return component as typeof component & { 
    get: typeof componentMap.get, 
    set: typeof componentMap.set,
    delete: typeof componentMap.delete,
  }
}


// interface createMappedComponent<T, A extends ISchema>{
//   (args: A): ComponentType<A> & { 
//       get: (entity: number) => T & { [K in keyof A]: A[K] },
//       set: (entity: number, value: T) => Map<number, T & { [K in keyof A]: A[K] }>,
//       delete: (entity: number) => void
//   }
// }

// export type MappedComponent = ReturnType<typeof createMappedComponent>

export type MappedComponent<T, A> = ComponentType<A> & { 
  get: (entity: number) => T & { [K in keyof A]: A[K] },
  set: (entity: number, value: T) => Map<number, T & { [K in keyof A]: A[K] }>,
  delete: (entity: number) => void,
}

export const getComponent = <T extends any, A>(entity: Entity, component: MappedComponent<T, A>, getRemoved = false, world = World.defaultWorld.ecsWorld): T & { [K in keyof A]: A[K] } => {
  if(getRemoved) return world._removedComponents.get(entity) ?? component.get(entity)
  return component.get(entity)
}

export const addComponent = <T extends any, A>(entity: Entity, component: MappedComponent<T, A>, args: T, world = World.defaultWorld.ecsWorld) => {
  _addComponent(world, component, entity)
  component.set(entity, args)
  return component.get(entity)
}

export const hasComponent = <T extends any, A>(entity: Entity, component: MappedComponent<T, A>, world = World.defaultWorld.ecsWorld) => {
  return _hasComponent(world, component, entity)
}

export const removeComponent = <T extends any, A>(entity: Entity, component: MappedComponent<T, A>, world = World.defaultWorld.ecsWorld) => {
  const componentRef = component.get(entity)
  world._removedComponents.set(entity, componentRef)
  _removeComponent(world, component, entity)
  return componentRef
}
