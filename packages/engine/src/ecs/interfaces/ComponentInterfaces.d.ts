import { PropType } from '../types/Types';
import { Component } from '../classes/Component';
/**
 * For getting type and default values from a newly added component
 */
export interface ComponentSchema {
    /** Property of the Component. */
    [propName: string]: {
        /** Checks if the property is default. */
        default?: any;
        /** Defines the type of the property. */
        type: PropType<any, any>;
    };
}
/**
 * Interface for defining new component.
 */
export interface ComponentConstructor<C extends Component<C>> {
    /** Schema for the Component. */
    _schema: ComponentSchema;
    /** Type of the Component. */
    _typeId: any;
    new (props?: Partial<Omit<C, keyof Component<C>>> | false): C;
}
