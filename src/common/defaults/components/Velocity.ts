import { Component, Types } from "ecsy"

interface PropTypes {
  x: number
  y: number
  z: number
}

export default class Velocity extends Component<PropTypes> {
  x: 0
  y: 0
  z: 0
}

Velocity.schema = {
  x: { type: Types.Number, default: 0 },
  y: { type: Types.Number, default: 0 },
  z: { type: Types.Number, default: 0 }
}
