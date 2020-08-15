import { Component } from "../../ecs/classes/Component"
import { Types } from "../../ecs/types/Types"

export class ColliderComponent extends Component<ColliderComponent> {
  collider: any
  type: string
  mass: number
  scale = [1, 1, 1]
}

ColliderComponent.schema = {
  collider: { type: Types.Ref, default: null },
  mass: { type: Types.Number, default: 0 },
  scale: { type: Types.Array, default: [1, 1, 1] },
  type: { type: Types.String, default: "box" }
}
