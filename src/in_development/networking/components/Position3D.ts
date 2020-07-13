import { Types, Component } from "ecsy"

export default class Position3D extends Component<any> {
  x: number
  y: number
  z: number
}

//
Position3D.schema = {
  x: { type: Types.Number, default: 0 },
  y: { type: Types.Number, default: 0 },
  z: { type: Types.Number, default: 0 }
}
