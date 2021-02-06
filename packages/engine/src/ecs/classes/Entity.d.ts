/**
 * Entity Class defines the structure for every entities.\
 * Entity are basic elements of the Entity Component System.
 * Every item in the engine is an Entity and different components will be assigned to them.
 * Hence Entity acts as a container which holds different components.
 */
export declare class Entity {
    /**
     * Unique ID for this instance.
     */
    id: number;
    /**
     * List of component types currently attached to the entity.
     */
    componentTypes: any[];
    /**
     * List of components attached to the entity.
     */
    components: {};
    /**
     * List of component tye to remove at the end of this frame from the entity.
     */
    componentTypesToRemove: any[];
    /**
     * List of components to remove this at the end of frame from the entity.
     */
    componentsToRemove: {};
    /**
     * List of queries this entity is part of.
     */
    queries: any[];
    /**
     * Keep count of our state components for handling entity removal.\
     * System state components live on the entity until the entity is deleted.
     */
    numStateComponents: number;
    /**
     * Constructor is called when component created.\
     * Since {@link ecs/functions/EntityFunctions.addComponent | addComponent()} pulls from the pool, it doesn't invoke constructor.
     */
    constructor();
    /**
     * Default logic for copying entity.
     *
     * @param src - Source entity to copy from.
     * @returns this new entity as a copy of the source.
     */
    copy(src: Entity): Entity;
    /**
     * Default logic for clone entity.
     * @returns new entity as a clone of the source.
     */
    clone(): Entity;
    /**
     * Reset the entity.\
     * Called when entity is returned to pool.
     */
    reset(): void;
}
