import { State } from '@speigg/hookstate'
import * as bitECS from 'bitecs'
import { ArrayByType, ISchema, Type } from 'bitecs'

import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'

const INITIAL_COMPONENT_SIZE = 1000 // TODO set to 0 after next bitECS update
bitECS.setDefaultSize(1000)

/**
 * @todo move this to engine scope
 */
export const ComponentMap = new Map<string, ComponentType<any>>()
globalThis.ComponentMap = ComponentMap

// New Experimental API
export const defineMappedComponent = (name: string) => {
  return new MappedComponentSetupAPI(name) // class needed for correct chained typing
}
export class MappedComponentSetupAPI<_Schema extends bitECS.ISchema = any, _Type = any> {
  constructor(public name: string) {}
  default?: _Type
  schema?: _Schema

  withSchema<Schema extends bitECS.ISchema = {}>(schema: Schema) {
    this.schema = schema as any
    return this as any as MappedComponentSetupAPI<Schema, _Type>
  }

  withType<T extends any>(defaultState?: T) {
    this.default = defaultState as any
    return this as any as MappedComponentSetupAPI<_Schema, T>
  }

  withReactiveType<T extends any>(defaultState?: T) {
    this.default = defaultState as any
    return this as any as MappedComponentSetupAPI<_Schema, State<T>>
  }

  build() {
    const component = bitECS.defineComponent(this.schema, INITIAL_COMPONENT_SIZE)
    const componentMap = new Map<number, _Type & SoAProxy<_Schema>>()
    const componentMapOldValues = new Map<number, _Type & SoAProxy<_Schema>>()
    // const componentMap = []

    Object.defineProperty(component, '_name', {
      value: this.name
    })
    Object.defineProperty(component, '_schema', {
      value: this.schema
    })
    Object.defineProperty(component, '_default', {
      value: this.default
    })
    Object.defineProperty(component, '_map', {
      value: componentMap
    })
    Object.defineProperty(component, 'get', {
      value: function (eid: number) {
        return componentMap.get(eid)
      }
    })
    Object.defineProperty(component, 'set', {
      value: function (eid: number, value: any) {
        if (this.schema) {
          Object.defineProperties(
            value,
            Object.keys(this.schema).reduce((a, k) => {
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
        return componentMap.set(eid, value)
      }
    })
    Object.defineProperty(component, '_getPrevious', {
      value: function (eid: number) {
        // return componentMap[eid]
        return componentMapOldValues.get(eid)
      }
    })
    Object.defineProperty(component, '_setPrevious', {
      value: function (eid: number, value: any) {
        // return componentMap[eid]
        return componentMapOldValues.set(eid, value)
      }
    })
    Object.defineProperty(component, 'delete', {
      value: function (eid: number) {
        return componentMap.delete(eid)
      }
    })

    Object.defineProperty(component, 'isReactive', {
      value: true,
      enumerable: true
    })

    ComponentMap.set(this.name, component)
    return component as MappedComponent<_Type, _Schema>
  }
}

// TODO: benchmark map vs array for componentMap
export const createMappedComponent = <T, S extends bitECS.ISchema = {}>(name: string, schema?: S) => {
  const component = bitECS.defineComponent(schema, INITIAL_COMPONENT_SIZE)
  const componentMap = new Map<number, T & SoAProxy<S>>()
  const componentMapOldValues = new Map<number, T & SoAProxy<S>>()
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
  Object.defineProperty(component, '_getPrevious', {
    value: function (eid: number) {
      // return componentMap[eid]
      return componentMapOldValues.get(eid)
    }
  })
  Object.defineProperty(component, '_setPrevious', {
    value: function (eid: number, value: any) {
      // return componentMap[eid]
      return componentMapOldValues.set(eid, value)
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

export type SoAComponentType<T extends ISchema> = {
  [key in keyof T]: T[key] extends Type
    ? ArrayByType[T[key]]
    : T[key] extends [infer RT, number]
    ? RT extends Type
      ? Array<ArrayByType[RT]>
      : never
    : T[key] extends ISchema
    ? SoAComponentType<T[key]>
    : never
}

export type MappedComponent<T, S extends bitECS.ISchema> = SoAComponentType<S> & {
  get: (entity: number) => T & SoAProxy<S>
  set: (entity: number, value: T & SoAProxy<S>) => void
  delete: (entity: number) => void
  isReactive: boolean
  readonly _name: string
}

export type ComponentConstructor<T, S extends bitECS.ISchema> = MappedComponent<T, S>
export type ComponentType<C extends MappedComponent<any, any>> = ReturnType<C['get']>

export const getComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: MappedComponent<T, S>,
  getRemoved = false,
  world = Engine.instance.currentWorld
): T & SoAProxy<S> => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[getComponent]: entity is undefined')
  }
  if (typeof world === 'undefined' || world === null) {
    throw new Error('[getComponent]: world is undefined')
  }
  if (getRemoved) return (component as any)._getPrevious(entity)
  if (bitECS.hasComponent(world, component, entity)) return component.get(entity)
  return null!
}

export const addComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: MappedComponent<T, S>,
  args: T,
  world = Engine.instance.currentWorld
) => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[addComponent]: entity is undefined')
  }
  if (typeof world === 'undefined' || world === null) {
    throw new Error('[addComponent]: world is undefined')
  }
  if (hasComponent(entity, component, world)) throw new Error(`${component._name} already exists on entity ${entity}`)
  bitECS.addComponent(world, component, entity, false) // don't clear data on-add
  if ((component as any)._schema) {
    for (const [key] of Object.entries((component as any)._schema as any)) {
      component[key][entity] = args[key]
    }
  }
  component.set(entity, args as T & SoAProxy<S>)
  return component.get(entity)
}

export const hasComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: MappedComponent<T, S>,
  world = Engine.instance.currentWorld
) => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[hasComponent]: entity is undefined')
  }
  return bitECS.hasComponent(world, component, entity)
}

