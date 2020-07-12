import { Component } from "ecsy"

export interface PropTypes<TDataType extends string | number | symbol, TBehaviorMap, TDataValues> {
  behaviorMap: TBehaviorMap
  data: BehaviorData<TDataType, TDataValues>
}

export default class BehaviorComponent<TInputType extends string | number | symbol, TBehaviorMap, TValues> extends Component<
  PropTypes<TInputType, TBehaviorMap, TValues>
> {
  behaviorMap: TBehaviorMap
  data: BehaviorData<TInputType, TValues> = new Map<TInputType, TValues>()
  constructor(props: PropTypes<TInputType, TBehaviorMap, TValues>) {
    super(false)
    if (props.behaviorMap) this.behaviorMap = props.behaviorMap // TODO: ? DefaultBehaviorMap
    this.data = new Map<TInputType, TValues>()
  }
  copy(src: this): this {
    this.behaviorMap = src.behaviorMap
    this.data = new Map(src.data)
    return this
  }
  reset(): void {
    this.data.clear()
  }
}
