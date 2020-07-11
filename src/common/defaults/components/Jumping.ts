import { Component, Types } from "ecsy"

interface PropTypes {
  t: number
  height: number
  duration: number
}

export default class Jumping extends Component<PropTypes> {
  t: 0
  height: 0
  duration: 0
}

Jumping.schema = {
  t: { type: Types.Number, default: 0 },
  height: { type: Types.Number, default: 0.5 },
  duration: { type: Types.Number, default: 0.5 }
}
