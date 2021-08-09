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
export const createMappedComponent = <T, S extends ISchema = {}>(schema?: S) => {
  
  const component = defineComponent(schema)
  const componentMap = new Map<number, T & { [K in keyof S]: typeof component[K] }>()
  // const componentMap = []

  Object.defineProperty(component, 'get', {
    value: function (eid: number) {
      // return componentMap[eid]
      return componentMap.get(eid)
    },
  })
  
  Object.defineProperty(component, 'set', {
    value: function(eid: number, value: any) {
      if(schema) {
        Object.defineProperties(value, Object.keys(schema).reduce((a,k) => {
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

export type SoAProxy<S extends ISchema> = { [K in keyof S]: ComponentType<S>[K] }

export type MappedComponent<T, S extends ISchema> = ComponentType<S> & { 
  get: (entity: number) => T & SoAProxy<S>,
  set: (entity: number, value: T) => void,
  delete: (entity: number) => void,
}

export const getComponent = <T extends any, S extends ISchema>(entity: Entity, component: MappedComponent<T, S>, getRemoved = false, world = World.defaultWorld.ecsWorld): T & SoAProxy<S> => {
  if(getRemoved) return world._removedComponents.get(entity) ?? component.get(entity)
  return component.get(entity)
}

export const addComponent = <T extends any, S extends ISchema>(entity: Entity, component: MappedComponent<T, S>, args: T, world = World.defaultWorld.ecsWorld) => {
  _addComponent(world, component, entity)
  component.set(entity, args)
  return component.get(entity)
}

export const hasComponent = <T extends any, S extends ISchema>(entity: Entity, component: MappedComponent<T, S>, world = World.defaultWorld.ecsWorld) => {
  return _hasComponent(world, component, entity)
}

export const removeComponent = <T extends any, S extends ISchema>(entity: Entity, component: MappedComponent<T, S>, world = World.defaultWorld.ecsWorld) => {
  const componentRef = component.get(entity)
  world._removedComponents.set(entity, componentRef)
  _removeComponent(world, component, entity)
  return componentRef
}
