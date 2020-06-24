import { Component, Types } from "ecsy"

interface Schema {
  value: {
    default: false
    type: Types["Boolean"]
  }
}

export class Draggable extends Component {
  schema: Schema
}
