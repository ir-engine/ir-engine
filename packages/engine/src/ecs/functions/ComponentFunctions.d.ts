/** Functions to provide component level functionalities. */
import { Component } from '../classes/Component';
import { ComponentConstructor } from '../interfaces/ComponentInterfaces';
import { ObjectPool } from '../classes/ObjectPool';
import { NotComponent } from '../classes/System';
/**
 * Use the Not function to negate a component.
 */
export declare function Not<C extends Component<any>>(Component: ComponentConstructor<C>): NotComponent<C>;
/**
 * Make a component read-only.
 */
export declare function wrapImmutableComponent<T>(component: Component<T>): T;
/**
 * Register a component with the engine.\
 * **Note:** This happens automatically if a component is a member of a system query.
 */
export declare function registerComponent<C extends Component<any>>(Component: ComponentConstructor<C>, objectPool?: ObjectPool<C> | false): void;
/**
 * Check if the component has been registered.\
 * Components will autoregister when added to an entity or included as a member of a query, so don't have to check manually.
 */
export declare function hasRegisteredComponent<C extends Component<any>>(Component: ComponentConstructor<C>): boolean;
/**
 * Return the pool containing all of the objects for this component type.
 *
 * @param component Component to get pool. This component's type is used to get the pool.
 */
export declare function getPoolForComponent(component: Component<any>): void;
/**
 * Get a key from a list of components.
 *
 * @param Components Array of components to generate the key.
 */
export declare function queryKeyFromComponents(Components: any[]): string;
/**
 * Check if component is registered.
 */
export declare function componentRegistered(T: any): boolean;
/**
 * Return the name of a component
 */
export declare function getName(Component: any): string;
/**
 * Return a valid property name for the Component
 */
export declare function componentPropertyName(Component: any): string;
