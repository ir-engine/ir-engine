import { Component } from '../classes/Component';
import { ComponentConstructor } from '../interfaces/ComponentInterfaces';
import { ObjectPool } from '../classes/ObjectPool';
import { Engine } from '../classes/Engine';
import { NotComponent } from '../classes/System';

const proxyMap = new WeakMap();

const proxyHandler = {
  set (target, prop) {
    throw new Error(
      `Tried to write to "${target.name}#${String(
        prop
      )}" on immutable component. Use .getMutableComponent() to modify a component.`
    );
  }
};

/**
 * Use the Not function to negate a component query.
 */
export function Not<C extends Component<any>>(Component: ComponentConstructor<C>): NotComponent<C> {
  return {
    type: 'not' as const,
    Component: Component
  } as NotComponent<C>;
}

/**
 * Make a component read-only
 */
export function wrapImmutableComponent<T> (component: Component<T>): T {
  if (component === undefined) {
    return undefined;
  }

  let wrappedComponent = proxyMap.get(component);

  if (!wrappedComponent) {
    wrappedComponent = new Proxy(component, proxyHandler);
    proxyMap.set(component, wrappedComponent);
  }

  return <T>wrappedComponent;
}

/**
 * Register a component with the engine
 * Note: This happens automatically if a component is a member of a system query
 */
export function registerComponent<C extends Component<any>> (
  Component: ComponentConstructor<C>,
  objectPool?: ObjectPool<C> | false
): void {
  
  if (Engine.components.includes(Component)) {
    console.warn(`Component type: '${getName(Component)}' already registered.`);
    return;
  }

  const schema = Component._schema;

  if (!schema && (Component as any).type !== undefined && (Component as any).type !== 'not') {
    throw new Error(`Component "${getName(Component)}" has no schema property.`);
  }

  for (const propName in schema) {
    const prop = schema[propName];

    if (!prop.type) {
      throw new Error(`Invalid schema for component "${getName(Component)}". Missing type for "${propName}" property.`);
    }
  }

  Component._typeId = Engine.nextComponentId++;
  Engine.components.push(Component);
  Engine.componentsMap[Component._typeId] = Component;
  Engine.numComponents[Component._typeId] = 0;

  if (objectPool === undefined) {
    objectPool = new ObjectPool(Component);
  } else if (objectPool === false) {
    objectPool = undefined;
  }

  Engine.componentPool[Component._typeId] = objectPool;
}

/**
 * Check if the component has been registered
 * Components will autoregister when added to an entity or included as a member of a query, so you shouldn't need this
 */
export function hasRegisteredComponent<C extends Component<any>> (Component: ComponentConstructor<C>): boolean {
  return Engine.components.includes(Component);
}

/**
 * Return the pool containing all of the objects for this component type
 */
export function getPoolForComponent (component: Component<any>): void {
  Engine.componentPool[component._typeId];
}

/**
 * Get a key from a list of components
 * @param {Array(Component)} Components Array of components to generate the key
 * @private
 */
export function queryKeyFromComponents (Components) {
  const ids = [];
  for (let n = 0; n < Components.length; n++) {
    const T = Components[n];
    if (!componentRegistered(T)) {
      throw new Error('Tried to create a query with an unregistered component');
    }

    if (typeof T === 'object') {
      const operator = T.operator === 'not' ? '!' : T.operator;
      ids.push(operator + T.Component._typeId);
    } else {
      ids.push(T._typeId);
    }
  }

  return ids.sort().join('-');
}

  /**
 * check if component is registered
 */
export function componentRegistered (T) {
  return (typeof T === 'object' && T.Component._typeId !== undefined) || (T._typeId !== undefined);
}

/**
 * Return the name of a component
 * @param {Component} Component
 * @private
 */
export function getName (Component) {
  return Component.getName();
}

/**
 * Return a valid property name for the Component
 * @param {Component} Component
 * @private
 */
export function componentPropertyName (Component) {
  return getName(Component);
}
