/** Functions to provide entity level functionalities. */
import { Component } from '../classes/Component';
import { ComponentConstructor } from '../interfaces/ComponentInterfaces';
import { Entity } from '../classes/Entity';
/**
 * Get direct access to component data to modify.\
 * This will add the entity to any querying system's onChanged result.
 *
 * @param entity Entity.
 * @param component Type of component.
 */
export declare function getMutableComponent<C extends Component<C>>(entity: Entity, Component: ComponentConstructor<C>): C;
/**
 * Get a component that has been removed from the entity but hasn't been removed this frame.\
 * This will only work if {@link ecs/classes/Engine.Engine.deferredRemovalEnabled | Engine.deferredRemovalEnabled } is true in the engine (it is by default).
 *
 * @param entity Entity.
 * @param component Type of component to be removed.
 *
 * @returns Removed component from the entity which hasn't been removed this frame.
 */
export declare function getRemovedComponent<C extends Component<C>>(entity: Entity, Component: ComponentConstructor<C>): Readonly<C>;
/**
 * @param entity Entity to get components.
 * @returns An object with all components on the entity, keyed by component name.
 */
export declare function getComponents(entity: Entity): {
    [componentName: string]: ComponentConstructor<any>;
};
/**
 * @param entity Entity to get removed component.
 * @returns All components that are going to be removed from the entity and sent back to the pool at the end of this frame.
 */
export declare function getComponentsToRemove(entity: Entity): {
    [componentName: string]: ComponentConstructor<any>;
};
/**
 * @param entity Entity to get component types.
 * @returns An array of component types on this entity.
 */
export declare function getComponentTypes(entity: Entity): Array<Component<any>>;
/**
 * Add a component to an entity.
 *
 * @param entity Entity.
 * @param Component Type of component which will be added.
 * @param values values to be passed to the component constructor.
 * @returns The component added to the entity.
 */
export declare function addComponent<C extends Component<C>>(entity: Entity, Component: ComponentConstructor<C>, values?: Partial<Omit<C, keyof Component<C>>>): Component<C>;
/**
 * Remove a component from an entity.
 *
 * @param entity Entity.
 * @param Component Type of component which will be removed.
 * @param forceImmediate Remove immediately or wait for the frame to complete.
 * @returns The component removed from the entity (you probably don't need this).
 */
export declare function removeComponent<C extends Component<C>>(entity: Entity, Component: ComponentConstructor<C>, forceImmediate?: boolean): Component<C>;
/**
 * Check if an entity has a component type.
 * @param entity Entity being checked.
 * @param Components Type of components to check.
 * @param includeRemoved Also check in {@link ecs/classes/Entity.Entity.componentTypesToRemove | Entity.componentTypesToRemove}.
 * @returns True if the entity has the component.
 */
export declare function hasComponent<C extends Component<C>>(entity: Entity, Component: ComponentConstructor<C>, includeRemoved?: boolean): boolean;
/**
 * Check if an entity had a component type removed this frame.
 * @param entity Entity.
 * @param Components Type of components to check.
 * @returns True if the entity had the component removed this frame.
 */
export declare function hasRemovedComponent<C extends Component<any>>(entity: Entity, Component: ComponentConstructor<C>): boolean;
/**
 * Check if an entity has aall component types in an array.
 * @param entity Entity
 * @param Components Type of components to check.
 * @returns True if the entity has all components.
 */
export declare function hasAllComponents(entity: Entity, Components: Array<ComponentConstructor<any>>): boolean;
/**
 * Check if an entity has any of the component types in an array.
 *
 * @param entity Entity.
 * @param Components Type of components to check.
 * @returns True if the entity has any of the components.
 */
export declare function hasAnyComponents(entity: Entity, Components: Array<ComponentConstructor<any>>): boolean;
/**
 * Create a new entity.
 * @returns Newly created entity.
 */
export declare function createEntity(): Entity;
/**
 * Remove the entity from the simulation and return it to the pool.
 *
 * @param entity Entity which will be removed.
 * @param immediately Remove immediately or wait for the frame to complete.
 */
export declare function removeEntity(entity: Entity, immediately?: boolean): void;
/**
 * Remove all components from an entity.
 *
 * @param entity Entity whose components will be removed.
 * @param immediately Remove immediately or wait for the frame to complete.
 */
export declare function removeAllComponents(entity: Entity, immediately?: boolean): void;
/**
 * Remove all entities from the simulation.
 */
export declare function removeAllEntities(): void;
/**
 * Get a component from the entity
 *
 * @param entity Entity to be searched.
 * @param component Type of the component to be returned.
 * @param includeRemoved Include Components from {@link ecs/classes/Entity.Entity.componentsToRemove | Entity.componentsToRemove}.
 * @returns Component.
 */
export declare function getComponent<C extends Component<C>>(entity: Entity, component: ComponentConstructor<C>, includeRemoved?: boolean): Readonly<C>;
