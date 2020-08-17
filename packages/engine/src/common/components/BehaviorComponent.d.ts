import { Component } from "../../ecs/classes/Component";
import { BehaviorMapType } from "../types/BehaviorMapType";
export interface PropTypes<TDataType extends string | number | symbol, TBehaviorMap, TValue> {
    schema: TBehaviorMap;
    data: BehaviorMapType<TDataType, TValue>;
}
export declare class BehaviorComponent<TDataType extends string | number | symbol, BehaviorSchema, TValue> extends Component<PropTypes<TDataType, BehaviorSchema, TValue>> {
    schema: BehaviorSchema;
    data: BehaviorMapType<TDataType, TValue>;
    constructor();
    copy(src: this): this;
    reset(): void;
}
