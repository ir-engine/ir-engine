import { Component } from "../../../src/ecs/classes/Component"
import { Types } from "../../../src/ecs/types/Types"

export class RigidBody extends Component<any> {}

RigidBody.schema = {
  mass: { type: Types.Number, default: 0 },
  scale: { type: Types.Number, default: { x: 0.1, y: 0.1, z: 0.1 } },
  type: { type: Types.String, default: "box" }
}
