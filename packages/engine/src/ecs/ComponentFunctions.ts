import * as bitECS from 'bitecs'
import { Entity } from './Entity'
import { useWorld } from './SystemHooks'

export const ComponentMap = new Map<string, ComponentType<any>>()

// TODO: benchmark map vs array for componentMap
/**
* Create a mapped component.
* Define the component.
* Add the component to the ComponentMap.
* Return the mapped component.
* @param name - Name of the component.
* @param schema - Schema of the component.
* @return {@link MappedComponent}
* @internal
*/
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

/**
* A proxy for a schema.
* It has a property for each key in the schema.
* If the property is a number, it is the index of the property in the schema.
* If the property is a RT, it is the RT of the property in the schema.
* If the property is an Array of numbers, it is the indices of the properties in the schema.
* If the property is a SoAProxy, it is a proxy for the schema.
* If the property is unknown, it is not a part of the schema.
* @internal
*/
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

/**
* A component that is mapped to a different component.
* The mapped component is a ComponentType.
* The mapped component has a getter, setter, and a delete method.
* The mapped component has a getter that returns the mapped component.
* The mapped component has a setter that sets the mapped component.
* The mapped component has a delete method that deletes the mapped component.
* @param T - Type of the mapped component.
* @param S - Type of the schema of the mapped component.
* @internal
*/
export type MappedComponent<T, S extends bitECS.ISchema> = bitECS.ComponentType<S> & {
  get: (entity: number) => T & SoAProxy<S>
  set: (entity: number, value: T & SoAProxy<S>) => void
  delete: (entity: number) => void
}
/**
* A component constructor.
* A component constructor is a MappedComponent that has a type property.
* The type property is a string that is the name of the type of the component.
* The type property is optional. If it is not specified, it will be inferred from the type of the component.
* The type property is used toexport type ComponentConstructor<T, S extends bitECS.ISchema> = MappedComponent<T, S>
*/
export type ComponentConstructor<T, S extends bitECS.ISchema> = MappedComponent<T, S>

/**
* Type of a component.
* It's a generic type that takes the type of the mapped component as a generic parameter.
* It's a generic type that returns the type of the mapped component.
* It's a generic type that takes the type of the mapped component as a generic parameter.
* It's a generic type that returns the type of the mappedexport type ComponentType<C extends MappedComponent<any, any>> = ReturnType<C['get']>
*/
export type ComponentType<C extends MappedComponent<any, any>> = ReturnType<C['get']>

/**
* Get a component from an entity.
* If the entity is undefined, throw an error.
* If the component is undefined, return the component.
* If the component is removed, return undefined.
* If the component is not removed, return the component.
* @param entity - Entity.
* @param component - Component.
* @param world - World.
* @return {@link SoAProxy}
* @internal
*/
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

/**
* Add a component to an entity.
* If the entity is undefined, throw an error.
* Add the component to the world.
* If the component has a schema, iterate over its keys and set the value of the component to the value of the key.
* Remove the component from the world.
* Set the component on the entity.
* Return the component.
* @param entity - Entity to add the component to.
* @param component - Component to add to the entity.
* @param args - Arguments to pass to the component.
* @param world - World to add the component to.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
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
  if (component['_schema']) {
    for (const [key] of Object.entries(component['_schema'] as any)) {
      component[key][entity] = args[key]
    }
  }
  world._removedComponents.get(entity)?.delete(component)
  component.set(entity, args as T & SoAProxy<S>)
  return component.get(entity)
}
	
/**
* Checks if an entity has a component.
* If the entity is undefined, it throws an error.
* If the entity is not undefined, it checks if the component is undefined.
* If the component is undefined, it returns false.
* If the component is not undefined, it checks if the component has the entity.
* If the component has the entity, it returns true.
* If the component does not have the entity, it returns false.
* @param entity - Entity to check for a component.
* @param component - Component to check for an entity.
* @param world - World to use for checking if the entity exists.
* @return {@link boolean} - True if the entity has the component, false otherwise.
* @internal
*/
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

/**
* Remove a component from an entity.
* If the entity is undefined, it throws an error.
* If the component is not attached to the entity, it throws an error.
* If the component is attached to the entity, it removes the component from the entity and sets it to the _removedComponents Map.
* It removes the component from the world.
* @param {Entity} entity - Entity to remove the component from.
* @param {MappedComponent<T, S>} component - Component to remove.
* @param {boolean} [world = useWorld()] - World to use.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
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

/**
* Get all components of a given type.
* Create a query for the component.
* Get all entities in the world.
* Map the entities to the components.>
* @param component - Component type.
* @param world - World to query.
* @return {@link T[]} - Array of components.
* @internal
*/
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

/**
* Get all entities with a given component.
* Define a query for the component.
* Run the query on the world.
* @param component - Component to search for.
* @param world - World to run the query on.
* @return {@link Entity[]} - Entities with the given component.
* @internal
*/
export const getAllEntitiesWithComponent = <T, S extends bitECS.ISchema>(
  component: MappedComponent<T, S>,
  world = useWorld()
): Entity[] => {
  const query = defineQuery([component])
  return query(world)
}

/**
* Remove all components from an entity.
* Get all components of the entity.
* Remove each component.
* @param entity - Entity.
* @param world - World.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
export const removeAllComponents = (entity: Entity, world = useWorld()) => {
  for (const component of bitECS.getEntityComponents(world, entity)) {
    removeComponent(entity, component as MappedComponent<any, any>, world)
  }
}

/**
* Define a query.
* Create a new Query.
* Enter the query.
* Exit the query.
* Wrap the query in a function that returns an array of entities.
* Set the enter and exit functions to the wrapped query.
* Return the wrapped query.
This is a common pattern in Node.
 * @param components - Components of the query.
 * @return {@link Entity[]}
* @internal
*/
export function defineQuery(components: (bitECS.Component | bitECS.QueryModifier)[]) {
  const query = bitECS.defineQuery(components) as bitECS.Query
  const enterQuery = bitECS.enterQuery(query)
  const exitQuery = bitECS.exitQuery(query)
  const wrappedQuery = (world = useWorld()) => query(world) as Entity[]
  wrappedQuery.enter = (world = useWorld()) => enterQuery(world) as Entity[]
  wrappedQuery.exit = (world = useWorld()) => exitQuery(world) as Entity[]
  return wrappedQuery
}

/**
* A query that returns a value.
* @param {string} type - Type of the query.
*/
export type Query = ReturnType<typeof defineQuery>
