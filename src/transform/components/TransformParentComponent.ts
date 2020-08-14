import { TransformComponent } from "./TransformComponent"
import { Component } from "../../ecs/classes/Component"
import { Types } from "../../ecs/types/Types"

export class TransformParentComponent extends Component<any> {
  children: TransformComponent[] = []
}
TransformParentComponent.schema = {
  value: { default: [], type: Types.Array }
}
