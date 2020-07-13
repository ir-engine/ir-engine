import { Types } from "ecsy"
import NetworkedComponent from "./NetworkedComponent"

export default class NetworkedPosition3D extends NetworkedComponent {
  x: number
  y: number
  z: number
  updates: []
}

//
NetworkedPosition3D.schema = {
  x: { type: Types.Number, default: 0 },
  y: { type: Types.Number, default: 0 },
  z: { type: Types.Number, default: 0 },
  updates: { type: Types.Array, default: [] }
}
