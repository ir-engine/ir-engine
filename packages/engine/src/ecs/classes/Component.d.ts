import { ComponentSchema } from '../interfaces/ComponentInterfaces';
/**
 * Components are added to entities to define behavior.\
 * Component functions can be found at {@link ecs/functions/ComponentFunctions | ComponentFunctions}.
 */
export declare class Component<C> {
    /**
     * Defines the attributes and attribute types on the constructed component class.\
     * All component variables should be reflected in the component schema.
     */
    static _schema: ComponentSchema;
    /**
     * The unique ID for this type of component (<C>).
     */
    static _typeId: number;
    /**
     * The pool an individual instantiated component is attached to.
     * Each component type has a pool, pool size is set on engine initialization.
     */
    _pool: any;
    /**
     * The type ID of this component, should be the same as the component's constructed class.
     */
    _typeId: any;
    /**
     * The name of the component instance, derived from the class name.
     */
    name: any;
    /**
     * The "entity" this component is attached to.
     */
    entity: any;
    /**
     * Component class constructor.
     */
    constructor(props?: Partial<Omit<C, keyof Component<any>>> | false);
    /**
     * Default logic for copying component.
     * Each component class can override this.
     *
     * @param source Source Component.
     * @returns this new component as a copy of the source.
     */
    copy(source: any): any;
    /**
     * Default logic for cloning component.
     * Each component class can override this.
     * @returns a new component as a clone of itself.
     */
    clone(): any;
    /**
     * Default logic for resetting attributes to default schema values.
     * Each component class can override this.
     */
    reset(): void;
    /**
     * Put the component back into it's component pool.
     * Called when component is removed from an entity.
     */
    dispose(): void;
    /**
     * Get the name of this component class.
     * Useful for JSON serialization, etc.
     */
    static getName(): string;
    /**
     * Make sure attributes on this component have been defined in the schema
     */
    checkUndefinedAttributes(src: any): void;
}
