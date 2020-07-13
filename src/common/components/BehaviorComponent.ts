import { Component } from "ecsy"

export interface PropTypes<TDataType extends string | number | symbol, TBehaviorMap, TValue> {
  map: TBehaviorMap
  data: BehaviorMapType<TDataType, TValue>
}

export default class BehaviorComponent<TDataType extends string | number | symbol, TBehaviorMap, TValue> extends Component<
  PropTypes<TDataType, TBehaviorMap, TValue>
> {
  map: TBehaviorMap
  data: BehaviorMapType<TDataType, TValue> = new Map<TDataType, TValue>()
  constructor() {
    super(false)
    this.data = new Map<TDataType, TValue>()
  }
  copy(src: this): this {
    this.map = src.map
    this.data = new Map(src.data)
    return this
  }
  reset(): void {
    this.data.clear()
  }
}
