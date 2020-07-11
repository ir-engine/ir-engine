import { Component, Types } from "ecsy"

interface PropTypes<T> {
  data: T
}
export default class DataComponent<T> extends Component<PropTypes<T>> {
  data: T
}

DataComponent.schema = {
  data: { type: Types.Ref }
}