export const getOrAddComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: MappedComponent<T, S>,
  args: T,
  getRemoved = false,
  world = Engine.instance.currentWorld
) => {
  return hasComponent(entity, component, world)
    ? getComponent(entity, component, getRemoved, world)
    : addComponent(entity, component, args, world)
}

export const removeComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: MappedComponent<T, S>,
  world = Engine.instance.currentWorld
) => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[removeComponent]: entity is undefined')
  }
  if (typeof world === 'undefined' || world === null) {
    throw new Error('[removeComponent]: world is undefined')
  }
  ;(component as any)._setPrevious(entity, getComponent(entity, component, false, world))
  bitECS.removeComponent(world, component, entity, true) // clear data on-remove
}

export const getAllComponents = (
  entity: Entity,
  world = Engine.instance.currentWorld
): ComponentConstructor<any, any>[] => {
  return bitECS.getEntityComponents(world, entity) as ComponentConstructor<any, any>[]
}

export const getComponentCountOfType = <T, S extends bitECS.ISchema>(
  component: MappedComponent<T, S>,
  world = Engine.instance.currentWorld
): number => {
  const query = defineQuery([component])
  return query(world).length
}

export const getAllComponentsOfType = <T, S extends bitECS.ISchema>(
  component: MappedComponent<T, S>,
  world = Engine.instance.currentWorld
): T[] => {
  const query = defineQuery([component])
  const entities = query(world)
  return entities.map((e) => {
    return getComponent(e, component)!
  })
}

export const removeAllComponents = (entity: Entity, world = Engine.instance.currentWorld) => {
  try {
    for (const component of bitECS.getEntityComponents(world, entity)) {
      removeComponent(entity, component as MappedComponent<any, any>, world)
    }
  } catch (_) {
    console.warn('Components of entity already removed')
  }
}

export function defineQuery(components: (bitECS.Component | bitECS.QueryModifier)[]) {
  const query = bitECS.defineQuery([...components, bitECS.Not(EntityRemovedComponent)]) as bitECS.Query
  const enterQuery = bitECS.enterQuery(query)
  const exitQuery = bitECS.exitQuery(query)
  const wrappedQuery = (world = Engine.instance.currentWorld) => query(world) as Entity[]
  wrappedQuery.enter = (world = Engine.instance.currentWorld) => enterQuery(world) as Entity[]
  wrappedQuery.exit = (world = Engine.instance.currentWorld) => exitQuery(world) as Entity[]
  return wrappedQuery
}

export type Query = ReturnType<typeof defineQuery>

export const EntityRemovedComponent = createMappedComponent<{}>('EntityRemovedComponent')
