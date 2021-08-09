import { 
  addComponent as _addComponent,
  removeComponent as _removeComponent,
  hasComponent as _hasComponent,
  removeEntity as _removeEntity,
  defineComponent,
  ComponentType,
  ISchema,
  Type,
  addEntity,
  getEntityComponents
} from 'bitecs'

import { Entity } from '../classes/Entity'
import { World } from '../classes/World'

// TODO: benchmark map vs array for componentMap
export const createMappedComponent = <T extends {}, S extends ISchema = {}>(schema?: S, defaultValues = {}) => {
  
  const component = defineComponent(schema)
  const componentMap = new Map<number, T & SoAProxy<S>>()
  // const componentMap = []

  Object.defineProperty(component, '_default', {
    value: defaultValues
  })
  
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

export type SoAProxy<S extends ISchema> = { [key in keyof S]: 
  S[key] extends Type ? number
    : S[key] extends [infer RT, number]
    ? RT extends Type
      ? Array<number>
      : unknown
    : S[key] extends ISchema
    ? SoAProxy<S[key]>
    : unknown;
}

export type MappedComponent<T, S extends ISchema> = ComponentType<S> & { 
  get: (entity: number) => T & SoAProxy<S>,
  set: (entity: number, value: T) => void,
  delete: (entity: number) => void,
}

export const createEntity = (world = World.defaultWorld.ecsWorld): Entity => {
  return addEntity(world)
}

export const removeEntity = (entity: Entity, world = World.defaultWorld.ecsWorld) => {
  _removeEntity(world, entity)
  // TODO: remove mapped component data
}

export type ComponentConstructor<T, S extends ISchema> = MappedComponent<T, S>

export const getComponent = <T extends any, S extends ISchema>(entity: Entity, component: MappedComponent<T, S>, getRemoved = false, world = World.defaultWorld.ecsWorld): T & SoAProxy<S> => {
  if(getRemoved) return world._removedComponents.get(entity) ?? component.get(entity)
  return component.get(entity)
}

export const addComponent = <T extends any, S extends ISchema>(entity: Entity, component: MappedComponent<T, S>, args: T, world = World.defaultWorld.ecsWorld) => {
  _addComponent(world, component, entity)
  component.set(entity, Object.assign({}, args, component._default))
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

export const removeAllComponents = (entity: Entity, world = World.defaultWorld.ecsWorld) => {
  for(const component of getEntityComponents(world, entity)) {
    _removeComponent(world, component, entity)
    // TODO: remove mapped component data
  }
}

export const removeAllEntities = (world = World.defaultWorld.ecsWorld) => {
 // TODO
}