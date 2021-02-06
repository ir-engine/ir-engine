import { BehaviorValue } from './BehaviorValue';
/**
 * Interface for Prototype of Entity and Component collection to provide reusability.\
 * Prefab is a pattern for creating an entity and component collection as a prototype
 */
export interface Prefab {
    /** List of Components to be implemented on Entity. */
    localClientComponents?: Array<{
        /** Type of Component. */
        type: any;
        /** State of the Component. */
        data?: any;
    }>;
    /** Call before Creation of Entity from this Prefab. */
    onBeforeCreate?: BehaviorValue[];
    /** Call after Creation of Entity from this Prefab. */
    onAfterCreate?: BehaviorValue[];
    /** Call before destruction of Entity created from this Prefab. */
    onBeforeDestroy?: BehaviorValue[];
    /** Call after destruction of Entity created from this Prefab. */
    onAfterDestroy?: BehaviorValue[];
}
