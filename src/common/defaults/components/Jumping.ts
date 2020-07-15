import { Component, Types } from "ecsy"

interface PropTypes {
  t: number
  height: number
  duration: number
}

export default class Jumping extends Component<PropTypes> {
  t: number
  height: number
  duration: number
}

Jumping.schema = {
  t: { type: Types.Number, default: 0 },
  height: { type: Types.Number, default: 0.5 },
  duration: { type: Types.Number, default: 0.5 }
}
