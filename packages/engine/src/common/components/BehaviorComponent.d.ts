import { Component } from '../../ecs/classes/Component';
import { BehaviorMapType } from '../types/BehaviorMapType';
/**
 * Interface for property types of the Behavior Component.
 *
 * @typeparam TDataType Type of Keys in the Behavior map.
 * @typeparam TBehaviorMap Type of the map.
 * @typeparam TValue Type of Values in the Behavior map.
 */
export interface PropTypes<TDataType extends string | number | symbol, TBehaviorMap, TValue> {
    /** Schema for the data. */
    schema: TBehaviorMap;
    data: BehaviorMapType<TDataType, TValue>;
}
/**
 * Constructs a component with a map and data values.\
 * Data contains a Map of arbitrary data.
 *
 * @typeparam TDataType Type of Keys in the Behavior map.
 * @typeparam BehaviorSchema Type of the map.
 * @typeparam TValue Type of Values in the Behavior map.
 */
export declare class BehaviorComponent<TDataType extends string | number | symbol, BehaviorSchema, TValue> extends Component<PropTypes<TDataType, BehaviorSchema, TValue>> {
    /** Behavior Schema of the component. */
    schema: BehaviorSchema;
    /** Holds previous state related data of the component. */
    lastData: BehaviorMapType<TDataType, TValue>;
    /** Holds current state related data of the component. */
    data: BehaviorMapType<TDataType, TValue>;
    /**
     * Constructs a component an empty map.
     */
    constructor();
    /**
     * Make Copy of the given Component.
     * @param src Source Component to make copy.
     *
     * @returns Copied Component.
     */
    copy(src: this): this;
    /** Clear the Component. */
    reset(): void;
}
