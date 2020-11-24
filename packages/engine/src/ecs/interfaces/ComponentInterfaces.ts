import { PropType } from '../types/Types';
import { Component } from '../classes/Component';
/**
 * For getting type and default values from a newly added component
 */

export interface ComponentSchema {
  [propName: string]: {
    default?: any;
    type: PropType<any, any>;
  };
}
/**
 * Interface for defining new component
 */

export interface ComponentConstructor<C extends Component<C>> {
  schema: ComponentSchema;
  _typeId: any;
  new(props?: Partial<Omit<C, keyof Component<C>>> | false): C;
}
