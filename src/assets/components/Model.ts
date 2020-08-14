import { Component, Types } from "../../ecs"

export class Model extends Component<Model> {}

Model.schema = {
  value: { default: null, type: Types.Ref }
}
