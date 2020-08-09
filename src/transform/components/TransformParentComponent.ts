import { Component, Types } from "ecsy"
import { TransformComponent } from "./TransformComponent"

export class TransformParentComponent extends Component<any> {
  children: TransformComponent[] = []
}
TransformParentComponent.schema = {
  value: { default: [], type: Types.Array }
}
