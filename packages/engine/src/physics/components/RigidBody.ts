import { Component } from "../../ecs/classes/Component"
import { Types } from "../../ecs/types/Types"

export class RigidBody extends Component<any> {
  mass = 1
  scale = [1, 1, 1]
  type = "box"
}

RigidBody.schema = {
  mass: { type: Types.Number, default: 1 },
  scale: { type: Types.Array, default: [1, 1, 1] },
  type: { type: Types.String, default: "box" }
}
