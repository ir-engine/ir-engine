import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { BehaviorMapType } from '../types/BehaviorMapType';

export interface PropTypes<TDataType extends string | number | symbol, TBehaviorMap, TValue> {
  schema: TBehaviorMap;
  data: BehaviorMapType<TDataType, TValue>;
}
// Constructs a component with a map and data values
// Data contains a map() of arbitrary data
export class BehaviorComponent<TDataType extends string | number | symbol, BehaviorSchema, TValue> extends Component<
PropTypes<TDataType, BehaviorSchema, TValue>
> {
  schema: BehaviorSchema
  lastData: BehaviorMapType<TDataType, TValue> = new Map<TDataType, TValue>()
  data: BehaviorMapType<TDataType, TValue> = new Map<TDataType, TValue>()
  constructor () {
    super(false);
    this.data = new Map<TDataType, TValue>();
  }

  copy (src: this): this {
    this.schema = src.schema;
    this.data = new Map(src.data);
    return this;
  }

  reset (): void {
    this.data.clear();
  }
}

BehaviorComponent.schema = {
  schema: { type: Types.Ref, default: null},
  data: { type: Types.Ref, default: null}
};
