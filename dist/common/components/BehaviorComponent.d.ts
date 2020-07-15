import { Component } from "ecsy";
export interface PropTypes<TDataType extends string | number | symbol, TBehaviorMap, TValue> {
    map: TBehaviorMap;
    data: BehaviorMapType<TDataType, TValue>;
}
export default class BehaviorComponent<TDataType extends string | number | symbol, TBehaviorMap, TValue> extends Component<PropTypes<TDataType, TBehaviorMap, TValue>> {
    map: TBehaviorMap;
    data: BehaviorMapType<TDataType, TValue>;
    constructor();
    copy(src: this): this;
    reset(): void;
}
