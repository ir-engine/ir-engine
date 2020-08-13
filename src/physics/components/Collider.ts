import { Component, Types } from "ecsy"

export class Collider extends Component<any> {}

Collider.schema = {
  mass: { type: Types.Number, default: 0 },
  scale: { type: Types.Number, default: { x: 0.1, y: 0.1, z: 0.1 } },
  type: { type: Types.String, default: "box" }
}
