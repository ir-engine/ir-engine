import * as bitECS from 'bitecs'
import { Entity } from '../classes/Entity'
import { useWorld } from './SystemHooks'

export const ComponentMap = new Map<string, ComponentType<any>>()

// TODO: benchmark map vs array for componentMap
export const createMappedComponent = <T extends {}, S extends bitECS.ISchema = bitECS.ISchema>(
  name: string,
  schema?: S
) => {
  const component = bitECS.defineComponent(schema)
  const componentMap = new Map<number, T & SoAProxy<S>>()
  // const componentMap = []

  if (schema) {
    Object.defineProperty(component, '_schema', {
      value: schema
    })
  }
  Object.defineProperty(component, '_map', {
    value: componentMap
  })
  Object.defineProperty(component, '_name', {
    value: name,
    enumerable: true
  })
  Object.defineProperty(component, 'get', {
    value: function (eid: number) {
      // return componentMap[eid]
      return componentMap.get(eid)
    }
  })
  Object.defineProperty(component, 'set', {
    value: function (eid: number, value: any) {
      if (schema) {
        Object.defineProperties(
          value,
          Object.keys(schema).reduce((a, k) => {
            a[k] = {
              get() {
                return component[k][eid]
              },
              set(val) {
                component[k][eid] = val
              }
            }
            return a
          }, {})
        )
      }
      // componentMap[eid] = value
      return componentMap.set(eid, value)
    }
  })
  Object.defineProperty(component, 'delete', {
    value: function (eid: number) {
      // componentMap[eid] = undefined
      return componentMap.delete(eid)
    }
  })

  ComponentMap.set(name, component)

  return component as MappedComponent<T, S>
}

export type SoAProxy<S extends bitECS.ISchema> = {
  [key in keyof S]: S[key] extends bitECS.Type
    ? number
    : S[key] extends [infer RT, number]
    ? RT extends bitECS.Type
      ? Array<number>
      : unknown
    : S[key] extends bitECS.ISchema
    ? SoAProxy<S[key]>
    : unknown
}

export type MappedComponent<T, S extends bitECS.ISchema> = bitECS.ComponentType<S> & {
  get: (entity: number) => T & SoAProxy<S>
  set: (entity: number, value: T & SoAProxy<S>) => void
  delete: (entity: number) => void
}

export type ComponentConstructor<T, S extends bitECS.ISchema> = MappedComponent<T, S>
export type ComponentType<C extends MappedComponent<any, any>> = ReturnType<C['get']>

export const getComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: MappedComponent<T, S>
  // getRemoved = false,
  // world = useWorld()
): T & SoAProxy<S> => {
  if (typeof entity === 'undefined') {
    throw new Error('[getComponent]: entity is undefined')
  }
  return component.get(entity)
  // if (getRemoved || hasComponent(entity, component, world)) return component.get(entity)
}

export const addComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: MappedComponent<T, S>,
  args: T & Partial<SoAProxy<S>>,
  world = useWorld()
) => {
  if (typeof entity === 'undefined') {
    throw new Error('[addComponent]: entity is undefined')
  }
  bitECS.addComponent(world, component, entity)
  if ((component as any)._schema) {
    for (const [key] of Object.entries((component as any)._schema as any)) {
      component[key][entity] = args[key]
    }
  }
  world._removedComponents.get(entity)?.delete(component)
  component.set(entity, args as T & SoAProxy<S>)
  return component.get(entity)
}

export const hasComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: MappedComponent<T, S>,
  world = useWorld()
) => {
  if (typeof entity === 'undefined') {
    throw new Error('[hasComponent]: entity is undefined')
  }
  // return typeof component.get(entity) !== 'undefined'
  return bitECS.hasComponent(world, component, entity)
}

export const removeComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: MappedComponent<T, S>,
  world = useWorld()
) => {
  if (typeof entity === 'undefined') {
    console.warn('[removeComponent]: entity is undefined')
    return
  }
  const componentRef = component.get(entity)
  const removed = world._removedComponents.get(entity) ?? new Set()
  world._removedComponents.set(entity, removed.add(component))
  bitECS.removeComponent(world, component, entity)
  return componentRef
}

export const getAllComponentsOfType = <T, S extends bitECS.ISchema>(
  component: MappedComponent<T, S>,
  world = useWorld()
): T[] => {
  const query = defineQuery([component])
  const entities = query(world)
  return entities.map((e) => {
    return getComponent(e, component)!
  })
}

export const getAllEntitiesWithComponent = <T, S extends bitECS.ISchema>(
  component: MappedComponent<T, S>,
  world = useWorld()
): Entity[] => {
  const query = defineQuery([component])
  return query(world)
}

export const removeAllComponents = (entity: Entity, world = useWorld()) => {
  for (const component of bitECS.getEntityComponents(world, entity)) {
    removeComponent(entity, component as MappedComponent<any, any>, world)
  }
}

export function defineQuery(components: (bitECS.Component | bitECS.QueryModifier)[]) {
  const query = bitECS.defineQuery(components) as bitECS.Query
  const enterQuery = bitECS.enterQuery(query)
  const exitQuery = bitECS.exitQuery(query)
  const wrappedQuery = (world = useWorld()) => query(world) as Entity[]
  wrappedQuery.enter = (world = useWorld()) => enterQuery(world) as Entity[]
  wrappedQuery.exit = (world = useWorld()) => exitQuery(world) as Entity[]
  return wrappedQuery
}

export type Query = ReturnType<typeof defineQuery>
